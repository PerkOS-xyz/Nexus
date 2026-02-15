#!/usr/bin/env node
/**
 * Preview withdrawal amount based on current factor
 * 
 * Usage:
 *   node vault-preview.mjs --vault 0x... --amount 1000
 */

import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { parseArgs } from 'util';

const RPC_URL = process.env.NEXUS_RPC_URL || 'https://mainnet.base.org';

const VAULT_ABI = [
  { 
    name: 'previewWithdraw', 
    type: 'function', 
    inputs: [{ name: 'tokenAmount', type: 'uint256' }], 
    outputs: [{ type: 'uint256' }] 
  },
  { name: 'getCurrentFactor', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'unlockTimestamp', type: 'function', inputs: [], outputs: [{ type: 'uint256' }] },
];

async function main() {
  const { values } = parseArgs({
    options: {
      vault: { type: 'string', short: 'v' },
      amount: { type: 'string', short: 'a' },
    },
  });

  if (!values.vault || !values.amount) {
    console.error('Usage: node vault-preview.mjs --vault 0x... --amount 1000');
    process.exit(1);
  }

  const client = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  });

  try {
    const tokenAmount = parseUnits(values.amount, 18);
    
    const [payout, factor, unlock] = await Promise.all([
      client.readContract({ 
        address: values.vault, 
        abi: VAULT_ABI, 
        functionName: 'previewWithdraw',
        args: [tokenAmount]
      }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'getCurrentFactor' }),
      client.readContract({ address: values.vault, abi: VAULT_ABI, functionName: 'unlockTimestamp' }),
    ]);

    const factorPercent = Number(factor) / 100;
    const isUnlocked = Date.now() > Number(unlock) * 1000;
    const payoutFormatted = formatUnits(payout, 6);

    console.log('💰 Withdrawal Preview');
    console.log('─'.repeat(40));
    console.log(`Tokens:     ${values.amount}`);
    console.log(`Factor:     ${factorPercent.toFixed(2)}%`);
    console.log(`Payout:     ${payoutFormatted} USDC`);
    console.log(`Status:     ${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}`);

    if (factorPercent < 100) {
      console.log(`⚠️  Loss:    ${(100 - factorPercent).toFixed(2)}%`);
    } else if (factorPercent > 100) {
      console.log(`📈 Profit:  ${(factorPercent - 100).toFixed(2)}%`);
    }

    // JSON output
    console.log('\n---JSON---');
    console.log(JSON.stringify({
      tokens: values.amount,
      payout: payoutFormatted,
      factorBps: Number(factor),
      factorPercent,
      isUnlocked,
      profitLossPercent: factorPercent - 100,
    }));

  } catch (error) {
    console.error('Error previewing withdrawal:', error.message);
    process.exit(1);
  }
}

main();
