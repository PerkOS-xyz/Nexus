import { NextRequest, NextResponse } from 'next/server';

// Nexus Agent endpoint - configure in .env
const NEXUS_AGENT_URL = process.env.NEXUS_AGENT_URL || 'http://localhost:18789';
const NEXUS_AGENT_TOKEN = process.env.NEXUS_AGENT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send message to Nexus Agent via OpenClaw API
    const agentResponse = await fetch(`${NEXUS_AGENT_URL}/api/agent/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NEXUS_AGENT_TOKEN && { 'Authorization': `Bearer ${NEXUS_AGENT_TOKEN}` }),
      },
      body: JSON.stringify({
        message,
        // Include wallet address if available (for context)
        // walletAddress: request.headers.get('x-wallet-address'),
      }),
    });

    if (!agentResponse.ok) {
      console.error('Agent response error:', agentResponse.status);
      
      // Fallback: Return a helpful message if agent is unavailable
      if (agentResponse.status === 404 || agentResponse.status === 502) {
        return NextResponse.json({
          response: "🔗 Nexus Agent is currently starting up. Please try again in a moment.\n\nIn the meantime, you can tell me about the token you'd like to create:\n- Token name and symbol\n- Fundraising cap (in USDC)\n- Lock duration (in days)"
        });
      }
      
      throw new Error(`Agent error: ${agentResponse.status}`);
    }

    const data = await agentResponse.json();
    
    return NextResponse.json({
      response: data.response || data.message || data.content,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Graceful fallback for development/demo
    return NextResponse.json({
      response: "I'm having trouble connecting to the backend. Let me help you anyway!\n\nTo create a Token Vault, I'll need:\n1. **Token Name** (e.g., \"Sunrise Token\")\n2. **Symbol** (e.g., \"SUN\")\n3. **Cap** (how much USDC to raise)\n4. **Duration** (lock period in days)\n\nTell me about your project and I'll configure the vault for you."
    });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', agent: NEXUS_AGENT_URL });
}
