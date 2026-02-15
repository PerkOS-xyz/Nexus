'use client';

import { useState } from 'react';
import { AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export function DisclaimerFooter() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 text-xs">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Risk Disclaimer</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? 'Show Less' : 'Read Full Disclaimer'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-3">
          {/* Always visible summary */}
          <p>
            <strong className="text-yellow-500">⚠️ Experimental Software:</strong> This platform is provided "AS IS" without warranties. 
            Your funds interact with third-party protocols (Yearn, Aave, etc.) and <strong className="text-red-400">may be lost due to hacks, bugs, or protocol failures</strong>.
          </p>

          {/* Expanded content */}
          {expanded && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">1. Experimental Software</h4>
                <p>
                  Token Vault Launcher software is provided "AS IS", without warranties of any kind, express or implied. 
                  Use of this platform, vault deployment, and asset deposits are at your own risk and discretion.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300 mb-2">2. Third-Party & Composability Risks</h4>
                <p>
                  This platform interacts with third-party protocols (Yearn, Aave, or other Yield Orchestrators).
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong className="text-red-400">Third-Party Failure:</strong> We are not responsible for fund losses from hacks, logic errors, insolvency, or malfunction of external protocols.</li>
                  <li><strong className="text-red-400">Yield Risk:</strong> Accumulated yield is not guaranteed. If the external protocol suffers capital loss, the vault's TVL will decrease, directly affecting token withdrawal ratios.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300 mb-2">3. Smart Contract Risks</h4>
                <p>
                  Despite testing, smart contracts may contain critical vulnerabilities. By interacting with the system, you acknowledge:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your assets may be lost partially or entirely due to code errors or malicious attacks.</li>
                  <li>Blockchain transactions are irreversible.</li>
                  <li>You are solely responsible for private key security and OmiMesh voice system interactions.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300 mb-2">4. Commercial Use Limitation (BSL 1.1)</h4>
                <p>
                  Commercial use of this code is subject to Business Source License 1.1. 
                  Free use is permitted as long as total TVL managed by your entity does not exceed <strong>$5,000,000 USD</strong>. 
                  Exceeding this limit without a signed commercial license constitutes an intellectual property violation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300 mb-2">5. Legal Compliance</h4>
                <p>
                  You are responsible for ensuring platform use and token issuance comply with your local jurisdiction's laws and regulations. 
                  Token Vault Launcher is not a financial institution and does not provide investment advice.
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-500 pt-2 border-t border-gray-800">
            © 2026 PerkOS. Built for ETH Boulder 2026. 
            <a href="https://github.com/PerkOS-xyz/Nexus" className="text-blue-400 hover:text-blue-300 ml-2 inline-flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
