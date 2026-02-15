// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVault} from "./interfaces/IVault.sol";
import {IVaultToken} from "./interfaces/IVaultToken.sol";
import {IOrchestrator} from "./interfaces/IOrchestrator.sol";
import {VaultToken} from "./VaultToken.sol";

/**
 * @title Vault
 * @notice Core vault logic for Token Vault Launcher
 * @dev Manages deposits, withdrawals, yield distribution, and factor calculation
 * 
 * IMPORTANT: All calculations round DOWN (floor) in favor of the vault.
 * Initial capital is only touched when F% < 100%.
 */
contract Vault is IVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PRECISION = 1e18;

    // ============ Immutables ============

    /// @notice The deposit asset (e.g., USDC)
    IERC20 public immutable depositAsset;
    
    /// @notice The vault token
    IVaultToken public immutable vaultToken;
    
    /// @notice The yield orchestrator
    IOrchestrator public immutable orchestrator;
    
    /// @notice Maximum raise cap
    uint256 public immutable cap;
    
    /// @notice Timestamp when withdrawals unlock
    uint256 public immutable unlockTimestamp;
    
    /// @notice Initial discount factor in basis points (e.g., 8000 = 80%)
    uint256 public immutable initialFactorBps;
    
    /// @notice Project fee share of yield in basis points
    uint256 public immutable projectFeeBps;
    
    /// @notice Platform fee share of yield in basis points
    uint256 public immutable platformFeeBps;
    
    /// @notice Project wallet for fee distribution
    address public immutable projectWallet;
    
    /// @notice Platform wallet for fee distribution
    address public immutable platformWallet;
    
    /// @notice Curve type for factor evolution
    CurveType public immutable curveType;

    // ============ State ============

    /// @notice Total Value Locked in the vault
    uint256 public tvl;
    
    /// @notice Circulating supply of vault tokens (decreases on burn)
    uint256 public circulatingSupply;
    
    /// @notice Total tokens ever minted (for curve calculation)
    uint256 public totalMinted;
    
    /// @notice Total tokens withdrawn/burned (for curve calculation)
    uint256 public totalWithdrawn;
    
    /// @notice Current discount factor in basis points
    uint256 public currentFactorBps;

    // ============ Errors ============

    error CapExceeded();
    error WithdrawalsLocked();
    error InsufficientBalance();
    error ZeroAmount();

    // ============ Constructor ============

    /**
     * @notice Creates a new vault
     * @param _depositAsset The asset to deposit (e.g., USDC)
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _orchestrator Yield orchestrator address
     * @param _cap Maximum raise amount
     * @param _unlockTimestamp When withdrawals become available
     * @param _initialFactorBps Initial discount factor (basis points)
     * @param _projectFeeBps Project fee share (basis points)
     * @param _platformFeeBps Platform fee share (basis points)
     * @param _projectWallet Project fee recipient
     * @param _platformWallet Platform fee recipient
     * @param _curveType LINEAR or EXPONENTIAL
     */
    constructor(
        address _depositAsset,
        string memory _name,
        string memory _symbol,
        address _orchestrator,
        uint256 _cap,
        uint256 _unlockTimestamp,
        uint256 _initialFactorBps,
        uint256 _projectFeeBps,
        uint256 _platformFeeBps,
        address _projectWallet,
        address _platformWallet,
        CurveType _curveType
    ) {
        depositAsset = IERC20(_depositAsset);
        vaultToken = new VaultToken(_name, _symbol, address(this));
        orchestrator = IOrchestrator(_orchestrator);
        cap = _cap;
        unlockTimestamp = _unlockTimestamp;
        initialFactorBps = _initialFactorBps;
        currentFactorBps = _initialFactorBps;
        projectFeeBps = _projectFeeBps;
        platformFeeBps = _platformFeeBps;
        projectWallet = _projectWallet;
        platformWallet = _platformWallet;
        curveType = _curveType;
    }

    // ============ External Functions ============

    /**
     * @notice Deposit assets and receive vault tokens 1:1
     * @param amount Amount of deposit asset to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (tvl + amount > cap) revert CapExceeded();

        // Transfer deposit asset from user
        depositAsset.safeTransferFrom(msg.sender, address(this), amount);

        // Approve and deposit to orchestrator
        depositAsset.approve(address(orchestrator), amount);
        orchestrator.deposit(amount);

        // Mint vault tokens 1:1
        vaultToken.mint(msg.sender, amount);

        // Update state
        tvl += amount;
        circulatingSupply += amount;
        totalMinted += amount;

        emit Deposited(msg.sender, amount, amount);
    }

    /**
     * @notice Withdraw by burning vault tokens
     * @dev Payout = (TVL / supply) × tokens × F%
     *      All math rounds DOWN in favor of vault
     * @param tokenAmount Amount of vault tokens to burn
     */
    function withdraw(uint256 tokenAmount) external nonReentrant {
        if (tokenAmount == 0) revert ZeroAmount();
        if (block.timestamp < unlockTimestamp) revert WithdrawalsLocked();
        if (vaultToken.balanceOf(msg.sender) < tokenAmount) revert InsufficientBalance();

        // Calculate payout: (tvl * tokens * factor) / (supply * BPS_DENOMINATOR)
        // Rounds DOWN naturally due to integer division
        uint256 payout = _calculatePayout(tokenAmount);

        // Update state BEFORE external calls
        uint256 oldFactor = currentFactorBps;
        circulatingSupply -= tokenAmount;
        totalWithdrawn += tokenAmount;
        tvl -= payout;

        // Recalculate factor
        _updateFactor();

        // Burn tokens
        vaultToken.burn(msg.sender, tokenAmount);

        // Withdraw from orchestrator and transfer to user
        orchestrator.withdraw(payout);
        depositAsset.safeTransfer(msg.sender, payout);

        emit Withdrawn(msg.sender, tokenAmount, payout, currentFactorBps);
        
        if (currentFactorBps != oldFactor) {
            emit FactorUpdated(oldFactor, currentFactorBps);
        }
    }

    /**
     * @notice Harvest yield from orchestrator and distribute
     * @dev Anyone can call this (permissionless)
     */
    function harvestYield() external nonReentrant {
        uint256 yieldAmount = orchestrator.getYieldBalanceOnAssets();
        if (yieldAmount == 0) return;

        // Withdraw yield from orchestrator
        orchestrator.withdrawYield(address(this), yieldAmount);

        // Calculate fee splits (rounds DOWN for fees)
        uint256 platformShare = (yieldAmount * platformFeeBps) / BPS_DENOMINATOR;
        uint256 projectShare = (yieldAmount * projectFeeBps) / BPS_DENOMINATOR;
        uint256 treasuryShare = yieldAmount - platformShare - projectShare;

        // Distribute fees
        if (platformShare > 0) {
            depositAsset.safeTransfer(platformWallet, platformShare);
        }
        if (projectShare > 0) {
            depositAsset.safeTransfer(projectWallet, projectShare);
        }

        // Treasury share goes back to TVL
        if (treasuryShare > 0) {
            depositAsset.approve(address(orchestrator), treasuryShare);
            orchestrator.deposit(treasuryShare);
            tvl += treasuryShare;
        }

        emit YieldHarvested(yieldAmount, platformShare, projectShare, treasuryShare);
    }

    /**
     * @notice Permissionless factor recalculation
     */
    function recalculateFactor() external {
        uint256 oldFactor = currentFactorBps;
        _updateFactor();
        if (currentFactorBps != oldFactor) {
            emit FactorUpdated(oldFactor, currentFactorBps);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get total value locked
     */
    function getTVL() external view returns (uint256) {
        return tvl;
    }

    /**
     * @notice Get circulating supply of vault tokens
     */
    function getCirculatingSupply() external view returns (uint256) {
        return circulatingSupply;
    }

    /**
     * @notice Get current discount factor in basis points
     */
    function getCurrentFactor() external view returns (uint256) {
        return currentFactorBps;
    }

    /**
     * @notice Preview withdrawal amount for given tokens
     * @param tokenAmount Amount of tokens to burn
     * @return payout Amount of deposit asset to receive
     */
    function previewWithdraw(uint256 tokenAmount) external view returns (uint256) {
        return _calculatePayout(tokenAmount);
    }

    /**
     * @notice Get value per token (TVL / supply)
     * @return Value in deposit asset terms (scaled by PRECISION)
     */
    function getValuePerToken() external view returns (uint256) {
        if (circulatingSupply == 0) return PRECISION;
        return (tvl * PRECISION) / circulatingSupply;
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate payout for withdrawal
     * @dev payout = (tvl * tokens * factor) / (supply * BPS_DENOMINATOR)
     *      Rounds DOWN naturally due to integer division
     */
    function _calculatePayout(uint256 tokenAmount) internal view returns (uint256) {
        if (circulatingSupply == 0) return 0;
        
        // Using larger intermediate to avoid overflow
        // payout = (tvl * tokenAmount * currentFactorBps) / (circulatingSupply * BPS_DENOMINATOR)
        return (tvl * tokenAmount * currentFactorBps) / (circulatingSupply * BPS_DENOMINATOR);
    }

    /**
     * @notice Update factor based on curve type
     * @dev LINEAR: factor increases linearly with withdrawals
     *      EXPONENTIAL: factor increases exponentially (slower early, faster late)
     */
    function _updateFactor() internal {
        if (totalMinted == 0) return;

        // withdrawnRatio = totalWithdrawn / totalMinted (scaled by BPS)
        uint256 withdrawnRatioBps = (totalWithdrawn * BPS_DENOMINATOR) / totalMinted;

        // Max factor is 12000 (120%)
        uint256 maxFactorBps = 12000;
        uint256 factorRange = maxFactorBps - initialFactorBps;

        if (curveType == CurveType.LINEAR) {
            // LINEAR: factor = initial + range * (withdrawn / total)
            currentFactorBps = initialFactorBps + (factorRange * withdrawnRatioBps) / BPS_DENOMINATOR;
        } else {
            // EXPONENTIAL: factor = initial + range * (withdrawn / total)²
            uint256 ratioSquared = (withdrawnRatioBps * withdrawnRatioBps) / BPS_DENOMINATOR;
            currentFactorBps = initialFactorBps + (factorRange * ratioSquared) / BPS_DENOMINATOR;
        }

        // Clamp to max
        if (currentFactorBps > maxFactorBps) {
            currentFactorBps = maxFactorBps;
        }
    }
}
