'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import Link from 'next/link';
import { MessageSquare, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const isAuthenticated = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <span className="font-bold text-xl">Nexus</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              href="/liquidity" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              My Vaults
            </Link>
            <Link 
              href="/create" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Create Vault
            </Link>
            <DynamicWidget />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chat with Nexus
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Describe your token launch and I'll help you deploy a vault
            </p>
          </div>

          {/* Show wallet connection prompt if not connected */}
          {!isAuthenticated ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Connect your wallet to chat with Nexus AI and create your token vault. 
                Your wallet address will be used for vault deployment.
              </p>
              <DynamicWidget />
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-4">What you can do after connecting:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Chat with AI to create vaults</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Deploy tokens on Base</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Manage your vaults</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Connected wallet info */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Connected: {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-500">Base Network</span>
              </div>

              {/* Chat Interface */}
              <ChatInterface walletAddress={primaryWallet?.address} />
            </>
          )}

          {/* Info Cards - always visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-sm">Natural Language</h3>
              <p className="text-xs text-gray-500 mt-1">Just describe your token in plain English</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-sm">Instant Deploy</h3>
              <p className="text-xs text-gray-500 mt-1">$1 USDC fee, deployed in seconds</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-sm">Yield-Backed</h3>
              <p className="text-xs text-gray-500 mt-1">Deposits earn yield via Yearn V3</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
