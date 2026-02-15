'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import Link from 'next/link';

export default function ChatPage() {
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

          {/* Chat Interface */}
          <ChatInterface />

          {/* Info Cards */}
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
