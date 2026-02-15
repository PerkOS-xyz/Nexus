// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

interface IRegistry {
    function getVaults() external view returns (address[] memory);
    function numVaults() external view returns (uint256);
}

interface IERC4626 {
    function asset() external view returns (address);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalAssets() external view returns (uint256);
}

contract FindYearnVaultScript is Script {
    // Yearn V3 Registry on all chains
    address constant REGISTRY = 0xd40ecF29e001c76Dcc4cC0D9cd50520CE845B038;
    
    // USDC on Base
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() public view {
        console.log("Querying Yearn V3 Registry on Base...");
        console.log("Registry:", REGISTRY);
        console.log("Looking for USDC vaults (asset:", USDC, ")");
        console.log("");
        
        IRegistry registry = IRegistry(REGISTRY);
        
        try registry.numVaults() returns (uint256 count) {
            console.log("Total vaults in registry:", count);
            
            address[] memory vaults = registry.getVaults();
            
            for (uint i = 0; i < vaults.length; i++) {
                address vault = vaults[i];
                IERC4626 v = IERC4626(vault);
                
                try v.asset() returns (address asset) {
                    if (asset == USDC) {
                        console.log("");
                        console.log("=== USDC VAULT FOUND ===");
                        console.log("Vault:", vault);
                        console.log("Name:", v.name());
                        console.log("Symbol:", v.symbol());
                        console.log("Total Assets:", v.totalAssets());
                    }
                } catch {}
            }
        } catch {
            console.log("Could not query registry - trying alternative method...");
        }
    }
}
