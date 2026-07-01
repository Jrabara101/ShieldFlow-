import { PayloadData } from '../types';

export interface ProofInput {
  amounts: bigint[];
  auditKey: string;
  ledgerState: string;
  totalAmount: bigint;
  recipientCommits: string[];
  stateRoot: string;
  blockHeight: string;
}

export interface Proof {
  proof: string;
  publicInputs: PublicInputs;
}

export interface PublicInputs {
  total_amount: string;
  recipient_commits: string[];
  state_root: string;
  block_height: string;
}

function stringToField(str: string): bigint {
  if (!str) return BigInt(0);
  const hash = str
    .split('')
    .reduce((h, c) => BigInt(h * 31) + BigInt(c.charCodeAt(0)), BigInt(0));
  const bn254_order = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
  return hash % bn254_order;
}

function computeStateRoot(ledgerState: bigint, amounts: bigint[]): bigint {
  let root = ledgerState;
  for (const amount of amounts) {
    root = (root * BigInt(31) + amount) % BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
  }
  return root;
}

export async function generateProof(
  payload: PayloadData,
  auditKey: string,
  blockHeight: string = '100'
): Promise<Proof> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const ledgerState = stringToField('ledger_init');
        const stateRoot = computeStateRoot(ledgerState, payload.entries.map(e => BigInt(e.amount)));
        const blockHeightNum = BigInt(blockHeight);

        const proof: Proof = {
          proof: 'proof_' + Math.random().toString(36).slice(2, 15),
          publicInputs: {
            total_amount: payload.totalAmount.toString(),
            recipient_commits: payload.entries.map(e => stringToField(e.recipient_address).toString()),
            state_root: stateRoot.toString(),
            block_height: blockHeightNum.toString(),
          },
        };

        console.log('Generated proof:', proof);
        resolve(proof);
      } catch (err) {
        reject(err);
      }
    }, 2000);
  });
}

export function verifyProofFormat(proof: Proof): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!proof.proof) {
    errors.push('Proof missing');
  }

  if (!proof.publicInputs.total_amount) {
    errors.push('Public input: total_amount missing');
  }

  if (!proof.publicInputs.state_root) {
    errors.push('Public input: state_root missing');
  }

  if (proof.publicInputs.recipient_commits.length === 0) {
    errors.push('Public input: recipient_commits empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
