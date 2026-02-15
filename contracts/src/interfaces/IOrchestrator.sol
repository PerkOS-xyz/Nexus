// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOrchestrator
 * @notice Interface for yield orchestrator integration (e.g., Yearn V3)
 */
interface IOrchestrator {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256 received);
    function withdrawYield(address to, uint256 amountInAssets) external;
    function getAccountBalanceOnAssets(address user) external view returns (uint256);
    function getYieldBalanceOnAssets() external view returns (uint256);
    function getRawBalanceOnAssets() external view returns (uint256);
}
