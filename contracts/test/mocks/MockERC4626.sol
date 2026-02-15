// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "../../src/interfaces/IERC4626.sol";

/**
 * @title MockERC4626
 * @notice Mock ERC-4626 vault for testing (simulates yield generation)
 */
contract MockERC4626 is ERC20, IERC4626 {
    IERC20 public immutable _asset;
    
    uint256 public mockYieldMultiplier = 1e18; // 1:1 initially

    constructor(address asset_) ERC20("Mock Yield Vault", "mYV") {
        _asset = IERC20(asset_);
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }

    function totalAssets() public view override returns (uint256) {
        return (_asset.balanceOf(address(this)) * mockYieldMultiplier) / 1e18;
    }

    function convertToShares(uint256 assets) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return assets;
        return (assets * supply * 1e18) / (totalAssets() * 1e18);
    }

    function convertToAssets(uint256 shares) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    function maxDeposit(address) external pure override returns (uint256) {
        return type(uint256).max;
    }

    function previewDeposit(uint256 assets) external view override returns (uint256) {
        return convertToShares(assets);
    }

    function deposit(uint256 assets, address receiver) external override returns (uint256 shares) {
        shares = convertToShares(assets);
        if (totalSupply() == 0) shares = assets; // First deposit is 1:1
        
        _asset.transferFrom(msg.sender, address(this), assets);
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function maxMint(address) external pure override returns (uint256) {
        return type(uint256).max;
    }

    function previewMint(uint256 shares) external view override returns (uint256) {
        return convertToAssets(shares);
    }

    function mint(uint256 shares, address receiver) external override returns (uint256 assets) {
        assets = convertToAssets(shares);
        if (totalSupply() == 0) assets = shares;
        
        _asset.transferFrom(msg.sender, address(this), assets);
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function maxWithdraw(address owner) external view override returns (uint256) {
        return convertToAssets(balanceOf(owner));
    }

    function previewWithdraw(uint256 assets) external view override returns (uint256) {
        return convertToShares(assets);
    }

    function withdraw(uint256 assets, address receiver, address owner) external override returns (uint256 shares) {
        shares = convertToShares(assets);
        
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "ERC4626: withdraw exceeds allowance");
                _approve(owner, msg.sender, allowed - shares);
            }
        }
        
        _burn(owner, shares);
        _asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    function maxRedeem(address owner) external view override returns (uint256) {
        return balanceOf(owner);
    }

    function previewRedeem(uint256 shares) external view override returns (uint256) {
        return convertToAssets(shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external override returns (uint256 assets) {
        assets = convertToAssets(shares);
        
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "ERC4626: redeem exceeds allowance");
                _approve(owner, msg.sender, allowed - shares);
            }
        }
        
        _burn(owner, shares);
        _asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    // ============ Test Helpers ============

    /// @notice Simulate yield accrual by increasing the value of shares
    /// @param yieldBps Yield in basis points (e.g., 100 = 1%)
    function addMockYield(uint256 yieldBps) external {
        mockYieldMultiplier = mockYieldMultiplier * (10000 + yieldBps) / 10000;
    }

    /// @notice Set exact multiplier for precise testing
    function setYieldMultiplier(uint256 multiplier) external {
        mockYieldMultiplier = multiplier;
    }
}
