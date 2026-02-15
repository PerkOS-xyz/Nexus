"use client";

import { useState } from "react";
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Upload, Twitter, Send, Mail, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { RiskModal } from "@/components/legal";

export default function CreateProject() {
  const isAuthenticated = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Project Info, 2: Vault Config
  const [showRiskModal, setShowRiskModal] = useState(false);
  
  // Project Info
  const [projectData, setProjectData] = useState({
    projectName: "",
    description: "",
    bannerUrl: "",
    logoUrl: "",
    twitter: "",
    telegram: "",
    email: "",
  });

  // Vault Config
  const [vaultData, setVaultData] = useState({
    tokenName: "",
    tokenSymbol: "",
    cap: "",
    duration: "30",
    initialFactor: "80",
    projectFee: "5",
  });

  // File upload states
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVaultData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') {
          setBannerFile(file);
          setBannerPreview(reader.result as string);
        } else {
          setLogoFile(file);
          setLogoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!primaryWallet) return;

    setIsLoading(true);
    try {
      // Combine project and vault data
      const createRequest = {
        project: {
          ...projectData,
          bannerUrl: bannerPreview || projectData.bannerUrl,
          logoUrl: logoPreview || projectData.logoUrl,
        },
        vault: vaultData,
        userWallet: primaryWallet.address,
      };

      // Send to Nexus Agent via chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create a vault for my project:
Project Name: ${projectData.projectName}
Description: ${projectData.description}
Token Name: ${vaultData.tokenName}
Token Symbol: ${vaultData.tokenSymbol}
Cap: ${vaultData.cap} USDC
Duration: ${vaultData.duration} days
My wallet: ${primaryWallet.address}`,
        }),
      });

      const data = await response.json();
      console.log("Agent response:", data);
      
      // TODO: Parse vault address from response and redirect
      alert("Vault creation request sent! Check the chat for details.");
      
    } catch (error) {
      console.error("Error creating vault:", error);
      alert("Error creating vault. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = projectData.projectName && projectData.description;
  const isStep2Valid = vaultData.tokenName && vaultData.tokenSymbol && vaultData.cap;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold">🏦 Nexus</Link>
          <DynamicWidget />
        </header>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Connect Wallet to Create a Project</h2>
          <p className="text-gray-400 mb-8">You need to connect your wallet to create a token vault.</p>
          <DynamicWidget />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">🏦 Nexus</Link>
        <div className="flex items-center gap-4">
          <Link href="/chat" className="text-sm text-gray-400 hover:text-white">Chat</Link>
          <Link href="/liquidity" className="text-sm text-gray-400 hover:text-white">My Vaults</Link>
          <DynamicWidget />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm">Project Info</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>
              2
            </div>
            <span className="text-sm">Vault Config</span>
          </div>
        </div>
      </div>

      <section className="max-w-2xl mx-auto px-6 pb-12">
        {/* Step 1: Project Info */}
        {step === 1 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Project Information</CardTitle>
              <CardDescription className="text-gray-300">
                Tell us about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-white">Project Name *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="My Awesome Project"
                  value={projectData.projectName}
                  onChange={handleProjectChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project, its goals, and what makes it unique..."
                  value={projectData.description}
                  onChange={handleProjectChange}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  required
                />
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <Label className="text-white">Banner Image</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                  {bannerPreview ? (
                    <div className="relative">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded" />
                      <button 
                        onClick={() => { setBannerFile(null); setBannerPreview(""); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-4">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Click to upload banner (1200x400 recommended)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'banner')}
                      />
                    </label>
                  )}
                </div>
                <Input
                  name="bannerUrl"
                  placeholder="Or paste banner URL"
                  value={projectData.bannerUrl}
                  onChange={handleProjectChange}
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-white">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center hover:border-gray-500 transition-colors overflow-hidden">
                    {logoPreview ? (
                      <div className="relative w-full h-full">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setLogoFile(null); setLogoPreview(""); }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer p-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-400 text-center mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'logo')}
                        />
                      </label>
                    )}
                  </div>
                  <Input
                    name="logoUrl"
                    placeholder="Or paste logo URL"
                    value={projectData.logoUrl}
                    onChange={handleProjectChange}
                    className="bg-gray-700 border-gray-600 text-white text-sm flex-1"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label className="text-white">Social Links</Label>
                
                <div className="flex items-center gap-3">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <Input
                    name="twitter"
                    placeholder="@yourproject"
                    value={projectData.twitter}
                    onChange={handleProjectChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-blue-400" />
                  <Input
                    name="telegram"
                    placeholder="@yourproject (optional)"
                    value={projectData.telegram}
                    onChange={handleProjectChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="contact@project.com (optional)"
                    value={projectData.email}
                    onChange={handleProjectChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!isStep1Valid}
              >
                Next: Vault Configuration <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vault Config */}
        {step === 2 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Vault Configuration</CardTitle>
              <CardDescription className="text-gray-300">
                Configure your token vault parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Name & Symbol */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName" className="text-white">Token Name *</Label>
                  <Input
                    id="tokenName"
                    name="tokenName"
                    placeholder="My Project Token"
                    value={vaultData.tokenName}
                    onChange={handleVaultChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol" className="text-white">Token Symbol *</Label>
                  <Input
                    id="tokenSymbol"
                    name="tokenSymbol"
                    placeholder="MPT"
                    maxLength={5}
                    value={vaultData.tokenSymbol}
                    onChange={handleVaultChange}
                    className="bg-gray-700 border-gray-600 text-white uppercase"
                    required
                  />
                </div>
              </div>

              {/* Cap */}
              <div className="space-y-2">
                <Label htmlFor="cap" className="text-white">Fundraising Cap (USDC) *</Label>
                <Input
                  id="cap"
                  name="cap"
                  type="number"
                  min="10"
                  placeholder="10000"
                  value={vaultData.cap}
                  onChange={handleVaultChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
                <p className="text-sm text-gray-400">Maximum amount of USDC to raise</p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Lock Duration (days)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="7"
                  max="365"
                  placeholder="30"
                  value={vaultData.duration}
                  onChange={handleVaultChange}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400">How long before users can withdraw (7-365 days)</p>
              </div>

              {/* Advanced Settings */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                  Advanced Settings ▾
                </summary>
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="initialFactor" className="text-white">Initial Factor (%)</Label>
                      <Input
                        id="initialFactor"
                        name="initialFactor"
                        type="number"
                        min="50"
                        max="100"
                        value={vaultData.initialFactor}
                        onChange={handleVaultChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-500">Exit discount at start (80% = 20% discount)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectFee" className="text-white">Project Fee (%)</Label>
                      <Input
                        id="projectFee"
                        name="projectFee"
                        type="number"
                        min="0"
                        max="10"
                        value={vaultData.projectFee}
                        onChange={handleVaultChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-500">Your share of yield generated</p>
                    </div>
                  </div>
                </div>
              </details>

              {/* Summary */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-white">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Project:</span>
                  <span className="text-white">{projectData.projectName}</span>
                  <span className="text-gray-400">Token:</span>
                  <span className="text-white">{vaultData.tokenName} ({vaultData.tokenSymbol})</span>
                  <span className="text-gray-400">Cap:</span>
                  <span className="text-white">{vaultData.cap || '0'} USDC</span>
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{vaultData.duration} days</span>
                  <span className="text-gray-400">Launch Fee:</span>
                  <span className="text-green-400">$1 USDC</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setShowRiskModal(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!isStep2Valid || isLoading}
                >
                  {isLoading ? "Creating..." : "Create Vault"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Risk Modal */}
      <RiskModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onAccept={() => {
          setShowRiskModal(false);
          handleSubmit();
        }}
        action="create"
      />
    </main>
  );
}
