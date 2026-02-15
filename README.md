# 🏦 Token Vault Launcher

A decentralized vault system for token launches with yield-backed exits and voice integration.

Built for **ETH Boulder 2026** 🏔️

---

## Overview

Token Vault Launcher enables projects to deploy a vault + ERC-20 token to raise funds at a fixed price with time-locked exits. Deposits are deployed into a yield orchestrator, and the generated yield improves exit terms over time.

### Key Features

- **Fixed-price token sales** with configurable cap
- **Time-locked exits** with dynamic discount factor
- **Yield orchestrator integration** (funds fully deployed to DeFi)
- **Voice-controlled queries** via AI wearable
- **Linear or exponential exit curves**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACES                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web Frontend  │  Voice Wearable │     Telegram Bot        │
│   (Next.js)     │   (AI Agent)    │     (Optional)          │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI AGENT LAYER                          │
│           Voice Plugin │ Vault Skill │ Blockchain            │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SMART CONTRACTS                           │
│      VaultFactory  │  Vault  │  VaultToken (ERC-20)         │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ORCHESTRATOR (Yearn V3)                      │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL: Yearn Vaults / DeFi                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Economic Model

### Withdrawal Formula

```
payout = (TVL / supply) × tokens_to_burn × F%
```

Where:
- **TVL** = Total Value Locked (grows with yield)
- **supply** = Circulating token supply (decreases with burns)
- **F%** = Discount factor (0.8 → 1.0 → 1.2+)

### Factor Evolution

The discount factor starts at the configured initial value (e.g., 80%) and evolves based on withdrawals:

- **0.8 (80%)** → Seller receives 80% of nominal value (-20% loss)
- **1.0 (100%)** → Break-even point
- **1.2 (120%)** → Seller receives 120% of nominal value (+20% profit)

### Curve Types

```
LINEAR CURVE:
  factor = initialFactor + (maxFactor - initialFactor) × (withdrawn / totalSupply)
  
EXPONENTIAL CURVE:
  factor = initialFactor + (maxFactor - initialFactor) × (withdrawn / totalSupply)²
```

---

## Smart Contracts

### VaultFactory.sol

Deploys new Vault + VaultToken pairs with configurable parameters.

```solidity
struct VaultConfig {
    string name;              // Token name
    string symbol;            // Token symbol
    address depositAsset;     // e.g., USDC
    uint256 buyPrice;         // Fixed price per token
    uint256 cap;              // Maximum raise amount
    uint256 unlockTimestamp;  // When exits become available
    uint256 initialFactorBps; // Initial discount factor (e.g., 8000 = 80%)
    uint256 projectFeeBps;    // Project share of yield
    uint256 platformFeeBps;   // Platform fee (default 100 = 1%)
    CurveType curveType;      // LINEAR or EXPONENTIAL
    address orchestrator;     // Yield orchestrator address
    address projectWallet;    // Receives project fees
}

function createVault(VaultConfig calldata config) external returns (address vault, address token);
```

### Vault.sol

Core vault logic: deposits, withdrawals, yield distribution, and factor calculation.

```solidity
// Core functions
function deposit(uint256 amount) external;
function withdraw(uint256 tokenAmount) external;
function recalculateFactor() external;
function harvestYield() external;

// View functions
function getWithdrawAmount(uint256 tokenAmount) external view returns (uint256);
function getCurrentFactor() external view returns (uint256);
function getValuePerToken() external view returns (uint256);
```

---

## Critical Implementation Notes

### ⚠️ Rounding Rules

ALL calculations MUST round in favor of the vault (treasury):

- Payout calculations → round DOWN (floor)
- Fee calculations → round DOWN for user, UP for vault
- Share conversions → round DOWN when redeeming

```solidity
// Solidity: division automatically rounds down (floor)
uint256 payout = (tvl * tokens * factorBps) / (supply * 10000);
// This naturally favors the vault ✓
```

### ⚠️ Capital Protection Rule

Initial capital (principal) is ONLY touched when F% < 100%:

```
Case A: F = 0.80 (80%)
  → User receives 80 USDC for 100 tokens
  → 20 USDC stays in treasury (from principal)
  → Principal is touched ⚠️

Case B: F = 1.00 (100%)
  → User receives exactly their principal
  → Break-even point ✓

Case C: F = 1.20 (120%)
  → User receives 120 USDC (20 from yield)
  → Principal untouched ✓
```

**Key insight:** When F < 1.0, early exiters subsidize the treasury, protecting later exiters and allowing F to rise toward 1.0+ over time.

---

## Project Structure

```
ethboulder-2026/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   ├── VaultFactory.sol
│   │   ├── Vault.sol
│   │   ├── VaultToken.sol
│   │   └── interfaces/
│   ├── test/
│   └── script/
├── app/                # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
├── agent/              # AI agent skill
│   ├── SKILL.md
│   └── scripts/
├── orchestrator/       # Yearn integration (submodule)
├── docs/               # Documentation
└── .github/            # CI/CD
```

---

## Tech Stack

- **Contracts:** Solidity 0.8.20+, Foundry, OpenZeppelin, Solady
- **Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui, wagmi, viem
- **Wallet:** RainbowKit
- **Chain:** Base (L2)
- **Yield:** Yearn V3 via Orchestrator

---

## Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/PerkOS-xyz/ethboulder-2026
cd ethboulder-2026

# Contracts
cd contracts && forge install && forge test

# Frontend
cd ../app && pnpm install && pnpm dev

# Local chain
anvil --fork-url https://base.llamarpc.com
```

---

## Environment Variables

```bash
# contracts/.env
PRIVATE_KEY=0x...
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASESCAN_API_KEY=...

# app/.env.local
NEXT_PUBLIC_WALLET_CONNECT_ID=...
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x...
```

---

## License

MIT License — Built for ETH Boulder 2026 🏔️
