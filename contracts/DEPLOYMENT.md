# Soroban Contract Deployment Guide

## Prerequisites

1. **Rust & Soroban CLI**
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install Soroban CLI
   cargo install soroban-cli
   
   # Verify
   soroban --version
   rustc --version
   ```

2. **Stellar Testnet Setup**
   ```bash
   # Create testnet account
   soroban config identity generate default
   soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org:443
   
   # Fund account (visit https://friendbot.stellar.org/)
   soroban config identity address default
   ```

## Building Contracts

```bash
cd contracts

# Build all contracts
cargo build --target wasm32-unknown-unknown --release

# Build individual contracts
cargo build --target wasm32-unknown-unknown --release -p ShieldFlowPool
cargo build --target wasm32-unknown-unknown --release -p ComplianceVerifier
cargo build --target wasm32-unknown-unknown --release -p NullifierRegistry
```

WASM artifacts will be in `target/wasm32-unknown-unknown/release/`

## Deploying to Testnet

```bash
cd contracts

# Deploy ShieldFlowPool
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shieldflow_pool.wasm \
  --source default \
  --network testnet
# Save the contract ID from output

# Deploy ComplianceVerifier
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/compliance_verifier.wasm \
  --source default \
  --network testnet
# Save the contract ID

# Deploy NullifierRegistry
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nullifier_registry.wasm \
  --source default \
  --network testnet
# Save the contract ID
```

## Initializing Contracts

```bash
# Get your public key
ADMIN=$(soroban config identity address default)

# Initialize ShieldFlowPool
soroban contract invoke \
  --id <SHIELDFLOW_POOL_ID> \
  --source default \
  --network testnet \
  -- init \
  --admin $ADMIN \
  --usdc-contract <USDC_CONTRACT_ID> \
  --compliance-verifier <COMPLIANCE_VERIFIER_ID> \
  --nullifier-registry <NULLIFIER_REGISTRY_ID>

# Initialize ComplianceVerifier
soroban contract invoke \
  --id <COMPLIANCE_VERIFIER_ID> \
  --source default \
  --network testnet \
  -- init \
  --admin $ADMIN

# Initialize NullifierRegistry
soroban contract invoke \
  --id <NULLIFIER_REGISTRY_ID> \
  --source default \
  --network testnet \
  -- init \
  --admin $ADMIN
```

## Frontend Configuration

Update `frontend/.env.local`:

```env
VITE_SHIELDFLOW_POOL_CONTRACT=C...
VITE_COMPLIANCE_VERIFIER_CONTRACT=C...
VITE_NULLIFIER_REGISTRY_CONTRACT=C...
```

## Calling Contracts from Frontend

The frontend will use the Soroban RPC to invoke contract methods:

```typescript
import { ContractInvoke } from '@stellar/js-stellar-sdk';

const result = await invoke({
  contractId: SHIELDFLOW_POOL_ID,
  method: 'verify_batch_proof',
  args: [proof, publicInputs, recipients, amounts],
});
```

## Troubleshooting

**"Contract not found"**: Ensure contract ID is correct and contract is deployed

**"Transaction failed"**: Check contract initialization and argument types

**Build errors**: Ensure Rust edition 2021 and soroban-sdk 21.7+

## USDC Contract Address

Testnet USDC is at: `CBBD47AB2EB00E041B5B13CC817DBXXX` (placeholder - actual address needed from Stellar)
