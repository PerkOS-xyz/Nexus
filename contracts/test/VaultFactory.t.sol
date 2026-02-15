// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {IVaultFactory} from "../src/interfaces/IVaultFactory.sol";
import {IVault} from "../src/interfaces/IVault.sol";
import {Vault} from "../src/Vault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockERC4626} from "./mocks/MockERC4626.sol";

contract VaultFactoryTest is Test {
    VaultFactory public factory;
    MockERC20 public usdc;
    MockERC4626 public yieldVault;

    address public owner = address(0x1);
    address public platformWallet = address(0x2);
    address public projectWallet = address(0x3);

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        yieldVault = new MockERC4626(address(usdc));
        
        factory = new VaultFactory(platformWallet, 100, owner); // 1% platform fee
    }

    function test_createVault() public {
        IVaultFactory.VaultConfig memory config = IVaultFactory.VaultConfig({
            name: "Test Vault",
            symbol: "TVT",
            depositAsset: address(usdc),
            cap: 100_000 * 1e6,
            unlockTimestamp: block.timestamp + 7 days,
            initialFactorBps: 8000,
            projectFeeBps: 500,
            projectWallet: projectWallet,
            yieldVault: address(yieldVault),
            curveType: IVault.CurveType.LINEAR
        });

        (address vault, address token) = factory.createVault(config);

        assertTrue(vault != address(0));
        assertTrue(token != address(0));
        assertEq(factory.getVaultCount(), 1);
        assertEq(factory.getVaults()[0], vault);
    }

    function test_createVault_invalidConfig() public {
        IVaultFactory.VaultConfig memory config = IVaultFactory.VaultConfig({
            name: "Test Vault",
            symbol: "TVT",
            depositAsset: address(0), // Invalid
            cap: 100_000 * 1e6,
            unlockTimestamp: block.timestamp + 7 days,
            initialFactorBps: 8000,
            projectFeeBps: 500,
            projectWallet: projectWallet,
            yieldVault: address(yieldVault),
            curveType: IVault.CurveType.LINEAR
        });

        vm.expectRevert(VaultFactory.ZeroAddress.selector);
        factory.createVault(config);
    }

    function test_setPlatformWallet() public {
        address newWallet = address(0x999);

        vm.prank(owner);
        factory.setPlatformWallet(newWallet);

        assertEq(factory.platformWallet(), newWallet);
    }

    function test_setPlatformWallet_notOwner() public {
        vm.prank(address(0x123));
        vm.expectRevert();
        factory.setPlatformWallet(address(0x999));
    }

    function test_setPlatformFeeBps() public {
        vm.prank(owner);
        factory.setPlatformFeeBps(200); // 2%

        assertEq(factory.platformFeeBps(), 200);
    }

    function test_setPlatformFeeBps_tooHigh() public {
        vm.prank(owner);
        vm.expectRevert(VaultFactory.InvalidConfig.selector);
        factory.setPlatformFeeBps(1001); // > 10%
    }
}
