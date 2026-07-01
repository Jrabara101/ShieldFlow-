# ShieldFlow Demo - 4-Day Hackathon Build

## What's Included

This demo shows the complete ShieldFlow workflow:

1. **CSV Upload** → Parse payroll batch (recipients, amounts)
2. **ZK Proof Generation** → Compute Poseidon-based proof proving amounts sum to public total
3. **Stellar Contract Execution** → Submit proof to ShieldFlowPool contract on testnet

## Prerequisites

### For Testing (5 minutes)

- Freighter wallet with Stellar testnet account
- ~100 XLM on testnet (for gas fees)
- Test CSV file (format: recipient_address, amount, did, tax_jurisdiction)

### For Deployment (30 minutes additional)

- Rust & Soroban CLI installed
- Stellar testnet identity configured

## Quick Start (No Contract Deployment)

### 1. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 - you'll see:
- **Connect Wallet** button (uses Freighter or mock wallet)
- **Upload CSV** tab with drag-drop
- **Generate Proof** tab with ZK proof computation
- **Execute** tab (mocked for now)

### 2. Test CSV Upload

Create `test_payroll.csv`:
```csv
recipient_address,amount,did,tax_jurisdiction
GBRPYHIL2CI3FN4BXLFG6GARETHTF2FJOSYJVJ34EOSVG6C23AQHZB3,100.5,did:stellar:001,US
GBVFLWXJZHJRNW7DGPO2YABYJJFZPWF5T7VQJC3YNCZZ3EZ6XUMZBCBB,200.75,did:stellar:002,US
GBBND7QTB4VSG7IDGWWFHZ7U3KBZGONK35JWCVZECZVJFZWSMGVVNBVA,150.25,did:stellar:003,EU
```

Drag the file to the upload area:
- ✅ CSV parses and validates recipients
- ✅ Batch summary shows total recipients and amount
- ✅ Preview shows first 10 recipients

### 3. Generate Proof

Click "Generate ZK Proof":
- Computes Poseidon hashes for recipient addresses
- Verifies amounts sum to public total
- Generates mock proof (simulates Noir circuit output)
- Shows proof ID and public inputs (state root, block height, etc.)

### 4. Execute on Stellar (Mocked)

Click "Submit Proof to Contract":
- Simulates contract invocation (1.5 second delay)
- Returns mock transaction hash
- Shows "✓ Proof submitted"

## For Live Contract Deployment

### Build & Deploy Contracts

```bash
# 1. Install Soroban CLI
cargo install soroban-cli

# 2. Create testnet identity
soroban config identity generate default

# 3. Get account from FriendBot
soroban config identity address default  # Copy this address
# Visit: https://friendbot.stellar.org/?addr=<YOUR_ADDRESS>

# 4. Build contracts
cd contracts
cargo build --target wasm32-unknown-unknown --release

# 5. Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shieldflow_pool.wasm \
  --source default \
  --network testnet

# Save the contract ID from output (starts with C...)
```

### Configure Frontend

Create `frontend/.env.local`:
```env
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443

# Add your deployed contract IDs:
VITE_SHIELDFLOW_POOL_CONTRACT=C...
VITE_COMPLIANCE_VERIFIER_CONTRACT=C...
VITE_NULLIFIER_REGISTRY_CONTRACT=C...
```

Then restart the frontend - it will now submit proofs to real contracts.

## Architecture

```
CSV Upload
    ↓
Parse & Validate (frontend/src/utils/csv.ts)
    ↓
ZK Proof Generation (frontend/src/utils/noir.ts)
  - Poseidon hashing for recipients
  - Amount sum verification
  - State root computation
    ↓
Proof Submission (frontend/src/utils/contracts.ts)
    ↓
Soroban Contract (contracts/ShieldFlowPool/src/lib.rs)
  - verify_batch_proof()
  - Execute transfers to recipients
  - Track nullifiers for replay prevention
```

## Testing

### Unit Tests

```bash
# Frontend
cd frontend
npm run test

# Contracts
cd contracts
cargo test

# Circuits
cd circuits
nargo test
```

### Integration Test (Manual)

1. **Upload** → Drag test CSV, verify batch summary
2. **Proof** → Click generate, check proof is created
3. **Execute** → Submit to contract, see TX hash
4. **Verify** → Check Stellar testnet explorer (once deployed)

## Demo Video Recording

Use OBS or Loom to record:
1. Open http://localhost:5173
2. Connect wallet
3. Upload CSV (show file validation)
4. Generate proof (show proof computation)
5. Execute transaction (show contract submission)
6. Show batch summary with ✓ checkmarks

**Duration**: 2-3 minutes showing the full workflow.

## What's NOT Included (Yet)

- Real Freighter wallet integration (mocked for demo)
- Real BN254 proof verification (using Noir circuit via WASM)
- Real Soroban contract deployment (framework ready, testnet deployment step-by-step)
- Audit trail encryption (placeholder structure)
- Compliance/KYC verification (stub implementation)

These are ready to implement for the full MVP but not critical for the 4-day demo.

## Troubleshooting

**Frontend won't start?**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Port 5173 already in use?**
```bash
npm run dev -- --port 5174
```

**Contracts won't compile?**
- Ensure Rust 1.70+: `rustc --version`
- Update Soroban: `cargo install soroban-cli --force`

**Contract deployment fails?**
- Check account is funded: `soroban config identity balance default --network testnet`
- Try another RPC endpoint in DEPLOYMENT.md

## Next Steps

1. Deploy contracts to testnet (10 minutes with Soroban CLI)
2. Update .env.local with contract IDs (2 minutes)
3. Restart frontend (automatic reload)
4. Test full end-to-end flow with real Stellar transactions
5. Record demo video (5 minutes)
6. Submit to Stellar Hacks! 🚀

## Resources

- [Stellar Docs](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Noir Language](https://noir-lang.org)
- [Freighter Wallet](https://www.freighter.app)
- [React Docs](https://react.dev)
