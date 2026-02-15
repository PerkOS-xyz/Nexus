"use client";

import { useState } from "react";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

// Mock data for vaults - replace with actual contract reads
const mockVaults = [
  {
    id: "0x1234...5678",
    name: "USDC Yield Vault",
    symbol: "yvUSDC",
    apy: 8.5,
    tokenPrice: 1.02,
    totalSupply: 500000,
    factor: 1.025,
    userBalance: 0,
    depositAsset: "USDC",
  },
  {
    id: "0xabcd...ef01",
    name: "ETH Growth Vault",
    symbol: "yvETH",
    apy: 12.3,
    tokenPrice: 2450.00,
    totalSupply: 1000,
    factor: 1.045,
    userBalance: 5.5,
    depositAsset: "ETH",
  },
];

interface Vault {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  tokenPrice: number;
  totalSupply: number;
  factor: number;
  userBalance: number;
  depositAsset: string;
}

export default function LiquidityPage() {
  const { isAuthenticated } = useDynamicContext();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount) return;
    setIsLoading(true);
    try {
      // TODO: Call vault.deposit() with amount
      console.log(`Depositing ${depositAmount} to ${selectedVault.name}`);
      alert("Deposit coming soon!");
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setIsLoading(false);
      setIsDepositOpen(false);
      setDepositAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!selectedVault) return;
    setIsLoading(true);
    try {
      // TODO: Call vault.withdraw() with user balance
      console.log(`Withdrawing from ${selectedVault.name}`);
      alert("Withdraw coming soon!");
    } catch (error) {
      console.error("Withdraw error:", error);
    } finally {
      setIsLoading(false);
      setIsWithdrawOpen(false);
    }
  };

  const calculateWithdrawValue = (vault: Vault) => {
    return (vault.userBalance * vault.factor * vault.tokenPrice).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold">ETH Boulder Vault</Link>
          <DynamicWidget />
        </header>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Connect Wallet to Add Liquidity</h2>
          <DynamicWidget />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">ETH Boulder Vault</Link>
        <DynamicWidget />
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8">Available Vaults</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVaults.map((vault) => (
            <Card key={vault.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{vault.name}</span>
                  <span className="text-green-400 text-lg">{vault.apy}% APY</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {vault.symbol} • {vault.depositAsset}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Token Price</p>
                    <p className="text-white font-medium">${vault.tokenPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Supply</p>
                    <p className="text-white font-medium">{vault.totalSupply.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Factor</p>
                    <p className="text-white font-medium">{vault.factor.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Your Balance</p>
                    <p className="text-white font-medium">{vault.userBalance} {vault.symbol}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedVault(vault);
                      setIsDepositOpen(true);
                    }}
                  >
                    Add Liquidity
                  </Button>
                  {vault.userBalance > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1 border-white text-white hover:bg-white/10"
                      onClick={() => {
                        setSelectedVault(vault);
                        setIsWithdrawOpen(true);
                      }}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Liquidity to {selectedVault?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Deposit {selectedVault?.depositAsset} to receive {selectedVault?.symbol} tokens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Amount to Deposit</label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="text-sm text-gray-400">
              Current APY: <span className="text-green-400">{selectedVault?.apy}%</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount}
            >
              {isLoading ? "Depositing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Withdraw from {selectedVault?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Withdraw your {selectedVault?.symbol} tokens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Your Balance</span>
                <span>{selectedVault?.userBalance} {selectedVault?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Factor</span>
                <span>{selectedVault?.factor.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2 mt-2">
                <span className="text-gray-300">You will receive</span>
                <span className="text-green-400">
                  ${selectedVault ? calculateWithdrawValue(selectedVault) : "0.00"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              {isLoading ? "Withdrawing..." : "Withdraw All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
