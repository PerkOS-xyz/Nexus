// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVault
 * @notice Interface for the Token Vault Launcher vault
 */
interface IVault {
    // Enums
    enum CurveType { LINEAR, EXPONENTIAL }

    // Events
    event Deposited(address indexed user, uint256 amount, uint256 tokensMinted);
    event Withdrawn(address indexed user, uint256 tokens, uint256 payout, uint256 newFactor);
    event FactorUpdated(uint256 oldFactor, uint256 newFactor);
    event YieldHarvested(uint256 total, uint256 platform, uint256 project, uint256 treasury);

    // Core functions
    function deposit(uint256 amount) external;
    function withdraw(uint256 tokenAmount) external;
    function harvestYield() external;
    function recalculateFactor() external;

    // View functions
    function getTVL() external view returns (uint256);
    function getCirculatingSupply() external view returns (uint256);
    function getCurrentFactor() external view returns (uint256);
    function previewWithdraw(uint256 tokenAmount) external view returns (uint256);
    function getValuePerToken() external view returns (uint256);
}
