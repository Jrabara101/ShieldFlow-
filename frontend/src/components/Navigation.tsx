import React, { useState } from 'react';
import { connectWallet, disconnectWallet } from '../utils/stellar';

interface NavigationProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export default function Navigation({ isConnected, setIsConnected }: NavigationProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const handleConnect = async () => {
    setConnecting(true);
    setError('');

    try {
      const wallet = await connectWallet();
      const key = await wallet.getPublicKey();
      console.log('Connected wallet:', key);
      setPublicKey(key);
      setIsConnected(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error('Wallet connection failed:', message);
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setPublicKey('');
    setIsConnected(false);
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">🛡️ ShieldFlow</h1>
          {isConnected && publicKey && (
            <span className="text-sm text-gray-400 ml-4">
              {publicKey.slice(0, 8)}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {error && <span className="text-red-400 text-sm">{error}</span>}
          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={connecting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {connecting ? 'Connecting...' : isConnected ? '✓ Connected' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </nav>
  );
}
