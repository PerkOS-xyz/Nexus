// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOrchestrator} from "../../src/interfaces/IOrchestrator.sol";

/**
 * @title MockOrchestrator
 * @notice Mock orchestrator for testing (simulates yield generation)
 */
contract MockOrchestrator is IOrchestrator {
    IERC20 public immutable asset;
    
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;
    uint256 public mockYield;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function deposit(uint256 amount) external {
        asset.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalDeposits += amount;
    }

    function withdraw(uint256 amount) external returns (uint256) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        asset.transfer(msg.sender, amount);
        return amount;
    }

    function withdrawYield(address to, uint256 amountInAssets) external {
        require(amountInAssets <= mockYield, "Insufficient yield");
        mockYield -= amountInAssets;
        asset.transfer(to, amountInAssets);
    }

    function getAccountBalanceOnAssets(address user) external view returns (uint256) {
        return balances[user];
    }

    function getYieldBalanceOnAssets() external view returns (uint256) {
        return mockYield;
    }

    function getRawBalanceOnAssets() external view returns (uint256) {
        return totalDeposits + mockYield;
    }

    // Test helper: simulate yield accrual
    function addMockYield(uint256 amount) external {
        mockYield += amount;
    }
}
