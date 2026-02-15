'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  action: 'deposit' | 'withdraw' | 'create';
}

export function RiskModal({ isOpen, onClose, onAccept, action }: RiskModalProps) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const actionText = {
    deposit: 'Deposit Funds',
    withdraw: 'Withdraw Funds',
    create: 'Create Vault',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full mx-4 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Risk Acknowledgment</h2>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-gray-300">
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
            <p className="font-semibold text-red-400 mb-2">⚠️ Critical Risks</p>
            <ul className="space-y-2 text-red-300">
              <li>• <strong>Your funds are deposited into third-party protocols</strong> (Yearn, Aave, etc.)</li>
              <li>• <strong>Principal loss is possible</strong> if the yield orchestrator is hacked or fails</li>
              <li>• <strong>Exit value depends on TVL and yield performance</strong> — not guaranteed</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-200 mb-2">Smart Contract Risks</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Contracts may contain undiscovered vulnerabilities</li>
              <li>• All blockchain transactions are irreversible</li>
              <li>• You are responsible for your private key security</li>
            </ul>
          </div>

          {action === 'create' && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <p className="font-semibold text-blue-400 mb-2">📜 BSL 1.1 License Notice</p>
              <p className="text-blue-300">
                Commercial use is free up to <strong>$5,000,000 USD TVL</strong>. 
                Exceeding this limit requires a commercial license agreement.
              </p>
            </div>
          )}
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mt-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            I understand that my funds are deposited into external protocols and that my exit value 
            depends on the performance and security of third parties. <strong>I accept full responsibility for any losses.</strong>
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (checked) {
                onAccept();
                setChecked(false);
              }
            }}
            disabled={!checked}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
              checked 
                ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {actionText[action]}
          </button>
        </div>
      </div>
    </div>
  );
}
