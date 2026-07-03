export interface ContractAddresses {
  pool: string;
  compliance: string;
  nullifier: string;
}

export function getContractAddresses(): ContractAddresses {
  return {
    pool: import.meta.env.VITE_SHIELDFLOW_POOL_CONTRACT || '',
    compliance: import.meta.env.VITE_COMPLIANCE_VERIFIER_CONTRACT || '',
    nullifier: import.meta.env.VITE_NULLIFIER_REGISTRY_CONTRACT || '',
  };
}

export interface ProofSubmission {
  proof: string;
  publicInputs: PublicInputsData;
  recipients: string[];
  amounts: bigint[];
}

export interface PublicInputsData {
  total_amount: string;
  recipient_commits: string[];
  state_root: string;
  block_height: string;
}

export async function submitProofToContract(
  submission: ProofSubmission,
  rpcUrl: string
): Promise<string> {
  console.log('Would submit to contract:', submission);
  console.log('RPC URL:', rpcUrl);

  return new Promise((resolve) => {
    setTimeout(() => {
      const txHash = 'tx_' + Math.random().toString(36).slice(2, 15);
      console.log('Mock contract submission succeeded:', txHash);
      resolve(txHash);
    }, 1500);
  });
}

export function validateContractAddresses(addresses: ContractAddresses): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!addresses.pool) {
    errors.push('ShieldFlowPool contract ID not configured');
  } else if (!addresses.pool.startsWith('C')) {
    errors.push('Invalid ShieldFlowPool contract ID format');
  }

  if (!addresses.compliance) {
    errors.push('ComplianceVerifier contract ID not configured');
  } else if (!addresses.compliance.startsWith('C')) {
    errors.push('Invalid ComplianceVerifier contract ID format');
  }

  if (!addresses.nullifier) {
    errors.push('NullifierRegistry contract ID not configured');
  } else if (!addresses.nullifier.startsWith('C')) {
    errors.push('Invalid NullifierRegistry contract ID format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
