// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IVaultToken} from "./interfaces/IVaultToken.sol";

/**
 * @title VaultToken
 * @notice ERC-20 token with mint/burn controlled by the vault
 * @dev Only the vault can mint new tokens and burn tokens from holders
 *      Decimals match the deposit asset for better UX
 */
contract VaultToken is ERC20, IVaultToken {
    /// @notice The vault that controls this token
    address public immutable vault;

    /// @notice Token decimals (matches deposit asset)
    uint8 private immutable _decimals;

    /// @notice Revert when caller is not the vault
    error OnlyVault();

    /// @notice Restricts function to vault only
    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    /**
     * @notice Creates a new vault token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _vault The vault address that controls minting/burning
     * @param decimals_ Token decimals (should match deposit asset)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _vault,
        uint8 decimals_
    ) ERC20(_name, _symbol) {
        vault = _vault;
        _decimals = decimals_;
    }

    /**
     * @notice Returns token decimals
     * @return Number of decimals
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint tokens to an address (vault only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address (vault only)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyVault {
        _burn(from, amount);
    }
}
