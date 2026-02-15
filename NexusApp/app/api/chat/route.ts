import { NextRequest, NextResponse } from 'next/server';

// Nexus Agent endpoint (OpenClaw Gateway with OpenAI-compatible API)
const NEXUS_AGENT_URL = process.env.NEXUS_AGENT_URL || 'https://agent.nexus.perkos.xyz';
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

    // OpenClaw Gateway uses OpenAI-compatible endpoint
    const endpoint = `${NEXUS_AGENT_URL}/v1/chat/completions`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (NEXUS_AGENT_TOKEN) {
      headers['Authorization'] = `Bearer ${NEXUS_AGENT_TOKEN}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'openclaw:main',
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Agent endpoint returned ${res.status}:`, errorText);
      throw new Error(`Agent error: ${res.status}`);
    }

    const data = await res.json();
    
    // Extract response from OpenAI-compatible format
    const agentResponse = data.choices?.[0]?.message?.content 
      || data.choices?.[0]?.text 
      || 'No response from agent';

    return NextResponse.json({
      response: agentResponse,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback response if agent is unavailable
    return NextResponse.json({
      response: `🔗 I'm having trouble connecting to the Nexus Agent. Please try again in a moment.

In the meantime, you can create a vault directly at:
https://nexus.perkos.xyz/create

Or tell me about your token and I'll help you configure the parameters.`,
    });
  }
}

// Health check
export async function GET() {
  const health: {
    status: string;
    agentUrl: string;
    hasToken: boolean;
    timestamp: string;
    agentStatus?: string;
  } = {
    status: 'ok',
    agentUrl: NEXUS_AGENT_URL,
    hasToken: !!NEXUS_AGENT_TOKEN,
    timestamp: new Date().toISOString(),
  };

  // Quick check if agent is reachable
  try {
    const res = await fetch(`${NEXUS_AGENT_URL}/`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    health.agentStatus = res.ok ? 'connected' : `error-${res.status}`;
  } catch (err) {
    health.agentStatus = 'unreachable';
  }

  return NextResponse.json(health);
}
