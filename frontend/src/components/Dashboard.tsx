import React, { useState } from 'react';
import CSVUpload from './CSVUpload';
import { PayloadData, ProofGenerationState, TransactionState } from '../types';
import { formatAmount } from '../utils/csv';
import { generateProof, verifyProofFormat } from '../utils/noir';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [payload, setPayload] = useState<PayloadData | null>(null);
  const [proof, setProof] = useState<ProofGenerationState>({ status: 'idle' });
  const [tx, setTx] = useState<TransactionState>({ status: 'idle' });
  const [error, setError] = useState<string>('');
  const [auditKey, setAuditKey] = useState('');

  const handlePayloadLoaded = (data: PayloadData) => {
    setPayload(data);
    setError('');
  };

  const handleError = (err: string) => {
    setError(err);
  };

  const handleGenerateProof = async () => {
    if (!payload) {
      setError('Please load a CSV first');
      return;
    }

    setProof({ status: 'generating' });
    try {
      const proofData = await generateProof(payload, auditKey);
      const validation = verifyProofFormat(proofData);

      if (!validation.valid) {
        setProof({
          status: 'error',
          error: validation.errors.join('; '),
        });
        return;
      }

      setProof({
        status: 'ready',
        proof: proofData.proof,
        publicInputs: JSON.stringify(proofData.publicInputs),
      });
      setActiveTab('execute');
    } catch (err) {
      setProof({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to generate proof',
      });
    }
  };

  const handleExecute = async () => {
    if (!proof.proof) {
      setError('Please generate proof first');
      return;
    }

    setTx({ status: 'pending' });
    try {
      await new Promise(r => setTimeout(r, 1500));
      setTx({
        status: 'success',
        txHash: 'mock_tx_' + Math.random().toString(36).slice(2),
      });
    } catch (err) {
      setTx({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to submit transaction',
      });
    }
  };

  const getStatus = () => {
    if (payload) return 'Loaded ✓';
    return 'Awaiting CSV';
  };

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
          disabled={!payload}
        >
          1. Upload CSV {payload && '✓'}
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          disabled={!payload}
        >
          2. Generate Proof {proof.status === 'ready' && '✓'}
        </button>
        <button
          onClick={() => setActiveTab('execute')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'execute'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          disabled={!proof.proof}
        >
          3. Execute {tx.status === 'success' && '✓'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'upload' && (
            <div className="card">
              <div className="card-header">Upload Payroll CSV</div>
              <CSVUpload onDataLoaded={handlePayloadLoaded} onError={handleError} />
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="card">
              <div className="card-header">Generate ZK Proof</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Audit Key (optional)</label>
                  <input
                    type="password"
                    placeholder="Enter encryption key for audit trail"
                    className="input-field"
                    value={auditKey}
                    onChange={e => setAuditKey(e.target.value)}
                    disabled={proof.status === 'generating'}
                  />
                </div>
                <button
                  onClick={handleGenerateProof}
                  disabled={proof.status === 'generating' || !payload}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {proof.status === 'generating' ? 'Generating Proof...' : `Generate ZK Proof (~${payload?.recipientCount || 0} recipients)`}
                </button>
                <div className="p-4 bg-slate-700 rounded-lg text-sm text-gray-300 space-y-2">
                  <p className="font-medium">Proof Generation Status:</p>
                  {proof.status === 'idle' && <p>Ready to generate proof...</p>}
                  {proof.status === 'generating' && <p className="text-blue-400">Computing ZK proof (Poseidon hashing)...</p>}
                  {proof.status === 'ready' && (
                    <>
                      <p className="text-green-400">✓ Proof generated successfully</p>
                      <div className="bg-slate-800 rounded p-2 max-h-32 overflow-y-auto text-xs font-mono">
                        <p className="text-gray-400">Proof: {proof.proof?.slice(0, 30)}...</p>
                        {proof.publicInputs && (
                          <>
                            <p className="text-gray-400 mt-1">Public Inputs:</p>
                            <pre className="text-gray-400 text-xs whitespace-pre-wrap break-words">
                              {JSON.stringify(JSON.parse(proof.publicInputs), null, 2).slice(0, 200)}...
                            </pre>
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {proof.status === 'error' && <p className="text-red-400">Error: {proof.error}</p>}
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
                <button
                  onClick={handleExecute}
                  disabled={tx.status === 'pending'}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tx.status === 'pending' ? 'Submitting...' : 'Submit Transaction to Stellar'}
                </button>
                <div className="p-4 bg-slate-700 rounded-lg text-sm text-gray-300">
                  <p className="font-medium mb-2">Execution Status:</p>
                  {tx.status === 'idle' && <p>Ready to execute...</p>}
                  {tx.status === 'pending' && <p className="text-blue-400">Submitting transaction...</p>}
                  {tx.status === 'success' && (
                    <>
                      <p className="text-green-400">✓ Transaction successful</p>
                      <p className="text-xs text-gray-400 mt-2">TX: {tx.txHash?.slice(0, 20)}...</p>
                    </>
                  )}
                  {tx.status === 'error' && <p className="text-red-400">{tx.error}</p>}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="card h-fit">
          <div className="card-header">Batch Summary</div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">Total Recipients</p>
              <p className="text-2xl font-bold text-white">{payload?.recipientCount || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-white">
                {payload ? formatAmount(payload.totalAmount) : '0'} XLM
              </p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-blue-400 font-medium">{getStatus()}</p>
            </div>
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <p className="text-xs text-gray-500">CSV: {payload ? '✓' : '—'}</p>
              <p className="text-xs text-gray-500">Proof: {proof.status === 'ready' ? '✓' : '—'}</p>
              <p className="text-xs text-gray-500">TX: {tx.status === 'success' ? '✓' : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
