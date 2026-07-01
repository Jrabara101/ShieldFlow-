export const STELLAR_CONFIG = {
  network: 'testnet' as const,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org:443',
};

export interface FreighterWallet {
  connect(): Promise<boolean>;
  isConnected(): boolean;
  getPublicKey(): Promise<string>;
  signTransaction(tx: string): Promise<string>;
  disconnect(): void;
}

let walletInstance: FreighterWallet | null = null;

export function mockFreighterWallet(): FreighterWallet {
  return {
    connect: async () => {
      console.log('Mock Freighter connect');
      return true;
    },
    isConnected: () => true,
    getPublicKey: async () => 'GAOPKWPCYQH5PBO7AXOJNBU2X2ZYXR26ADU5PNKOO2ELHMSHZR3K4MZJ',
    signTransaction: async (tx: string) => {
      console.log('Mock transaction signing:', tx);
      return 'mock_signature_' + Math.random().toString(36).slice(2);
    },
    disconnect: () => {
      console.log('Mock Freighter disconnect');
    },
  };
}

export async function connectWallet(): Promise<FreighterWallet> {
  if (walletInstance) return walletInstance;

  walletInstance = mockFreighterWallet();
  const connected = await walletInstance.connect();

  if (!connected) {
    throw new Error('Failed to connect wallet');
  }

  return walletInstance;
}

export function getWallet(): FreighterWallet | null {
  return walletInstance;
}

export async function submitTransaction(
  tx: string,
  wallet: FreighterWallet
): Promise<string> {
  const signature = await wallet.signTransaction(tx);

  console.log('Would submit to:', STELLAR_CONFIG.sorobanRpcUrl);
  console.log('TX:', tx);
  console.log('Signature:', signature);

  return 'mock_tx_hash_' + Math.random().toString(36).slice(2);
}

export function disconnectWallet() {
  if (walletInstance) {
    walletInstance.disconnect();
    walletInstance = null;
  }
}
