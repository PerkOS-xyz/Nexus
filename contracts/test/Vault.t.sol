// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {IVault} from "../src/interfaces/IVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockERC4626} from "./mocks/MockERC4626.sol";

contract VaultTest is Test {
    Vault public vault;
    MockERC20 public usdc;
    MockERC4626 public yieldVault;

    address public projectWallet = address(0x1111);
    address public platformWallet = address(0x2222);
    address public user1 = address(0x3333);
    address public user2 = address(0x4444);

    uint256 public constant CAP = 100_000 * 1e6; // 100k USDC
    uint256 public constant INITIAL_FACTOR = 8000; // 80%
    uint256 public constant PROJECT_FEE = 500; // 5%
    uint256 public constant PLATFORM_FEE = 100; // 1%

    function setUp() public {
        // Deploy mocks
        usdc = new MockERC20("USD Coin", "USDC", 6);
        yieldVault = new MockERC4626(address(usdc));

        // Deploy vault
        vault = new Vault(
            address(usdc),
            "Test Vault Token",
            "TVT",
            address(yieldVault),
            CAP,
            block.timestamp + 7 days,
            INITIAL_FACTOR,
            PROJECT_FEE,
            PLATFORM_FEE,
            projectWallet,
            platformWallet,
            IVault.CurveType.LINEAR
        );

        // Fund users
        usdc.mint(user1, 1_000_000 * 1e6);
        usdc.mint(user2, 1_000_000 * 1e6);
    }

    function test_deposit() public {
        uint256 depositAmount = 1000 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        assertEq(vault.getTVL(), depositAmount);
        assertEq(vault.getCirculatingSupply(), depositAmount);
        assertEq(vault.vaultToken().balanceOf(user1), depositAmount);
    }

    function test_deposit_capExceeded() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), CAP + 1);
        vm.expectRevert(Vault.CapExceeded.selector);
        vault.deposit(CAP + 1);
        vm.stopPrank();
    }

    function test_withdraw_locked() public {
        uint256 depositAmount = 1000 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        
        vm.expectRevert(Vault.WithdrawalsLocked.selector);
        vault.withdraw(depositAmount);
        vm.stopPrank();
    }

    function test_withdraw_afterUnlock() public {
        uint256 depositAmount = 1000 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        // Fast forward past unlock
        vm.warp(block.timestamp + 8 days);

        uint256 balanceBefore = usdc.balanceOf(user1);

        vm.startPrank(user1);
        vault.withdraw(depositAmount);
        vm.stopPrank();

        uint256 balanceAfter = usdc.balanceOf(user1);
        
        // At 80% factor, should receive 800 USDC for 1000 tokens
        uint256 expectedPayout = (depositAmount * INITIAL_FACTOR) / 10000;
        assertEq(balanceAfter - balanceBefore, expectedPayout);
        assertEq(vault.vaultToken().balanceOf(user1), 0);
    }

    function test_factorEvolution_linear() public {
        // Two users deposit
        vm.startPrank(user1);
        usdc.approve(address(vault), 50_000 * 1e6);
        vault.deposit(50_000 * 1e6);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(vault), 50_000 * 1e6);
        vault.deposit(50_000 * 1e6);
        vm.stopPrank();

        // Fast forward past unlock
        vm.warp(block.timestamp + 8 days);

        // User1 withdraws 50% of supply
        vm.startPrank(user1);
        vault.withdraw(50_000 * 1e6);
        vm.stopPrank();

        // Factor should have increased from 80% toward 100%
        // LINEAR: factor = 8000 + (12000 - 8000) * 0.5 = 10000
        assertEq(vault.getCurrentFactor(), 10000); // 100%
    }

    function test_previewWithdraw() public {
        uint256 depositAmount = 1000 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        uint256 preview = vault.previewWithdraw(depositAmount);
        uint256 expected = (depositAmount * INITIAL_FACTOR) / 10000;
        
        assertEq(preview, expected);
    }

    function test_roundingFavorsVault() public {
        // Deposit odd amount to test rounding
        uint256 depositAmount = 1001 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        vm.warp(block.timestamp + 8 days);

        uint256 preview = vault.previewWithdraw(depositAmount);
        
        // Should round DOWN (floor)
        // 1001 * 8000 / 10000 = 800.8 → 800
        assertEq(preview, 800800000); // 800.8 USDC (rounds down at wei level)
    }

    function test_yieldAccrual() public {
        uint256 depositAmount = 1000 * 1e6;

        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        // Simulate 10% yield accrual in the yield vault
        yieldVault.addMockYield(1000); // 10%

        // TVL should now reflect the yield
        uint256 tvl = vault.getTVL();
        assertEq(tvl, depositAmount * 110 / 100); // 1100 USDC
        
        // Accumulated yield should be 100 USDC
        assertEq(vault.getAccumulatedYield(), 100 * 1e6);
    }
}
