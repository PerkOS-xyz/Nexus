// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVault} from "./interfaces/IVault.sol";
import {IVaultToken} from "./interfaces/IVaultToken.sol";
import {IERC4626} from "./interfaces/IERC4626.sol";
import {VaultToken} from "./VaultToken.sol";

/**
 * @title Vault
 * @notice Core vault logic for Token Vault Launcher
 * @dev Integrates directly with Yearn V3 vaults via ERC-4626
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
    
    /// @notice The Yearn V3 vault (ERC-4626)
    IERC4626 public immutable yieldVault;
    
    /// @notice Maximum raise cap (in deposit asset units)
    uint256 public immutable cap;
    
    /// @notice Maximum token supply to issue
    uint256 public immutable maxTokenSupply;
    
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

    /// @notice Total principal deposited (in asset units)
    uint256 public totalPrincipal;
    
    /// @notice Total shares held in yield vault
    uint256 public totalShares;
    
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
     * @param _yieldVault Yearn V3 vault address (ERC-4626)
     * @param _cap Maximum raise amount
     * @param _maxTokenSupply Total tokens to issue (tokenPrice = cap / maxTokenSupply)
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
        address _yieldVault,
        uint256 _cap,
        uint256 _maxTokenSupply,
        uint256 _unlockTimestamp,
        uint256 _initialFactorBps,
        uint256 _projectFeeBps,
        uint256 _platformFeeBps,
        address _projectWallet,
        address _platformWallet,
        CurveType _curveType
    ) {
        depositAsset = IERC20(_depositAsset);
        uint8 assetDecimals = IERC20Metadata(_depositAsset).decimals();
        vaultToken = new VaultToken(_name, _symbol, address(this), assetDecimals);
        yieldVault = IERC4626(_yieldVault);
        cap = _cap;
        maxTokenSupply = _maxTokenSupply;
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
     * @notice Deposit assets and receive vault tokens based on token price
     * @dev tokensToMint = amount * maxTokenSupply / cap
     * @param amount Amount of deposit asset to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (totalPrincipal + amount > cap) revert CapExceeded();

        // Transfer deposit asset from user
        depositAsset.safeTransferFrom(msg.sender, address(this), amount);

        // Approve and deposit to Yearn vault
        depositAsset.approve(address(yieldVault), amount);
        uint256 sharesReceived = yieldVault.deposit(amount, address(this));

        // Track shares received
        totalShares += sharesReceived;
        totalPrincipal += amount;

        // Calculate tokens to mint: amount * maxTokenSupply / cap
        // This gives tokenPrice = cap / maxTokenSupply
        uint256 tokensToMint = (amount * maxTokenSupply) / cap;
        
        // Mint vault tokens
        vaultToken.mint(msg.sender, tokensToMint);

        // Update state
        circulatingSupply += tokensToMint;
        totalMinted += tokensToMint;

        emit Deposited(msg.sender, amount, tokensToMint);
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

        // Calculate current TVL (value of our shares in the yield vault)
        uint256 currentTVL = yieldVault.convertToAssets(totalShares);

        // Calculate payout: (tvl * tokens * factor) / (supply * BPS_DENOMINATOR)
        // Rounds DOWN naturally due to integer division
        uint256 payout = (currentTVL * tokenAmount * currentFactorBps) / (circulatingSupply * BPS_DENOMINATOR);

        // Calculate shares to redeem (proportional to payout vs total value)
        uint256 sharesToRedeem = yieldVault.convertToShares(payout);
        
        // Ensure we don't try to redeem more than we have
        if (sharesToRedeem > totalShares) {
            sharesToRedeem = totalShares;
            payout = yieldVault.convertToAssets(sharesToRedeem);
        }

        // Update state BEFORE external calls
        uint256 oldFactor = currentFactorBps;
        circulatingSupply -= tokenAmount;
        totalWithdrawn += tokenAmount;
        totalShares -= sharesToRedeem;
        
        // Reduce principal proportionally
        uint256 principalReduction = (totalPrincipal * tokenAmount) / (circulatingSupply + tokenAmount);
        totalPrincipal -= principalReduction;

        // Recalculate factor
        _updateFactor();

        // Burn tokens
        vaultToken.burn(msg.sender, tokenAmount);

        // Withdraw from Yearn vault
        uint256 assetsReceived = yieldVault.redeem(sharesToRedeem, address(this), address(this));
        
        // Transfer to user (use actual received amount for safety)
        depositAsset.safeTransfer(msg.sender, assetsReceived);

        emit Withdrawn(msg.sender, tokenAmount, assetsReceived, currentFactorBps);
        
        if (currentFactorBps != oldFactor) {
            emit FactorUpdated(oldFactor, currentFactorBps);
        }
    }

    /**
     * @notice Harvest yield from Yearn vault and distribute
     * @dev Anyone can call this (permissionless)
     */
    function harvestYield() external nonReentrant {
        // Calculate current value vs principal
        uint256 currentValue = yieldVault.convertToAssets(totalShares);
        if (currentValue <= totalPrincipal) return; // No yield
        
        uint256 yieldAmount = currentValue - totalPrincipal;

        // Convert yield to shares and redeem
        uint256 yieldShares = yieldVault.convertToShares(yieldAmount);
        if (yieldShares == 0) return;
        
        uint256 assetsReceived = yieldVault.redeem(yieldShares, address(this), address(this));
        totalShares -= yieldShares;

        // Calculate fee splits (rounds DOWN for fees)
        uint256 platformShare = (assetsReceived * platformFeeBps) / BPS_DENOMINATOR;
        uint256 projectShare = (assetsReceived * projectFeeBps) / BPS_DENOMINATOR;
        uint256 treasuryShare = assetsReceived - platformShare - projectShare;

        // Distribute fees
        if (platformShare > 0) {
            depositAsset.safeTransfer(platformWallet, platformShare);
        }
        if (projectShare > 0) {
            depositAsset.safeTransfer(projectWallet, projectShare);
        }

        // Treasury share goes back to yield vault (increases TVL)
        if (treasuryShare > 0) {
            depositAsset.approve(address(yieldVault), treasuryShare);
            uint256 newShares = yieldVault.deposit(treasuryShare, address(this));
            totalShares += newShares;
            totalPrincipal += treasuryShare; // This yield is now part of principal
        }

        emit YieldHarvested(assetsReceived, platformShare, projectShare, treasuryShare);
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
     * @notice Get total value locked (current value of shares)
     */
    function getTVL() external view returns (uint256) {
        return yieldVault.convertToAssets(totalShares);
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
     * @notice Get total principal deposited
     */
    function getTotalPrincipal() external view returns (uint256) {
        return totalPrincipal;
    }

    /**
     * @notice Get accumulated yield (TVL - principal)
     */
    function getAccumulatedYield() external view returns (uint256) {
        uint256 currentValue = yieldVault.convertToAssets(totalShares);
        return currentValue > totalPrincipal ? currentValue - totalPrincipal : 0;
    }

    /**
     * @notice Preview withdrawal amount for given tokens
     * @param tokenAmount Amount of tokens to burn
     * @return payout Amount of deposit asset to receive
     */
    function previewWithdraw(uint256 tokenAmount) external view returns (uint256) {
        if (circulatingSupply == 0) return 0;
        uint256 currentTVL = yieldVault.convertToAssets(totalShares);
        return (currentTVL * tokenAmount * currentFactorBps) / (circulatingSupply * BPS_DENOMINATOR);
    }

    /**
     * @notice Get value per token (TVL / supply)
     * @return Value in deposit asset terms (scaled by PRECISION)
     */
    function getValuePerToken() external view returns (uint256) {
        if (circulatingSupply == 0) return PRECISION;
        uint256 currentTVL = yieldVault.convertToAssets(totalShares);
        return (currentTVL * PRECISION) / circulatingSupply;
    }

    /**
     * @notice Get token price (cap / maxTokenSupply)
     * @return Price in deposit asset units (scaled by PRECISION)
     */
    function getTokenPrice() external view returns (uint256) {
        return (cap * PRECISION) / maxTokenSupply;
    }

    /**
     * @notice Get maximum token supply
     */
    function getMaxTokenSupply() external view returns (uint256) {
        return maxTokenSupply;
    }

    // ============ Internal Functions ============

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
