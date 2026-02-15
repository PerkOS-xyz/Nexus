# Vault Voice Command Patterns

Patrones de comandos de voz para interactuar con Nexus vaults.

## Create Vault Intent

**Triggers:**
- "I want to create a token"
- "Launch a new token"
- "Create a vault for my project"
- "Deploy a token called..."
- "Help me launch a token"

**Extract:**
- `name` — Token name
- `symbol` — Token symbol (3-5 chars)
- `cap` — Funding cap in USDC
- `duration` — Lock duration

**Example:**
> "I want to create a token called Sunrise Token with symbol SUN, 
> raising 50,000 USDC over 60 days"

→ Extract: `{ name: "Sunrise Token", symbol: "SUN", cap: 50000, duration: 60 }`

---

## Check Vault Status Intent

**Triggers:**
- "Check my vault"
- "What's the status of..."
- "How much is in the vault"
- "What's the current factor"
- "Show vault stats"

**Extract:**
- `vaultAddress` — From context or explicit

**Response includes:**
- TVL (total value locked)
- Current factor %
- Yield accumulated
- Lock status

---

## Preview Withdrawal Intent

**Triggers:**
- "How much would I get if I withdraw"
- "Preview withdrawal"
- "What's my payout"
- "Calculate exit value"

**Extract:**
- `amount` — Token amount to withdraw
- `vaultAddress` — From context

**Response includes:**
- Estimated payout in USDC
- Current factor
- Profit/loss %

---

## Deposit Intent

**Triggers:**
- "I want to deposit"
- "Add USDC to vault"
- "Buy tokens"
- "Invest in..."

**Extract:**
- `amount` — USDC amount
- `vaultAddress` — From context

**Response:**
- Generate transaction link
- Estimate tokens received

---

## Withdraw Intent

**Triggers:**
- "I want to withdraw"
- "Cash out"
- "Redeem my tokens"
- "Exit the vault"

**Extract:**
- `amount` — Token amount (or "all")
- `vaultAddress` — From context

**Response:**
- Check if unlocked
- Show payout preview
- Generate transaction link

---

## Payment Flow (x402)

When creating a vault, the agent must:

1. **Confirm parameters** with user
2. **Request $1 USDC payment**
   - "To deploy your vault, please confirm the $1 USDC service fee"
3. **Wait for payment confirmation**
4. **Deploy vault**
5. **Return addresses**

**Payment prompt:**
```
Your vault is ready to deploy:
- Token: {name} ({symbol})
- Cap: {cap} USDC
- Duration: {duration} days

Service fee: $1 USDC

Please confirm the payment to proceed.
```

---

## Error Handling

**Insufficient balance:**
> "You don't have enough USDC for this deposit. You need {amount} USDC."

**Vault locked:**
> "This vault is still locked. Withdrawals will be available on {unlockDate}."

**Low factor warning:**
> "The current exit factor is {factor}%. If you withdraw now, you'll receive {payout} USDC ({loss}% loss). Do you want to proceed?"

**Payment failed:**
> "Payment verification failed. Please try again or contact support."
