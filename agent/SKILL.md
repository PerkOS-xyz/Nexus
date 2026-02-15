---
name: nexus-vault
description: Skill para deployment y gestión de Token Vaults en Nexus. Usar cuando el agente necesite: (1) recibir mensajes del chat frontend, (2) extraer parámetros de vault de conversaciones, (3) generar pagos x402, (4) deployar vaults via VaultFactory, (5) guardar deployments en Firebase, (6) responder al usuario con direcciones de contratos, (7) leer estado de vaults existentes.
---

# Nexus Vault Skill

Skill para el agente Nexus que maneja el deployment y gestión de Token Vaults con yield-backed exits.

## Arquitectura

```
Frontend (NexusApp) ←→ Nexus Plugin ←→ Nexus Agent (este skill)
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
              x402 Payment            Firebase              Smart Contracts
           (stack.perkos.xyz)        (Firestore)               (Base)
```

## Flujo de Deployment

1. **Recibir mensaje** del frontend via plugin
2. **Extraer parámetros** del vault (nombre, cap, APY, duración)
3. **Generar pago x402** ($1 USDC via stack.perkos.xyz)
4. **Verificar pago** con el facilitator
5. **Deployar vault** via VaultFactory.createVault()
6. **Guardar en Firebase** (wallet → deployment)
7. **Responder** con vault + token addresses

## Scripts Disponibles

### Leer Estado del Vault
```bash
node scripts/vault-read.mjs --vault 0x...
```
Retorna: TVL, factor actual, supply, yield acumulado.

### Preview Withdrawal
```bash
node scripts/vault-preview.mjs --vault 0x... --amount 1000
```
Retorna: payout estimado basado en factor actual.

### Crear Link de Vault
```bash
node scripts/vault-create.mjs \
  --name "My Token" \
  --symbol "MTK" \
  --cap 100000 \
  --duration 30
```
Retorna: link con parámetros pre-configurados.

## Contratos (Base Mainnet)

| Contract | Address |
|----------|---------|
| **VaultFactory v3** | `0x9Df66106201d04CF8398d6387C2D022eb9353c73` |
| **Yearn USDC Vault** | ERC-4626 compatible |
| **USDC** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Parámetros de Vault

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| name | string | Nombre del token |
| symbol | string | Símbolo (3-5 chars) |
| cap | number | Cap de funding en USDC |
| maxTokenSupply | number | Supply total de tokens |
| initialFactorBps | number | Factor inicial (8000 = 80%) |
| projectFeeBps | number | Fee del proyecto (500 = 5%) |
| unlockTimestamp | number | Unix timestamp de unlock |
| curveType | string | "LINEAR" o "EXPONENTIAL" |

## x402 Payment

- **Fee:** $1 USDC por deployment
- **Facilitator:** stack.perkos.xyz
- Ver `prompts/vault-intents.md` para flujo de pago

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

Ver `prompts/vault-intents.md` para patrones de comandos de voz.

## Respuestas

### Éxito
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
