# 🏦 Token Vault Launcher

A decentralized vault system for token launches with yield-backed exits and voice integration.

Built for **ETH Boulder 2026** 🏔️

---

## Overview

Token Vault Launcher enables projects to deploy a vault + ERC-20 token to raise funds at a fixed price with time-locked exits. Deposits are deployed directly into **Yearn V3 vaults** via ERC-4626, and the generated yield improves exit terms over time.

### Key Features

- **Fixed-price token sales** with configurable cap
- **Time-locked exits** with dynamic discount factor
- **Direct Yearn V3 integration** via ERC-4626 (no intermediary)
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
│                  YEARN V3 VAULT (ERC-4626)                   │
│                    Direct Integration                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Yearn V3 Integration

The Vault contract integrates **directly** with Yearn V3 vaults using the ERC-4626 standard. No intermediary orchestrator needed.

### Base Mainnet Addresses

| Contract | Address |
|----------|---------|
| **Yearn Registry** | `0xd40ecF29e001c76Dcc4cC0D9cd50520CE845B038` |
| **Role Manager** | `0xea3481244024E2321cc13AcAa80df1050f1fD456` |
| **VaultFactory (Yearn)** | `0x770D0d1Fb036483Ed4AbB6d53c1C88fb277D812F` |
| **4626 Router** | `0x1112dbCF805682e828606f74AB717abf4b4FD8DE` |

### How It Works

1. User deposits USDC → Vault mints VaultTokens 1:1
2. Vault deposits USDC into Yearn V3 vault → receives yield-bearing shares
3. Yield accrues in Yearn vault over time
4. On withdrawal: Vault redeems shares, applies discount factor, transfers USDC

```solidity
// Vault.sol - Direct ERC-4626 integration
IERC4626 public immutable yieldVault;

function deposit(uint256 amount) external {
    depositAsset.safeTransferFrom(msg.sender, address(this), amount);
    depositAsset.approve(address(yieldVault), amount);
    uint256 shares = yieldVault.deposit(amount, address(this));
    // ...
}
```

---

## Economic Model

### Withdrawal Formula

```
payout = (TVL / supply) × tokens_to_burn × F%
```

Where:
- **TVL** = Total Value Locked (grows with yield from Yearn)
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
    uint256 cap;              // Maximum raise amount
    uint256 unlockTimestamp;  // When exits become available
    uint256 initialFactorBps; // Initial discount factor (e.g., 8000 = 80%)
    uint256 projectFeeBps;    // Project share of yield
    address projectWallet;    // Receives project fees
    address yieldVault;       // Yearn V3 vault address (ERC-4626)
    CurveType curveType;      // LINEAR or EXPONENTIAL
}

function createVault(VaultConfig calldata config) external returns (address vault, address token);
```

### Vault.sol

Core vault logic: deposits, withdrawals, yield distribution, and factor calculation.

```solidity
// State
IERC4626 public immutable yieldVault;  // Yearn V3 vault
uint256 public totalPrincipal;          // Deposited principal
uint256 public totalShares;             // Shares in yield vault

// Core functions
function deposit(uint256 amount) external;
function withdraw(uint256 tokenAmount) external;
function harvestYield() external;
function recalculateFactor() external;

// View functions
function getTVL() external view returns (uint256);
function getAccumulatedYield() external view returns (uint256);
function previewWithdraw(uint256 tokenAmount) external view returns (uint256);
function getCurrentFactor() external view returns (uint256);
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

---

## Project Structure

```
ethboulder-2026/
├── contracts/              # Smart contracts (Foundry)
│   ├── src/
│   │   ├── VaultFactory.sol
│   │   ├── Vault.sol
│   │   ├── VaultToken.sol
│   │   └── interfaces/
│   │       ├── IERC4626.sol    # ERC-4626 interface
│   │       ├── IVault.sol
│   │       ├── IVaultFactory.sol
│   │       └── IVaultToken.sol
│   ├── test/
│   │   ├── Vault.t.sol
│   │   ├── VaultFactory.t.sol
│   │   └── mocks/
│   │       ├── MockERC20.sol
│   │       └── MockERC4626.sol
│   └── script/
├── app/                    # Frontend (Next.js)
├── agent/                  # AI agent skill
└── docs/                   # Documentation
```

---

## Tech Stack

- **Contracts:** Solidity 0.8.20+, Foundry, OpenZeppelin, Solady
- **Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui, wagmi, viem
- **Wallet:** RainbowKit
- **Chain:** Base (L2)
- **Yield:** Yearn V3 (direct ERC-4626 integration)

---

## Quick Start

```bash
# Clone
git clone https://github.com/PerkOS-xyz/ethboulder-2026
cd ethboulder-2026

# Install dependencies
cd contracts
forge install

# Run tests
forge test

# Deploy to Base mainnet
forge script script/Deploy.s.sol --rpc-url base --broadcast --verify
```

---

## Deployed Contracts (Base Mainnet)

| Contract | Address | Verified |
|----------|---------|----------|
| **VaultFactory v2** | [`0xbF283332d69C3494986adF33B43F5E44eab02977`](https://basescan.org/address/0xbF283332d69C3494986adF33B43F5E44eab02977) | ✅ Sourcify |

**Deployment Details:**
- Network: Base (Chain ID 8453)
- Deployer/Owner: `0x63d9095efAc96bE8AdA090Da510cb8E8120D6B74`
- Platform Fee: 1% (100 bps)
- Platform Wallet: `0x63d9095efAc96bE8AdA090Da510cb8E8120D6B74`

### Test Vault (Boulder Token v2)
| Contract | Address |
|----------|---------|
| Vault | [`0x26a2758df64eb2560561128c42b46a2f7f2cf691`](https://basescan.org/address/0x26a2758df64eb2560561128c42b46a2f7f2cf691) |
| BTv2 Token | [`0xf142790f37fa6238d6ac95d2bae51dbbd27a4da3`](https://basescan.org/address/0xf142790f37fa6238d6ac95d2bae51dbbd27a4da3) |

- Token decimals: 6 (matches USDC)
- Yield source: Yearn V3 (True Yield Dollar)

---

## Deployment

### Prerequisites

1. Set environment variables in `contracts/.env`:
```bash
PRIVATE_KEY=0x...
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASESCAN_API_KEY=...
```

2. Find a Yearn V3 vault for your asset:
   - Check https://yearn.fi/v3 → Base
   - Or query the registry: `0xd40ecF29e001c76Dcc4cC0D9cd50520CE845B038`

### Deploy

```bash
# Deploy VaultFactory
forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --verify

# Create a vault
forge script script/Deploy.s.sol:CreateVault --rpc-url base --broadcast
```

---

## Environment Variables

```bash
# contracts/.env
PRIVATE_KEY=0x...
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASESCAN_API_KEY=...

# app/.env.local
NEXT_PUBLIC_WALLET_CONNECT_ID=...
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x...
```

---

## License

MIT License — Built for ETH Boulder 2026 🏔️
