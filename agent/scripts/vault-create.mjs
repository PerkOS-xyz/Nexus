#!/usr/bin/env node
/**
 * Generate create vault link with pre-configured parameters
 * 
 * Usage:
 *   node vault-create.mjs --name "My Token" --symbol "MTK" --cap 100000 --duration 30
 */

import { parseArgs } from 'util';

const APP_URL = process.env.NEXUS_APP_URL || 'https://nexus-ethboulder.netlify.app';

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: 'string', short: 'n' },
      symbol: { type: 'string', short: 's' },
      cap: { type: 'string', short: 'c' },
      duration: { type: 'string', short: 'd' },
      supply: { type: 'string' },
      factor: { type: 'string' },
      fee: { type: 'string' },
      curve: { type: 'string' },
    },
  });

  if (!values.name || !values.symbol || !values.cap) {
    console.error('Usage: node vault-create.mjs --name "My Token" --symbol "MTK" --cap 100000 [options]');
    console.error('\nOptions:');
    console.error('  --duration   Lock duration in days (default: 30)');
    console.error('  --supply     Max token supply (default: calculated from cap)');
    console.error('  --factor     Initial factor in % (default: 80)');
    console.error('  --fee        Project fee in % (default: 5)');
    console.error('  --curve      LINEAR or EXPONENTIAL (default: LINEAR)');
    process.exit(1);
  }

  // Defaults
  const duration = parseInt(values.duration || '30');
  const cap = parseInt(values.cap);
  const supply = values.supply || String(cap * 10); // Default: 10 tokens per USDC
  const factor = values.factor || '80';
  const fee = values.fee || '5';
  const curve = values.curve || 'LINEAR';

  // Calculate unlock timestamp
  const unlockTimestamp = Math.floor(Date.now() / 1000) + (duration * 24 * 60 * 60);
  const unlockDate = new Date(unlockTimestamp * 1000);

  // Token price calculation
  const tokenPrice = cap / parseInt(supply);

  // Build URL params
  const params = new URLSearchParams({
    name: values.name,
    symbol: values.symbol,
    cap: values.cap,
    supply: supply,
    factor: factor,
    fee: fee,
    duration: String(duration),
    curve: curve,
  });

  const createUrl = `${APP_URL}/create?${params.toString()}`;

  console.log('🚀 Vault Configuration');
  console.log('─'.repeat(50));
  console.log(`Name:           ${values.name}`);
  console.log(`Symbol:         ${values.symbol}`);
  console.log(`Cap:            ${cap.toLocaleString()} USDC`);
  console.log(`Max Supply:     ${parseInt(supply).toLocaleString()} tokens`);
  console.log(`Token Price:    ${tokenPrice.toFixed(4)} USDC`);
  console.log(`Initial Factor: ${factor}%`);
  console.log(`Project Fee:    ${fee}%`);
  console.log(`Duration:       ${duration} days`);
  console.log(`Unlock:         ${unlockDate.toISOString()}`);
  console.log(`Curve:          ${curve}`);
  console.log('─'.repeat(50));
  console.log(`\n🔗 Create Link:\n${createUrl}\n`);

  // JSON output
  console.log('---JSON---');
  console.log(JSON.stringify({
    name: values.name,
    symbol: values.symbol,
    cap,
    maxSupply: parseInt(supply),
    tokenPrice,
    initialFactorPercent: parseInt(factor),
    projectFeePercent: parseInt(fee),
    durationDays: duration,
    unlockTimestamp,
    curveType: curve,
    createUrl,
  }));
}

main();
