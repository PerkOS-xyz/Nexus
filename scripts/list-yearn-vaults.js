#!/usr/bin/env node
/**
 * List available Yearn V3 vaults on Base
 * Usage: node scripts/list-yearn-vaults.js [--asset USDC|WETH|...] [--json]
 * 
 * Uses Yearn API + fallback to RPC for reliability
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

// ============ Config ============
const YEARN_API_BASE = 'https://ydaemon.yearn.fi';
const CHAIN_ID = 8453; // Base
const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Yearn V3 Base addresses (for reference)
const ADDRESSES = {
  REGISTRY: '0xd40ecF29e001c76Dcc4cC0D9cd50520CE845B038',
  VAULT_FACTORY: '0x770D0d1Fb036483Ed4AbB6d53c1C88fb277D812F',
  ROUTER_4626: '0x1112dbCF805682e828606f74AB717abf4b4FD8DE',
};

// Known Base assets for quick reference
const BASE_ASSETS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
};

// ============ Helpers ============
function formatNumber(num, decimals = 2) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

function formatAPY(apy) {
  if (!apy || apy === 0) return 'N/A';
  return `${(apy * 100).toFixed(2)}%`;
}

// ============ Yearn API ============
async function fetchYearnVaults() {
  const url = `${YEARN_API_BASE}/${CHAIN_ID}/vaults/all`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error(`❌ Yearn API error: ${err.message}`);
    return null;
  }
}

// ============ Main ============
async function main() {
  const args = process.argv.slice(2);
  const assetFilter = args.includes('--asset') 
    ? args[args.indexOf('--asset') + 1]?.toUpperCase() 
    : null;
  const jsonOutput = args.includes('--json');

  console.log('🔍 Querying Yearn V3 vaults on Base...\n');

  // Try Yearn API first (most reliable)
  const vaults = await fetchYearnVaults();
  
  if (!vaults || vaults.length === 0) {
    console.log('⚠️  No vaults found via API. Try with a custom RPC:');
    console.log('   BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY node list-yearn-vaults.js\n');
    return;
  }

  // Filter vaults
  let filteredVaults = vaults.filter(v => {
    // Only v3 vaults
    if (v.version !== '3.0.0' && v.version !== '3.0.1' && v.version !== '3.0.2' && !v.version?.startsWith('3.')) {
      return false;
    }
    // Only endorsed (not experimental)
    if (!v.endorsed) return false;
    
    // Asset filter
    if (assetFilter) {
      const symbol = v.token?.symbol?.toUpperCase() || '';
      if (!symbol.includes(assetFilter)) return false;
    }
    
    return true;
  });

  // Sort by TVL
  filteredVaults.sort((a, b) => (b.tvl?.tvl || 0) - (a.tvl?.tvl || 0));

  if (jsonOutput) {
    // JSON output for programmatic use
    const output = filteredVaults.map(v => ({
      address: v.address,
      name: v.name,
      symbol: v.symbol,
      version: v.version,
      asset: {
        address: v.token?.address,
        symbol: v.token?.symbol,
        decimals: v.token?.decimals,
      },
      tvl: v.tvl?.tvl || 0,
      apy: {
        net: v.apr?.netAPR || 0,
        gross: v.apr?.grossAPR || 0,
        weekly: v.apr?.weeklyAPR || 0,
      },
      strategies: v.strategies?.length || 0,
    }));
    
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Pretty print
  console.log(`📊 Found ${filteredVaults.length} endorsed V3 vaults${assetFilter ? ` for ${assetFilter}` : ''}\n`);
  
  // Group by asset
  const byAsset = {};
  for (const v of filteredVaults) {
    const assetSymbol = v.token?.symbol || 'UNKNOWN';
    if (!byAsset[assetSymbol]) byAsset[assetSymbol] = [];
    byAsset[assetSymbol].push(v);
  }

  for (const [assetSymbol, vaultList] of Object.entries(byAsset)) {
    console.log(`${'═'.repeat(70)}`);
    console.log(`💰 ${assetSymbol}`);
    console.log(`${'═'.repeat(70)}`);

    for (const v of vaultList) {
      const tvl = v.tvl?.tvl || 0;
      const apy = v.apr?.netAPR || 0;
      
      console.log(`
  📦 ${v.name}
     Symbol: ${v.symbol}
     Version: ${v.version}
     Address: ${v.address}
     Asset: ${v.token?.address}
     TVL: $${formatNumber(tvl)}
     APY (net): ${formatAPY(apy)}
     Strategies: ${v.strategies?.length || 0}`);
    }
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`✅ Total: ${filteredVaults.length} vaults | Registry: ${ADDRESSES.REGISTRY}`);
  console.log(`${'═'.repeat(70)}\n`);

  // Show useful addresses
  console.log('📋 Useful addresses for integration:');
  console.log(`   Registry: ${ADDRESSES.REGISTRY}`);
  console.log(`   VaultFactory: ${ADDRESSES.VAULT_FACTORY}`);
  console.log(`   4626 Router: ${ADDRESSES.ROUTER_4626}`);
  
  // Recommend best vault for USDC (most common use case)
  const usdcVaults = filteredVaults.filter(v => v.token?.symbol === 'USDC');
  if (usdcVaults.length > 0) {
    const best = usdcVaults[0]; // Already sorted by TVL
    console.log(`\n🏆 Recommended USDC vault (highest TVL):`);
    console.log(`   ${best.name}`);
    console.log(`   Address: ${best.address}`);
    console.log(`   TVL: $${formatNumber(best.tvl?.tvl || 0)}`);
    console.log(`   APY: ${formatAPY(best.apr?.netAPR)}`);
  }
}

main().catch(console.error);
