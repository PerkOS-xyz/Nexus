// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IERC4626
 * @notice Minimal ERC-4626 Tokenized Vault interface for Yearn V3 integration
 */
interface IERC4626 is IERC20 {
    /// @notice Returns the address of the underlying asset
    function asset() external view returns (address);

    /// @notice Returns the total assets held by the vault
    function totalAssets() external view returns (uint256);

    /// @notice Converts assets to shares
    function convertToShares(uint256 assets) external view returns (uint256);

    /// @notice Converts shares to assets
    function convertToAssets(uint256 shares) external view returns (uint256);

    /// @notice Maximum deposit allowed for receiver
    function maxDeposit(address receiver) external view returns (uint256);

    /// @notice Preview shares for a deposit
    function previewDeposit(uint256 assets) external view returns (uint256);

    /// @notice Deposit assets and receive shares
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    /// @notice Maximum mint allowed for receiver
    function maxMint(address receiver) external view returns (uint256);

    /// @notice Preview assets needed for minting shares
    function previewMint(uint256 shares) external view returns (uint256);

    /// @notice Mint shares by depositing assets
    function mint(uint256 shares, address receiver) external returns (uint256 assets);

    /// @notice Maximum withdraw allowed for owner
    function maxWithdraw(address owner) external view returns (uint256);

    /// @notice Preview shares burned for withdrawal
    function previewWithdraw(uint256 assets) external view returns (uint256);

    /// @notice Withdraw assets by burning shares
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);

    /// @notice Maximum redeem allowed for owner
    function maxRedeem(address owner) external view returns (uint256);

    /// @notice Preview assets received for redeeming shares
    function previewRedeem(uint256 shares) external view returns (uint256);

    /// @notice Redeem shares for assets
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);

    /// @notice Emitted on deposit
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);

    /// @notice Emitted on withdraw
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
}
