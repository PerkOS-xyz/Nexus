// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@solady/contracts/auth/Ownable.sol";
import {IVaultFactory} from "./interfaces/IVaultFactory.sol";
import {IVault} from "./interfaces/IVault.sol";
import {Vault} from "./Vault.sol";

/**
 * @title VaultFactory
 * @notice Factory contract that deploys Vault + VaultToken pairs
 * @dev Uses Solady Ownable for platform admin functions
 */
contract VaultFactory is IVaultFactory, Ownable {
    // ============ State ============

    /// @notice List of all deployed vaults
    address[] private _vaults;

    /// @notice Platform fee wallet
    address public platformWallet;

    /// @notice Platform fee in basis points (default 100 = 1%)
    uint256 public platformFeeBps;

    // ============ Errors ============

    error InvalidConfig();
    error ZeroAddress();

    // ============ Constructor ============

    /**
     * @notice Creates the vault factory
     * @param _platformWallet Address to receive platform fees
     * @param _platformFeeBps Platform fee in basis points (e.g., 100 = 1%)
     * @param _owner Initial owner address
     */
    constructor(
        address _platformWallet,
        uint256 _platformFeeBps,
        address _owner
    ) {
        if (_platformWallet == address(0)) revert ZeroAddress();
        if (_platformFeeBps > 1000) revert InvalidConfig(); // Max 10%

        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
        _initializeOwner(_owner);
    }

    // ============ External Functions ============

    /**
     * @notice Deploy a new vault + token pair
     * @param config Vault configuration
     * @return vault The deployed vault address
     * @return token The deployed token address
     */
    function createVault(VaultConfig calldata config) 
        external 
        returns (address vault, address token) 
    {
        // Validate config
        if (config.depositAsset == address(0)) revert ZeroAddress();
        if (config.yieldVault == address(0)) revert ZeroAddress();
        if (config.projectWallet == address(0)) revert ZeroAddress();
        if (config.cap == 0) revert InvalidConfig();
        if (config.unlockTimestamp <= block.timestamp) revert InvalidConfig();
        if (config.initialFactorBps == 0 || config.initialFactorBps > 10000) revert InvalidConfig();
        if (config.projectFeeBps + platformFeeBps > 5000) revert InvalidConfig(); // Max 50% fees

        // Deploy vault
        Vault newVault = new Vault(
            config.depositAsset,
            config.name,
            config.symbol,
            config.yieldVault,
            config.cap,
            config.unlockTimestamp,
            config.initialFactorBps,
            config.projectFeeBps,
            platformFeeBps,
            config.projectWallet,
            platformWallet,
            config.curveType
        );

        vault = address(newVault);
        token = address(newVault.vaultToken());

        _vaults.push(vault);

        emit VaultCreated(vault, token, config.name, config.symbol, config.depositAsset);
    }

    /**
     * @notice Get all deployed vaults
     * @return Array of vault addresses
     */
    function getVaults() external view returns (address[] memory) {
        return _vaults;
    }

    /**
     * @notice Get total number of vaults
     * @return Number of vaults deployed
     */
    function getVaultCount() external view returns (uint256) {
        return _vaults.length;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update platform wallet (owner only)
     * @param _platformWallet New platform wallet address
     */
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        if (_platformWallet == address(0)) revert ZeroAddress();
        platformWallet = _platformWallet;
    }

    /**
     * @notice Update platform fee (owner only)
     * @param _platformFeeBps New platform fee in basis points
     */
    function setPlatformFeeBps(uint256 _platformFeeBps) external onlyOwner {
        if (_platformFeeBps > 1000) revert InvalidConfig(); // Max 10%
        platformFeeBps = _platformFeeBps;
    }
}
