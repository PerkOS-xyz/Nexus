import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Direct Anthropic API call for chat
// In production, this should go through the Nexus Agent
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Nexus, an AI assistant that helps users deploy Token Vaults on Base.

Your capabilities:
- Help users configure vault parameters (name, symbol, cap, duration)
- Explain how Token Vaults work with yield-backed exits
- Guide users through the $1 USDC deployment fee (x402 payment)
- Provide information about their deployed vaults

Vault Parameters:
- name: Token name (e.g., "Sunrise Token")
- symbol: Token symbol, 3-5 characters (e.g., "SUN")
- cap: Maximum USDC to raise (e.g., 50000)
- duration: Lock period in days (e.g., 30, 60, 90)
- initialFactor: Starting exit factor, default 80% (users get 80% if they exit immediately)
- curveType: LINEAR or EXPONENTIAL factor growth

How it works:
1. User deposits USDC → receives vault tokens at fixed price
2. Deposits go to Yearn V3 vault → earn yield
3. Exit factor starts at 80% and increases over time
4. When user withdraws, they get: (TVL/supply) × tokens × factor%

Deployed on Base (chain ID 8453).
VaultFactory: 0x9Df66106201d04CF8398d6387C2D022eb9353c73

When a user wants to create a vault, extract the parameters and confirm:
- Token name and symbol
- Fundraising cap in USDC
- Lock duration in days
- Initial factor (default 80%)

Then direct them to: https://nexus.perkos.xyz/create?name=X&symbol=Y&cap=Z&duration=D

Be concise, helpful, and friendly. Use emojis sparingly.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history
    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent ? textContent.text : 'I apologize, I could not generate a response.';

    return NextResponse.json({
      response: responseText,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Graceful fallback
    return NextResponse.json({
      response: "I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, you can create a vault directly at:\nhttps://nexus.perkos.xyz/create"
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    model: 'claude-sonnet-4-20250514',
    note: 'Direct Anthropic API mode'
  });
}
