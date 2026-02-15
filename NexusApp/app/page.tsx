"use client";

import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const isAuthenticated = useIsLoggedIn();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Nexus</h1>
        <DynamicWidget />
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Sovereign Token Launches with Yield-Backed Floors
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Deploy fixed-price vaults that turn idle capital into exit liquidity. 
          Your community gets time-locked protection. Your treasury gets automated yield. 
          Your ecosystem gets stability.
        </p>
        
        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-400">Connect your wallet to get started</p>
            <DynamicWidget />
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Deploy Vault
              </Button>
            </Link>
            <Link href="/liquidity">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Add Liquidity
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* The Mechanism: How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-4">The Mechanism</h3>
        <p className="text-gray-400 text-center mb-12">How It Works</p>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">1. Deploy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Set a fixed token price and funding cap. Launch your ERC-20 instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">2. Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                100% of USDC raised is routed to the Yield Orchestrator (e.g., Yearn).
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">3. Appreciate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Yield accrues to the Vault, increasing the TVL/supply ratio.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">4. Exit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Users burn tokens to claim USDC. The Dynamic Discount Factor (F%) rewards long-term conviction by improving exit terms over time.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features for Builders */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-gray-800/50">
        <h3 className="text-3xl font-bold text-center mb-12">Features for Builders</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Configurable Exit Curves</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Choose linear or exponential F% evolution to program your liquidity lifecycle.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Automated Treasury Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Platform and project fees are harvested directly from yield, not principal.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Zero Liquidity Fragmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                No need for complex AMM seeding. The vault is the liquidity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">OmiMesh Voice Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Monitor vault health hands-free. Query TVL, factors, and payouts via Omi AI wearables.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Tradeoffs */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Tradeoffs</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-lg">Liquidity vs. Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Full deployment into yield protocols maximizes the floor price but introduces smart contract risk from the underlying orchestrator (e.g., Yearn/Aave).
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-lg">Fixed Price vs. Price Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                While stable, a fixed-price vault lacks the "hype" potential of a bonding curve or open AMM. It attracts long-term holders rather than high-frequency speculators.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-lg">Exit Friction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                The discount factor (F%) acts as a soft lock. It prevents "vampire" exits early on but may deter users who demand 100% instant liquidity.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Major Risks */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-gray-800/50">
        <h3 className="text-3xl font-bold text-center mb-12">Major Risks</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-400 text-lg">Yield Compression</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                If the underlying yield protocol rates drop, the floor price growth slows, potentially making the F% climb feel stagnant.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-400 text-lg">Oracle/Data Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                If the TVL calculation relies on external oracles for yield bearing assets, there is a risk of arbitrage during high volatility.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-400 text-lg">Contract Dependency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                The system is only as secure as the Orchestrator and the third-party vaults it deposits into.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Second-Order Effects */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Second-Order Effects</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-blue-900/50">
            <CardHeader>
              <CardTitle className="text-blue-400 text-lg">Supply Deflation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Every exit burns tokens, increasing the TVL/supply ratio for remaining holders. This creates a "Last Man Standing" incentive where the final holders capture the most yield.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-blue-900/50">
            <CardHeader>
              <CardTitle className="text-blue-400 text-lg">Governance Stability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Since exits are yield-optimized, "rage-quitting" becomes a calculated financial decision rather than a governance-destabilizing event.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Launch?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Deploy your sovereign token with yield-backed floors today.
          </p>
          {!isAuthenticated ? (
            <DynamicWidget />
          ) : (
            <Link href="/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Deploy Your Vault
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">
          <p>Built at ETH Boulder 2026</p>
        </div>
      </footer>
    </main>
  );
}
