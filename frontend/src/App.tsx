import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navigation isConnected={isConnected} setIsConnected={setIsConnected} />
      <main className="container mx-auto px-4 py-8">
        {isConnected ? (
          <Dashboard />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">ShieldFlow</h1>
              <p className="text-xl text-gray-300 mb-8">
                Private Enterprise Mass Payouts on Stellar
              </p>
              <p className="text-gray-400">
                Connect your Freighter wallet to get started
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
