import React, { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upload'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          1. Upload CSV
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          2. Generate Proof
        </button>
        <button
          onClick={() => setActiveTab('execute')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'execute'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          3. Execute
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'upload' && (
            <div className="card">
              <div className="card-header">Upload Payroll CSV</div>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <p className="text-gray-400 mb-2">Drag and drop your payroll CSV here</p>
                <p className="text-sm text-gray-500">or click to select file</p>
              </div>
              <div className="mt-4 p-4 bg-slate-700 rounded-lg text-sm text-gray-400">
                <p>Expected CSV format:</p>
                <p>recipient_address, amount, did, tax_jurisdiction</p>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="card">
              <div className="card-header">Generate ZK Proof</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Audit Key</label>
                  <input
                    type="password"
                    placeholder="Enter encryption key for audit trail"
                    className="input-field"
                  />
                </div>
                <button className="w-full btn-primary">
                  Generate Proof (Estimated: 30 seconds for 500 recipients)
                </button>
                <div className="p-4 bg-slate-700 rounded-lg text-sm text-gray-300">
                  <p className="font-medium mb-2">Proof Generation Status:</p>
                  <p>Ready to generate proof...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execute' && (
            <div className="card">
              <div className="card-header">Execute on Stellar</div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-200">
                    ℹ️ Your proof is ready to submit to Stellar testnet
                  </p>
                </div>
                <button className="w-full btn-primary">
                  Submit Transaction to Stellar
                </button>
                <div className="p-4 bg-slate-700 rounded-lg text-sm text-gray-300">
                  <p className="font-medium mb-2">Execution Status:</p>
                  <p>Transaction status will appear here...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="card h-fit">
          <div className="card-header">Batch Summary</div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">Total Recipients</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-white">$0.00</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-blue-400 font-medium">Ready</p>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <button className="w-full btn-secondary text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
