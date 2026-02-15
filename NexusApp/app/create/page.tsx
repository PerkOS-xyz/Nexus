"use client";

import { useState } from "react";
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function CreateProject() {
  const isAuthenticated = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    depositAsset: "",
    initialPrice: "",
    maxTokenSupply: "",
    targetAPY: "",
    duration: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryWallet) return;

    setIsLoading(true);
    try {
      // TODO: Call VaultFactory.createVault() with form data
      console.log("Creating vault with:", formData);
      
      // Placeholder for contract interaction
      alert("Vault creation coming soon!");
    } catch (error) {
      console.error("Error creating vault:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold">Nexus</Link>
          <DynamicWidget />
        </header>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Connect Wallet to Create a Project</h2>
          <DynamicWidget />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">Nexus</Link>
        <DynamicWidget />
      </header>

      <section className="max-w-2xl mx-auto px-6 py-12">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Create New Vault</CardTitle>
            <CardDescription className="text-gray-300">
              Configure your vault parameters to deploy a new token vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName" className="text-white">Token Name</Label>
                  <Input
                    id="tokenName"
                    name="tokenName"
                    placeholder="My Vault Token"
                    value={formData.tokenName}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol" className="text-white">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    name="tokenSymbol"
                    placeholder="MVT"
                    value={formData.tokenSymbol}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAsset" className="text-white">Deposit Asset Address</Label>
                <Input
                  id="depositAsset"
                  name="depositAsset"
                  placeholder="0x..."
                  value={formData.depositAsset}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white font-mono"
                  required
                />
                <p className="text-sm text-gray-400">The ERC20 token users will deposit</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialPrice" className="text-white">Initial Price (USD)</Label>
                  <Input
                    id="initialPrice"
                    name="initialPrice"
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={formData.initialPrice}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokenSupply" className="text-white">Max Token Supply</Label>
                  <Input
                    id="maxTokenSupply"
                    name="maxTokenSupply"
                    type="number"
                    placeholder="1000000"
                    value={formData.maxTokenSupply}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAPY" className="text-white">Target APY (%)</Label>
                  <Input
                    id="targetAPY"
                    name="targetAPY"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={formData.targetAPY}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration (days)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    placeholder="365"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Vault..." : "Create Vault"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
