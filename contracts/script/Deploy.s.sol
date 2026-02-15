// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultFactory} from "../src/VaultFactory.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        uint256 platformFeeBps = vm.envOr("PLATFORM_FEE_BPS", uint256(100)); // Default 1%

        vm.startBroadcast(deployerPrivateKey);

        VaultFactory factory = new VaultFactory(
            platformWallet,
            platformFeeBps,
            msg.sender
        );

        console.log("VaultFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
