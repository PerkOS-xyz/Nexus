import { NextRequest, NextResponse } from 'next/server';

// Nexus Agent endpoint
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

    // Try multiple endpoint formats for OpenClaw gateway
    const endpoints = [
      `${NEXUS_AGENT_URL}/api/message`,
      `${NEXUS_AGENT_URL}/api/agent/message`,
      `${NEXUS_AGENT_URL}/message`,
    ];

    let response = null;
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (NEXUS_AGENT_TOKEN) {
          headers['Authorization'] = `Bearer ${NEXUS_AGENT_TOKEN}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message }),
        });

        if (res.ok) {
          response = await res.json();
          break;
        } else if (res.status !== 404) {
          // Got a response but not success - log and try next
          console.log(`Endpoint ${endpoint} returned ${res.status}`);
          lastError = `HTTP ${res.status}`;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
        console.log(`Endpoint ${endpoint} failed:`, lastError);
      }
    }

    if (response) {
      return NextResponse.json({
        response: response.response || response.message || response.content || response.text,
      });
    }

    // Fallback response if agent is unavailable
    console.error('All agent endpoints failed:', lastError);
    return NextResponse.json({
      response: `🔗 I'm having trouble connecting to the Nexus Agent. Please try again in a moment.

In the meantime, you can create a vault directly at:
https://nexus.perkos.xyz/create

Or tell me about your token and I'll help you configure the parameters.`,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json({
      response: "I'm experiencing technical difficulties. Please try again shortly.",
    }, { status: 500 });
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
