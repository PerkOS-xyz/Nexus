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
          Earn Yield on Your Tokens
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Create configurable vaults with target APY, deposit your tokens, 
          and watch your balance grow over time.
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
                Create Project
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

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">1. Create a Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Configure your vault with token address, initial price, 
                total supply, target APY, and duration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">2. Add Liquidity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Deposit tokens into the vault and receive vault tokens 
                representing your share of the pool.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">3. Earn Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                The vault factor increases over time. Withdraw anytime 
                to claim your principal plus earned yield.
              </CardDescription>
            </CardContent>
          </Card>
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
