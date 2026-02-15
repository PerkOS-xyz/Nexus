// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVault} from "./IVault.sol";

/**
 * @title IVaultFactory
 * @notice Interface for the vault factory that deploys vault + token pairs
 */
interface IVaultFactory {
    struct VaultConfig {
        string name;              // Token name
        string symbol;            // Token symbol
        address depositAsset;     // e.g., USDC
        uint256 cap;              // Maximum raise amount (in deposit asset units)
        uint256 maxTokenSupply;   // Total tokens to issue (tokenPrice = cap / maxTokenSupply)
        uint256 unlockTimestamp;  // When exits become available
        uint256 initialFactorBps; // Initial discount factor (e.g., 8000 = 80%)
        uint256 projectFeeBps;    // Project share of yield (basis points)
        address projectWallet;    // Receives project fees
        address yieldVault;       // Yearn V3 vault address (ERC-4626)
        IVault.CurveType curveType; // LINEAR or EXPONENTIAL
    }

    event VaultCreated(
        address indexed vault,
        address indexed token,
        string name,
        string symbol,
        address depositAsset
    );

    function createVault(VaultConfig calldata config) external returns (address vault, address token);
    function getVaults() external view returns (address[] memory);
    function platformWallet() external view returns (address);
    function platformFeeBps() external view returns (uint256);
}
