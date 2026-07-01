export interface PayloadEntry {
  recipient_address: string;
  amount: string;
  did?: string;
  tax_jurisdiction?: string;
}

export interface PayloadData {
  entries: PayloadEntry[];
  totalAmount: bigint;
  recipientCount: number;
}

export interface ProofGenerationState {
  status: 'idle' | 'generating' | 'ready' | 'error';
  proof?: string;
  publicInputs?: string;
  error?: string;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  txHash?: string;
  error?: string;
}
