#!/usr/bin/env node
/**
 * Read vault state (TVL, factor, supply, yield)
 * 
 * Usage:
 *   node vault-read.mjs --vault 0x...
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { parseArgs } from 'util';

const RPC_URL = process.env.NEXUS_RPC_URL || 'https://mainnet.base.org';

const VAULT_ABI = [
  { name: 'getTVL', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getCurrentFactor', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalSupply', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getAccumulatedYield', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'cap', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'unlockTimestamp', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'vaultToken', type: 'function', inputs: [], outputs: [{ type: 'address' }] },
];

async function main() {
  const { values } = parseArgs({
    options: {
      vault: { type: 'string', short: 'v' },
    },
  });

  if (!values.vault) {
    console.error('Usage: node vault-read.mjs --vault 0x...');
    process.exit(1);
  }

  const client = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  });

  try {
    const [tvl, factor, supply, yield_, cap, unlock, token] = await Promise.all([
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'getTVL' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'getCurrentFactor' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'totalSupply' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'getAccumulatedYield' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'cap' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'unlockTimestamp' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'vaultToken' }),
    ]);

    const factorPercent = Number(factor) / 100;
    const unlockDate = new Date(Number(unlock) * 1000);
    const isUnlocked = Date.now() > Number(unlock) * 1000;

    console.log('📊 Vault State');
    console.log('─'.repeat(40));
    console.log(`Vault:      ${values.vault}`);
    console.log(`Token:      ${token}`);
    console.log(`TVL:        ${formatUnits(tvl, 6)} USDC`);
    console.log(`Cap:        ${formatUnits(cap, 6)} USDC`);
    console.log(`Supply:     ${formatUnits(supply, 18)} tokens`);
    console.log(`Yield:      ${formatUnits(yield_, 6)} USDC`);
    console.log(`Factor:     ${factorPercent.toFixed(2)}%`);
    console.log(`Unlock:     ${unlockDate.toISOString()} ${isUnlocked ? '✅' : '🔒'}`);

    // JSON output for agent parsing
    console.log('\n---JSON---');
    console.log(JSON.stringify({
      vault: values.vault,
      token,
      tvl: formatUnits(tvl, 6),
      cap: formatUnits(cap, 6),
      supply: formatUnits(supply, 18),
      yield: formatUnits(yield_, 6),
      factorBps: Number(factor),
      factorPercent,
      unlockTimestamp: Number(unlock),
      isUnlocked,
    }));

  } catch (error) {
    console.error('Error reading vault:', error.message);
    process.exit(1);
  }
}

main();
