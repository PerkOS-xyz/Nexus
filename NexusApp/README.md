# 🏦 Nexus

**Sovereign Token Launches with Yield-Backed Floors**

> Built at ETH Boulder 2026

## Overview

Nexus enables fixed-price token launches where 100% of raised capital is deployed to yield protocols. Token holders can exit at any time with a floor price that appreciates as yield accrues.

**Live Demo:** [nexus-ethboulder.netlify.app](https://nexus-ethboulder.netlify.app)

## Features

- **🤖 AI-Powered Deployment** - Chat with Nexus Agent to create vaults using natural language
- **📈 Yield-Backed Floors** - All deposits earn yield via Yearn V3 (ERC-4626)
- **🛡️ Time-Locked Protection** - Configurable lock periods prevent dumps
- **⚡ Instant Launch** - Just $1 USDC to deploy (via x402)
- **🎙️ Voice Integration** - Monitor vault health via OmiMesh AI wearables

## How It Works

1. **Deploy** - Set a fixed token price and funding cap. Launch your ERC-20 via AI or form.
2. **Deposit** - 100% of USDC raised is routed to Yearn V3 vaults for yield.
3. **Appreciate** - Yield accrues to the vault, increasing the TVL/supply ratio.
4. **Exit** - Burn tokens to claim USDC. Dynamic Factor (F%) rewards conviction.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Base L2 |
| AI Agent | OpenClaw + Anthropic Claude |
| Yield | Yearn V3 (ERC-4626) |
| Payments | x402 Protocol |
| Frontend | Next.js 15, Dynamic.xyz |
| Storage | Firebase Firestore |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_id
OPENAI_API_KEY=your_openai_key
FIREBASE_SERVICE_ACCOUNT=your_firebase_sa
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js + Dynamic.xyz Wallet + AI Chat Interface           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    AI Agent Layer                            │
│  OpenClaw + Claude → Vault Creation + Contract Deployment   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Smart Contracts                           │
│  NexusVaultFactory → NexusVault → Yearn V3 (ERC-4626)       │
└─────────────────────────────────────────────────────────────┘
```

## Team

- **Julio M Cruz** - [@zkNexus](https://twitter.com/zkNexus)

## Links

- [GitHub](https://github.com/PerkOS-xyz/Nexus)
- [Twitter](https://twitter.com/PerkOS_xyz)
- [ETH Boulder 2026](https://ethboulder.com)

## License

MIT
