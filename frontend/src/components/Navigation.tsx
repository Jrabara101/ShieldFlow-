import React from 'react';

interface NavigationProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export default function Navigation({ isConnected, setIsConnected }: NavigationProps) {
  const handleConnect = async () => {
    try {
      // TODO: Implement Freighter wallet connection
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">🛡️ ShieldFlow</h1>
        </div>
        <button
          onClick={handleConnect}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isConnected
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isConnected ? '✓ Connected' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
