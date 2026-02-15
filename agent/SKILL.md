---
name: nexus-vault
description: Skill for deploying and managing Token Vaults on Nexus. Use when the agent needs to: (1) receive messages from frontend chat, (2) extract vault parameters from conversations, (3) generate x402 payments, (4) deploy vaults via VaultFactory, (5) save deployments to Firebase, (6) respond to users with contract addresses, (7) read existing vault state.
---

# Nexus Vault Skill

Skill for the Nexus agent handling Token Vault deployment and management with yield-backed exits.

## Language

**Always respond in English** unless the user explicitly writes in another language.

## Architecture

```
Frontend (NexusApp) ←→ Nexus Plugin ←→ Nexus Agent (this skill)
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
              x402 Payment            Firebase              Smart Contracts
           (stack.perkos.xyz)        (Firestore)               (Base)
```

## Deployment Flow

1. **Receive message** from frontend via plugin
2. **Extract parameters** for vault (name, cap, APY, duration)
3. **Generate x402 payment** ($1 USDC via stack.perkos.xyz)
4. **Verify payment** with facilitator
5. **Deploy vault** via VaultFactory.createVault()
6. **Save to Firebase** (wallet → deployment)
7. **Respond** with vault + token addresses

## Available Scripts

### Read Vault State
```bash
node scripts/vault-read.mjs --vault 0x...
```
Returns: TVL, current factor, supply, accumulated yield.

### Preview Withdrawal
```bash
node scripts/vault-preview.mjs --vault 0x... --amount 1000
```
Returns: estimated payout based on current factor.

### Create Vault Link
```bash
node scripts/vault-create.mjs \
  --name "My Token" \
  --symbol "MTK" \
  --cap 100000 \
  --duration 30
```
Returns: link with pre-configured parameters.

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| **VaultFactory v3** | `0x9Df66106201d04CF8398d6387C2D022eb9353c73` |
| **Yearn USDC Vault** | ERC-4626 compatible |
| **USDC** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Vault Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Token name |
| symbol | string | Symbol (3-5 chars) |
| cap | number | Funding cap in USDC |
| maxTokenSupply | number | Total token supply |
| initialFactorBps | number | Initial factor (8000 = 80%) |
| projectFeeBps | number | Project fee (500 = 5%) |
| unlockTimestamp | number | Unix timestamp for unlock |
| curveType | string | "LINEAR" or "EXPONENTIAL" |

## x402 Payment

- **Fee:** $1 USDC per deployment
- **Facilitator:** stack.perkos.xyz
- See `prompts/vault-intents.md` for payment flow

## Firebase Schema

```javascript
// Collection: deployments
{
  userWallet: "0x...",
  vaultAddress: "0x...",
  tokenAddress: "0x...",
  tokenName: "My Token",
  tokenSymbol: "MTK",
  config: { cap, maxTokenSupply, ... },
  deployedAt: Timestamp,
  txHash: "0x..."
}
```

## Voice Commands

See `prompts/vault-intents.md` for voice command patterns.

## Response Templates

### Success
```
✅ Vault deployed!

Token: My Token (MTK)
Vault: 0x...
Token: 0x...

Users can now deposit USDC.
```

### Error
```
❌ [Error message]
Please try again or contact support.
```
