"use client";

import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare, Rocket, TrendingUp, Shield, Zap, Users, Mic, Github, Twitter } from "lucide-react";

export default function Home() {
  const isAuthenticated = useIsLoggedIn();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <h1 className="text-2xl font-bold">Nexus</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/chat" className="hover:text-white transition-colors flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> Chat with AI
          </Link>
          <Link href="/create" className="hover:text-white transition-colors">Create Vault</Link>
          <Link href="/liquidity" className="hover:text-white transition-colors">My Vaults</Link>
        </nav>
        <DynamicWidget />
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-full px-4 py-2 text-sm text-blue-300 mb-6">
          <Zap className="w-4 h-4" />
          Built at ETH Boulder 2026
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Sovereign Token Launches<br />
          <span className="text-blue-400">with Yield-Backed Floors</span>
        </h2>
        
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Deploy fixed-price vaults powered by AI. Chat with Nexus Agent to create your token vault,
          route deposits to yield protocols, and give your community time-locked protection.
        </p>
        
        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-4">
            <DynamicWidget />
            <p className="text-gray-500 text-sm">Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat with Nexus AI
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-white/10 gap-2">
                <Rocket className="w-5 h-5" />
                Create Vault
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-blue-400">$1</div>
            <div className="text-sm text-gray-400">Launch Fee</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">100%</div>
            <div className="text-sm text-gray-400">Yield Deployed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">ERC-4626</div>
            <div className="text-sm text-gray-400">Yearn Integration</div>
          </div>
        </div>
      </section>

      {/* AI-Powered Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl p-8 md:p-12 border border-purple-700/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">AI-Powered Deployment</h3>
              <p className="text-gray-300 mb-6">
                Just chat with Nexus Agent to create your vault. Describe your project in natural language, 
                and the AI handles the smart contract deployment, parameter configuration, and Firebase storage.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Natural language vault creation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  x402 payment integration ($1 USDC fee)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Automatic contract deployment on Base
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Voice commands via OmiMesh (coming soon)
                </li>
              </ul>
              <Link href="/chat" className="inline-block mt-6">
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Try the AI Agent
                </Button>
              </Link>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500 ml-2">nexus-chat</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <span className="text-blue-400">You:</span> Create a vault for my project "Solar DAO" with 10k USDC cap and 30 day lock
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <span className="text-green-400">Nexus:</span> ✅ Vault deployed!
                  <br /><span className="text-gray-400">Token: SOLAR</span>
                  <br /><span className="text-gray-400">Vault: 0xb2cc...e104</span>
                  <br /><span className="text-gray-400">Cap: 10,000 USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-4">How It Works</h3>
        <p className="text-gray-400 text-center mb-12">The Nexus Mechanism</p>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">1</div>
              <CardTitle className="text-white text-lg">Deploy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Set a fixed token price and funding cap. Launch your ERC-20 via AI or form.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">2</div>
              <CardTitle className="text-white text-lg">Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                100% of USDC raised is routed to Yearn V3 vaults (ERC-4626) for yield.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">3</div>
              <CardTitle className="text-white text-lg">Appreciate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Yield accrues to the vault, increasing the TVL/supply ratio over time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">4</div>
              <CardTitle className="text-white text-lg">Exit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Burn tokens to claim USDC. Dynamic Factor (F%) rewards long-term conviction.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-gray-800/50">
        <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white text-lg">Yield-Backed Floors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                All deposits earn yield via Yearn V3. Exit price improves over time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white text-lg">Time-Locked Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Configurable lock periods prevent dumps and align long-term incentives.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white text-lg">Instant Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Just $1 USDC to deploy. No complex AMM seeding required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <Mic className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white text-lg">Voice Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Monitor vault health hands-free via OmiMesh AI wearables.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Tech Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Base L2</div>
            <div className="text-sm text-gray-400">Blockchain</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-semibold">OpenClaw</div>
            <div className="text-sm text-gray-400">AI Agent</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-2xl mb-2">📈</div>
            <div className="font-semibold">Yearn V3</div>
            <div className="text-sm text-gray-400">Yield Protocol</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-2xl mb-2">💳</div>
            <div className="font-semibold">x402</div>
            <div className="text-sm text-gray-400">Payments</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-12 border border-blue-700/30">
          <h3 className="text-3xl font-bold mb-4">Ready to Launch Your Token?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Deploy your sovereign token with yield-backed floors in minutes. 
            Just $1 USDC to get started.
          </p>
          {!isAuthenticated ? (
            <DynamicWidget />
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
                  <Rocket className="w-5 h-5" />
                  Create Vault
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏦</span>
              <span className="font-bold">Nexus</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-sm">ETH Boulder 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="https://github.com/PerkOS-xyz/Nexus" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="https://twitter.com/PerkOS_xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
              <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
              <Link href="/create" className="hover:text-white transition-colors">Create</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
