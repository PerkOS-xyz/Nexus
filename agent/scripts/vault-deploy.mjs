#!/usr/bin/env node
/**
 * Deploy a vault via VaultFactory contract
 * 
 * Usage:
 *   node vault-deploy.mjs --name "My Token" --symbol "MTK" --cap 100 --user 0x...
 */

import 'dotenv/config';
import { createWalletClient, createPublicClient, http, parseUnits, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { parseArgs } from 'util';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Config
const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const VAULT_FACTORY = process.env.VAULT_FACTORY || '0x9Df66106201d04CF8398d6387C2D022eb9353c73';
const USDC = process.env.USDC || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Firebase (optional)
let db = null;
try {
  const saPath = process.env.NEXUS_FIREBASE_SA_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (saPath) {
    const sa = await import(saPath, { assert: { type: 'json' } });
    initializeApp({ credential: cert(sa.default) });
    db = getFirestore();
  }
} catch (e) {
  console.error('Firebase init failed (optional):', e.message);
}

// VaultFactory ABI (createVault function)
// VaultConfig struct order: name, symbol, depositAsset, cap, maxTokenSupply, 
//   unlockTimestamp, initialFactorBps, projectFeeBps, projectWallet, yieldVault, curveType
const FACTORY_ABI = [
  {
    name: 'createVault',
    type: 'function',
    inputs: [
      {
        name: 'config',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'depositAsset', type: 'address' },
          { name: 'cap', type: 'uint256' },
          { name: 'maxTokenSupply', type: 'uint256' },
          { name: 'unlockTimestamp', type: 'uint256' },
          { name: 'initialFactorBps', type: 'uint256' },
          { name: 'projectFeeBps', type: 'uint256' },
          { name: 'projectWallet', type: 'address' },
          { name: 'yieldVault', type: 'address' },
          { name: 'curveType', type: 'uint8' },
        ],
      },
    ],
    outputs: [
      { name: 'vault', type: 'address' },
      { name: 'token', type: 'address' },
    ],
  },
  {
    name: 'getVaults',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
];

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: 'string', short: 'n' },
      symbol: { type: 'string', short: 's' },
      cap: { type: 'string', short: 'c' },
      user: { type: 'string', short: 'u' },
      duration: { type: 'string', short: 'd' },
      factor: { type: 'string' },
      fee: { type: 'string' },
      curve: { type: 'string' },
      'dry-run': { type: 'boolean' },
    },
  });

  if (!values.name || !values.symbol || !values.cap || !values.user) {
    console.error('Usage: node vault-deploy.mjs --name "My Token" --symbol "MTK" --cap 100 --user 0x...');
    console.error('\nRequired:');
    console.error('  --name     Token name');
    console.error('  --symbol   Token symbol (3-5 chars)');
    console.error('  --cap      Cap in USDC');
    console.error('  --user     User wallet address (project wallet)');
    console.error('\nOptional:');
    console.error('  --duration Lock duration in days (default: 30)');
    console.error('  --factor   Initial factor in bps (default: 8000 = 80%)');
    console.error('  --fee      Project fee in bps (default: 500 = 5%)');
    console.error('  --curve    0=LINEAR, 1=EXPONENTIAL (default: 0)');
    console.error('  --dry-run  Simulate without executing');
    process.exit(1);
  }

  if (!PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY not set');
    process.exit(1);
  }

  // Setup clients
  const account = privateKeyToAccount(PRIVATE_KEY);
  const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(RPC_URL),
  });

  console.log('🔑 Agent wallet:', account.address);

  // Parse parameters
  const cap = parseUnits(values.cap, 6); // USDC has 6 decimals
  const maxTokenSupply = parseUnits(String(parseInt(values.cap) * 10), 18); // 10 tokens per USDC
  const duration = parseInt(values.duration || '30');
  const unlockTimestamp = BigInt(Math.floor(Date.now() / 1000) + (duration * 24 * 60 * 60));
  const initialFactorBps = BigInt(values.factor || '8000');
  const projectFeeBps = BigInt(values.fee || '500');
  const curveType = parseInt(values.curve || '0');

  // Yearn USDC Vault on Base (ERC-4626)
  const yieldVault = '0xb13cf163d916917d9cd6e836905ca5f12a1def4b';

  // VaultConfig order: name, symbol, depositAsset, cap, maxTokenSupply, 
  //   unlockTimestamp, initialFactorBps, projectFeeBps, projectWallet, yieldVault, curveType
  const vaultParams = {
    name: values.name,
    symbol: values.symbol,
    depositAsset: USDC,
    cap,
    maxTokenSupply,
    unlockTimestamp,
    initialFactorBps,
    projectFeeBps,
    projectWallet: values.user,
    yieldVault,
    curveType,
  };

  console.log('\n📋 Vault Parameters:');
  console.log('─'.repeat(50));
  console.log(`Name:           ${values.name}`);
  console.log(`Symbol:         ${values.symbol}`);
  console.log(`Cap:            ${values.cap} USDC`);
  console.log(`Max Supply:     ${parseInt(values.cap) * 10} tokens`);
  console.log(`Initial Factor: ${Number(initialFactorBps) / 100}%`);
  console.log(`Project Fee:    ${Number(projectFeeBps) / 100}%`);
  console.log(`Duration:       ${duration} days`);
  console.log(`Unlock:         ${new Date(Number(unlockTimestamp) * 1000).toISOString()}`);
  console.log(`Curve:          ${curveType === 0 ? 'LINEAR' : 'EXPONENTIAL'}`);
  console.log(`Project Wallet: ${values.user}`);
  console.log('─'.repeat(50));

  if (values['dry-run']) {
    console.log('\n🔍 Dry run - not executing transaction');
    return;
  }

  console.log('\n⏳ Deploying vault...');

  try {
    // Simulate first
    const { request } = await publicClient.simulateContract({
      address: VAULT_FACTORY,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [vaultParams],
      account,
    });

    // Execute
    const hash = await walletClient.writeContract(request);
    console.log(`📝 Transaction: ${hash}`);

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);

    // Parse logs to get vault and token addresses
    // The VaultCreated event contains the addresses
    const vaultAddress = receipt.logs[0]?.address; // Simplified - parse actual event
    
    // Get all vaults to find the new one
    const allVaults = await publicClient.readContract({
      address: VAULT_FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getVaults',
    });
    const newVault = allVaults[allVaults.length - 1];

    console.log(`\n🏦 Vault deployed: ${newVault}`);

    // Save to Firebase
    if (db) {
      const deployment = {
        userWallet: values.user.toLowerCase(),
        vaultAddress: newVault.toLowerCase(),
        tokenName: values.name,
        tokenSymbol: values.symbol,
        config: {
          cap: values.cap,
          maxTokenSupply: String(parseInt(values.cap) * 10),
          initialFactorBps: Number(initialFactorBps),
          projectFeeBps: Number(projectFeeBps),
          unlockTimestamp: Number(unlockTimestamp),
          curveType,
        },
        deployTx: hash,
        deployedAt: new Date().toISOString(),
        chain: 'base',
        status: 'deployed',
      };

      await db.collection('deployments').add(deployment);
      console.log('💾 Saved to Firebase');
    }

    // Output for agent
    console.log('\n' + JSON.stringify({
      success: true,
      vault: newVault,
      txHash: hash,
      user: values.user,
      name: values.name,
      symbol: values.symbol,
    }));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n' + JSON.stringify({
      success: false,
      error: error.message,
    }));
    process.exit(1);
  }
}

main();
