# ShieldFlow MVP Tasks

## Overview

This document breaks down the MVP work into three parallel work streams:
1. **Smart Contracts** (Soroban/Rust)
2. **ZK Circuits** (Noir)
3. **Frontend** (React/TypeScript)

**Total Duration**: 4 weeks (with parallel work)  
**Goal**: Working proof-of-concept on Stellar testnet

---

## Work Stream 1: Smart Contracts (Weeks 1-3)

### Block 1: Project Setup & Scaffolding (Week 1, Mon-Wed)
**Effort**: 3 days | **Owner**: Senior Rust engineer

#### Task 1.1: Soroban Workspace Setup
- [ ] Create Cargo workspace with 3 contracts
- [ ] Set up contract dependencies:
  - `soroban-sdk` (latest)
  - `rs-soroban-ultrahonk` (for BN254 verification)
  - `soroban-auth` (for authorization)
- [ ] Configure build for `wasm32-unknown-unknown` target
- [ ] Set up CI/CD (GitHub Actions for tests + build)
- **Acceptance**: `cargo build --target wasm32-unknown-unknown` succeeds for all 3 contracts

#### Task 1.2: Contract Data Structures
- [ ] Define StorageKey enums for state management
- [ ] Create shared types:
  - `PublicInputs` (total, commits, root, block height)
  - `ProofBlob` (wrapped UltraHonk proof)
  - `PaymentRecord` (recipient, amount, timestamp)
  - `ComplianceResult` (pass/fail + reason)
  - `NullifierEntry` (hash + timestamp)
- [ ] Write Cargo docs for types
- **Acceptance**: All types compile and have clear documentation

#### Task 1.3: Admin & Authorization Module
- [ ] Create `admin.rs` utility for role-based access control
- [ ] Functions:
  - `require_admin()` → verify sender is admin
  - `require_compliance_verifier()` → verify sender is verifier contract
  - `set_admin()` → admin function to transfer ownership
- [ ] Write tests for authorization checks
- **Acceptance**: Authorization tests pass; admin can change itself

---

### Block 2: ShieldFlowPool Contract (Week 1-2, Thu-Fri, Mon-Thu)
**Effort**: 5 days | **Owner**: Senior Rust engineer

#### Task 2.1: ShieldFlowPool Storage & Init
- [ ] Create `storage.rs`:
  ```rust
  pub struct ShieldFlowPoolState {
      admin: Address,
      usdc_contract: Address,
      compliance_verifier: Address,
      nullifier_registry: Address,
      total_processed: i128,
      last_batch_hash: Bytes,
  }
  ```
- [ ] Create `init()` function:
  - Accept admin, usdc_contract, compliance_verifier, nullifier_registry addresses
  - Validate addresses (not zero)
  - Store initial state
- [ ] Write unit tests for initialization
- **Acceptance**: `init()` succeeds; storage readable via getter functions

#### Task 2.2: Batch Proof Verification
- [ ] Create `verification.rs`:
  ```rust
  pub fn verify_batch_proof(
      proof_blob: &Bytes,
      public_inputs: &PublicInputs,
  ) -> Result<(), ContractError>
  ```
- [ ] Call native host function:
  ```rust
  use soroban_sdk::host::bn254_verify;
  let serialized = public_inputs.to_bytes();
  bn254_verify(proof_blob, &serialized)?;
  ```
- [ ] Handle errors gracefully
- [ ] Write unit tests:
  - Valid proof should pass
  - Invalid proof should fail
  - Tampered public inputs should fail
- **Acceptance**: Proof verification tests pass (using test vectors from Noir)

#### Task 2.3: Batch Execution Function
- [ ] Create `execute.rs`:
  ```rust
  pub fn execute_batch_payout(
      env: &Env,
      proof_blob: Bytes,
      public_inputs: PublicInputs,
      recipients: Vec<Address>,
      amounts: Vec<i128>,
  ) -> Result<Vec<u64>, ContractError>
  ```
- [ ] Logic:
  1. Verify proof via `verify_batch_proof()`
  2. Verify recipient count == amount count
  3. For each (recipient, amount):
     - Call `ComplianceVerifier.verify_kyckyc(recipient)`
     - Call USDC contract `transfer(recipient, amount)`
     - Insert nullifier in `NullifierRegistry`
     - Emit private event
  4. Update `total_processed`
  5. Return array of transaction IDs
- [ ] Error handling:
  - Proof verification failed
  - Compliance check failed
  - Transfer failed
  - Nullifier already spent
- [ ] Write integration tests (with mock contracts)
- **Acceptance**: Execution tests pass with valid proof; reject invalid proofs

#### Task 2.4: Event Emission
- [ ] Define events:
  ```rust
  pub struct BatchProcessedEvent {
      batch_hash: Bytes,
      recipient_count: u32,
      total_amount: i128,
      timestamp: u64,
  }
  ```
- [ ] Emit events in `execute_batch_payout()`
- [ ] Write tests for event emission
- **Acceptance**: Events emitted correctly for valid batches

---

### Block 3: ComplianceVerifier Contract (Week 2, Fri-Mon)
**Effort**: 3 days | **Owner**: Rust engineer

#### Task 3.1: ComplianceVerifier Storage & Init
- [ ] Create `compliance_storage.rs`:
  ```rust
  pub struct ComplianceState {
      admin: Address,
      trusted_issuers: Vec<Address>,
      sanction_list_hash: Field,  // Merkle root of OFAC/UN list
      tax_rules: Map<String, TaxRule>,
  }
  ```
- [ ] Create `init()` function with trusted issuers
- [ ] Write initialization tests
- **Acceptance**: Storage initialized; getters work

#### Task 3.2: KYC Verification Function
- [ ] Create `verify_kyckyc()`:
  ```rust
  pub fn verify_kyckyc(
      recipient_did: &Bytes,
      recipient_commit: &Field,
  ) -> Result<ComplianceResult, ContractError>
  ```
- [ ] Logic:
  1. Lookup recipient credential from cache/chain
  2. Verify credential signature (trusted issuer)
  3. Check against sanction list
  4. Validate tax jurisdiction
  5. Return ComplianceResult::Pass or Fail
- [ ] For MVP: Hardcode dummy credentials (no real API integration)
- [ ] Write tests for pass/fail scenarios
- **Acceptance**: KYC checks return expected results; mock data works

#### Task 3.3: Sanction List Management
- [ ] Create `sanctions.rs`:
  - Function to update sanction list hash (admin only)
  - Function to verify if recipient on list
  - Use Poseidon hash for Merkle tree compatibility
- [ ] For MVP: Maintain small hardcoded blocklist
- [ ] Write tests
- **Acceptance**: Blocklist queries work; can add/remove entries

---

### Block 4: NullifierRegistry Contract (Week 2-3, Tue-Wed)
**Effort**: 2 days | **Owner**: Rust engineer

#### Task 4.1: Nullifier Storage
- [ ] Create `nullifier_storage.rs`:
  ```rust
  pub struct NullifierState {
      spent_nullifiers: BTreeMap<Field, u64>,  // nullifier -> block_height
      merkle_root: Field,
      pruned_at: u64,
  }
  ```
- [ ] Initialize with empty state
- **Acceptance**: Storage structure compiles and initializes

#### Task 4.2: Nullifier Insertion & Replay Prevention
- [ ] Create `insert_nullifier()`:
  ```rust
  pub fn insert_nullifier(env: &Env, nullifier: Field) -> Result<(), ContractError>
  ```
- [ ] Logic:
  1. Check if nullifier already spent
  2. If yes: return ContractError::NullifierSpent
  3. If no: insert with current block height
  4. Update Merkle root (use Poseidon hash)
- [ ] Write tests:
  - First insertion succeeds
  - Duplicate insertion fails
  - Merkle root updates correctly
- **Acceptance**: Replay prevention works; tests pass

#### Task 4.3: Registry Cleanup
- [ ] Create `prune()` function (admin only):
  - Remove nullifiers older than N blocks
  - Recompute Merkle root
- [ ] For MVP: Simple pruning (not complex)
- **Acceptance**: Pruning function works; old entries removed

---

### Block 5: Contract Integration & Testing (Week 3, Thu-Fri)
**Effort**: 3 days | **Owner**: Senior Rust engineer

#### Task 5.1: End-to-End Contract Tests
- [ ] Create `contracts/tests/integration_test.rs`:
  - Setup all 3 contracts
  - Initialize with mock addresses
  - Mock USDC contract behavior
  - Test full payout flow with valid proof
  - Test rejection with invalid proof
- [ ] Tests must pass with mock data
- **Acceptance**: Full integration test passes

#### Task 5.2: Contract Documentation
- [ ] Add rustdoc comments to all public functions
- [ ] Generate HTML docs: `cargo doc --open`
- [ ] Write function-level examples
- **Acceptance**: Docs generate without warnings; examples compile

#### Task 5.3: Contract Deployment Script (Testnet)
- [ ] Create `scripts/deploy.sh`:
  - Build all WASM binaries
  - Deploy to Stellar testnet
  - Output contract IDs to `.env.local`
- [ ] Script must be idempotent (can re-run safely)
- **Acceptance**: Script deploys successfully; outputs valid contract IDs

---

## Work Stream 2: ZK Circuits (Weeks 1-3)

### Block 1: Noir Project Setup (Week 1, Mon-Tue)
**Effort**: 1 day | **Owner**: ZK engineer

#### Task 1.1: Noir Project Initialization
- [ ] Create `circuits/Nargo.toml`:
  ```toml
  [package]
  name = "shieldflow"
  type = "bin"
  
  [dependencies]
  ```
- [ ] Add dependencies:
  - `std` (Noir stdlib)
  - `noir_js` (for WASM compilation)
- [ ] Configure build settings for WASM target
- **Acceptance**: `nargo build` succeeds; WASM binary generated

#### Task 1.2: Utility Functions Library
- [ ] Create `circuits/src/utils.nr`:
  - `sum_array()` → sum all field elements
  - `is_valid_commit()` → verify commit format
  - `poseidon_hash()` → Poseidon hash wrapper
  - `merkle_root()` → compute tree root
- [ ] Write tests for each utility
- **Acceptance**: All utilities compile and tests pass

---

### Block 2: Batch Payout Circuit (Week 2-3, Wed-Fri)
**Effort**: 4 days | **Owner**: ZK engineer

#### Task 2.1: Circuit Skeleton
- [ ] Create `circuits/src/batch_payout.nr`:
  ```noir
  fn main(
      private amounts: [Field; MAX_RECIPIENTS],
      private audit_key: Field,
      private ledger_state: Field,
      
      public total_amount: Field,
      public recipient_commits: [Field; MAX_RECIPIENTS],
      public state_root: Field,
      public block_height: u64,
  )
  ```
- [ ] Stub out placeholder logic
- [ ] Compile without errors
- **Acceptance**: Circuit compiles; proof generation works (trivially)

#### Task 2.2: Sum Verification Logic
- [ ] Implement amount summation:
  ```noir
  let sum = sum_array(amounts);
  assert(sum == total_amount);
  ```
- [ ] Test with known values (e.g., [10, 20, 30] → 60)
- [ ] Write Noir test:
  ```noir
  #[test]
  fn test_sum_verification() {
      let amounts = [10, 20, 30];
      let sum = sum_array(amounts);
      assert(sum == 60);
  }
  ```
- **Acceptance**: Sum verification tests pass

#### Task 2.3: Recipient Validation
- [ ] Implement commit validation loop:
  ```noir
  for i in 0..MAX_RECIPIENTS {
      assert(is_valid_commit(recipient_commits[i]));
  }
  ```
- [ ] For MVP: `is_valid_commit()` checks non-zero
- [ ] Write tests with valid and invalid commits
- **Acceptance**: Invalid commits are rejected

#### Task 2.4: State Root Verification
- [ ] Implement state root computation:
  ```noir
  let computed_root = compute_merkle_root(ledger_state, amounts);
  assert(computed_root == state_root);
  ```
- [ ] Use Poseidon hash for Merkle tree
- [ ] Test with known ledger states
- **Acceptance**: State root verification works; tests pass

#### Task 2.5: Audit Commitment
- [ ] Add audit commitment computation:
  ```noir
  let audit_commitment = poseidon_hash([audit_key, ledger_state]);
  ```
- [ ] Store in public inputs (or return in output)
- [ ] Write tests
- **Acceptance**: Audit commitment computed correctly

---

### Block 3: Noir → WASM Compilation (Week 3, Mon-Tue)
**Effort**: 2 days | **Owner**: ZK/WASM engineer

#### Task 3.1: WASM Build Configuration
- [ ] Configure Nargo to compile to WASM:
  ```toml
  [profile.wasm]
  target = "wasm32"
  ```
- [ ] Build: `nargo build --profile wasm`
- [ ] Output should be `batch_payout.wasm` (~5-10MB)
- **Acceptance**: WASM binary generated successfully

#### Task 3.2: NoirJs Wrapper
- [ ] Create `frontend/src/utils/noir.ts`:
  ```typescript
  import { initNoirWasm, NoirWasm } from "@noir/js";
  
  export const generateBatchProof = async (
      payroll: PayrollData[],
      auditKey: string,
  ): Promise<ProofBlob> => {
      const noir = await initNoirWasm();
      const proof = await noir.generateProof({
          amounts: payroll.map(p => p.amount),
          audit_key: auditKey,
          ledger_state: "...",
          total_amount: sum(payroll.map(p => p.amount)),
          recipient_commits: payroll.map(p => hash(p.recipientDID)),
          state_root: computeStateRoot(...),
          block_height: getCurrentBlockHeight(),
      });
      return proof;
  };
  ```
- [ ] Write tests with mock payroll data
- **Acceptance**: Proof generation works in browser; returns valid proof blob

#### Task 3.3: Test Vector Integration
- [ ] Create `circuits/tests/batch_payout_vectors.nr`:
  - Test vector 1: 10 recipients, known amounts, expected proof
  - Test vector 2: 100 recipients, larger amounts
  - Test vector 3: Edge case (single recipient)
- [ ] Run tests: `nargo test`
- **Acceptance**: All test vectors pass

---

## Work Stream 3: Frontend (Weeks 1-4)

### Block 1: Project Setup & Bootstrap (Week 1, Mon-Wed)
**Effort**: 3 days | **Owner**: Senior React engineer

#### Task 1.1: React + Vite Setup
- [ ] Create React project with Vite:
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend && npm install
  ```
- [ ] Install core dependencies:
  - `react` 18+
  - `typescript`
  - `tailwindcss`
  - `vite`
  - `@vitejs/plugin-react`
- [ ] Configure `vite.config.ts`:
  - Set alias for `@/` imports
  - Configure WASM support
- **Acceptance**: `npm run dev` starts dev server at localhost:5173

#### Task 1.2: Tailwind CSS Setup
- [ ] Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Initialize config: `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.ts`:
  - Colors, fonts, spacing for enterprise UI
  - Dark mode support
- [ ] Create `src/index.css` with Tailwind directives
- **Acceptance**: Tailwind classes work in components

#### Task 1.3: Folder Structure & Base Components
- [ ] Create folder structure:
  ```
  src/
  ├── components/
  │   ├── Dashboard.tsx
  │   ├── CSVUpload.tsx
  │   ├── ProofGenerator.tsx
  │   ├── TransactionSender.tsx
  │   ├── AuditorAccess.tsx
  │   └── Navigation.tsx
  ├── hooks/
  │   ├── useWallet.ts
  │   ├── useSoroban.ts
  │   └── useProof.ts
  ├── utils/
  │   ├── stellar.ts
  │   ├── noir.ts
  │   └── crypto.ts
  ├── types/
  │   └── index.ts
  ├── App.tsx
  ├── main.tsx
  └── index.css
  ```
- [ ] Create empty placeholder components
- **Acceptance**: Folder structure created; TypeScript compiles

#### Task 1.4: TypeScript Type Definitions
- [ ] Create `src/types/index.ts`:
  ```typescript
  export interface PayrollData {
      recipientAddress: string;
      recipientDID: string;
      amount: BigInt;
      currencyCode: string;
      taxJurisdiction: string;
      complianceFlags: string[];
  }

  export interface ProofBlob {
      proof: Uint8Array;
      publicInputs: PublicInputs;
      metadata: ProofMetadata;
  }
  
  export interface PublicInputs {
      totalAmount: BigInt;
      recipientCommits: string[];
      stateRoot: string;
      blockHeight: number;
  }
  ```
- [ ] Export all types from single file
- **Acceptance**: Types compile; no unused imports warnings

---

### Block 2: Wallet Integration & Stellar Setup (Week 1-2, Thu-Fri, Mon-Wed)
**Effort**: 4 days | **Owner**: React engineer

#### Task 2.1: Freighter Wallet Hook
- [ ] Create `src/hooks/useWallet.ts`:
  ```typescript
  export const useWallet = () => {
      const [connected, setConnected] = useState(false);
      const [publicKey, setPublicKey] = useState<string | null>(null);
      const [isReady, setIsReady] = useState(false);

      useEffect(() => {
          // Check if Freighter is available
          if (window.freighter) {
              setIsReady(true);
          }
      }, []);

      const connect = async () => {
          const pk = await window.freighter.publicKey();
          setPublicKey(pk);
          setConnected(true);
      };

      return { connected, publicKey, connect, isReady };
  };
  ```
- [ ] Write tests
- **Acceptance**: Wallet hook connects to Freighter; returns public key

#### Task 2.2: Soroban RPC Hook
- [ ] Create `src/hooks/useSoroban.ts`:
  ```typescript
  export const useSoroban = () => {
      const rpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL;
      const client = new SorobanRpc.Server(rpcUrl);

      const invoke = async (contractId: string, method: string, params: any[]) => {
          // Build and submit transaction
      };

      return { invoke, client };
  };
  ```
- [ ] Integrate Stellar SDK
- [ ] Write stub functions
- **Acceptance**: Soroban RPC connection works; methods callable

#### Task 2.3: Stellar Environment Configuration
- [ ] Create `.env.local`:
  ```env
  VITE_STELLAR_NETWORK=testnet
  VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
  VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
  VITE_DEBUG=false
  ```
- [ ] Create `src/utils/stellar.ts`:
  - Network constants
  - Helper functions for TX building
- **Acceptance**: Environment variables loaded; constants available

#### Task 2.4: Transaction Builder Utilities
- [ ] Create `src/utils/stellar.ts`:
  ```typescript
  export const buildBatchProofTx = async (
      sourceAccount: string,
      proof: ProofBlob,
      recipients: string[],
      amounts: bigint[],
  ) => {
      // Build Soroban InvokeHostFunction transaction
  };
  ```
- [ ] Write tests (mock Soroban calls)
- **Acceptance**: TX builder creates valid transaction objects

---

### Block 3: CSV Upload & Batch Preview (Week 2, Thu-Fri)
**Effort**: 2 days | **Owner**: React engineer

#### Task 3.1: CSV Upload Component
- [ ] Create `src/components/CSVUpload.tsx`:
  ```tsx
  const CSVUpload = ({ onPayrollParsed }) => {
      const [file, setFile] = useState<File | null>(null);
      const [parsing, setParsing] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleFileUpload = async (file: File) => {
          setParsing(true);
          try {
              const data = await parsePayrollCSV(file);
              onPayrollParsed(data);
          } catch (e) {
              setError(e.message);
          } finally {
              setParsing(false);
          }
      };

      return (
          <div>
              <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
              {parsing && <p>Parsing...</p>}
              {error && <p className="text-red-500">{error}</p>}
          </div>
      );
  };
  ```
- [ ] Create parser utility in `src/utils/csv.ts`
- [ ] Tests for CSV parsing (valid, malformed, edge cases)
- **Acceptance**: CSV upload works; data parsed correctly

#### Task 3.2: Batch Preview Component
- [ ] Create `src/components/BatchPreview.tsx`:
  - Display parsed payroll data in table
  - Show: recipient address, amount, jurisdiction, compliance flags
  - Total rows, total amount at bottom
  - "Edit" functionality for specific rows
- [ ] Style with Tailwind (clean, scannable)
- **Acceptance**: Preview displays all fields; looks professional

#### Task 3.3: Input Validation
- [ ] Validate in CSV parser:
  - Recipient addresses are valid Stellar addresses
  - Amounts are positive integers
  - DIDs are properly formatted
  - Jurisdictions are recognized codes
- [ ] Show validation errors clearly
- [ ] Write validation tests
- **Acceptance**: Invalid CSV rejected with clear error message

---

### Block 4: Proof Generation UI (Week 3, Mon-Thu)
**Effort**: 4 days | **Owner**: React engineer

#### Task 4.1: Proof Generation Hook
- [ ] Create `src/hooks/useProof.ts`:
  ```typescript
  export const useProof = () => {
      const [generating, setGenerating] = useState(false);
      const [progress, setProgress] = useState(0);
      const [proof, setProof] = useState<ProofBlob | null>(null);
      const [error, setError] = useState<string | null>(null);

      const generate = async (payroll: PayrollData[], auditKey: string) => {
          setGenerating(true);
          setProgress(0);
          try {
              // Call noir.generateBatchProof()
              const proof = await generateBatchProof(payroll, auditKey);
              setProof(proof);
          } catch (e) {
              setError(e.message);
          } finally {
              setGenerating(false);
          }
      };

      return { generating, progress, proof, error, generate };
  };
  ```
- **Acceptance**: Hook manages proof generation state

#### Task 4.2: Proof Generator Component
- [ ] Create `src/components/ProofGenerator.tsx`:
  - Input: audit key (password-like)
  - Button: "Generate Proof"
  - Progress bar: shows generation progress (0-100%)
  - Output: proof metadata display
    - Proof size (KB)
    - Public inputs summary
    - Generation time
  - Error display if generation fails
- [ ] Use Tailwind for styling
- **Acceptance**: Component displays proof generation workflow; looks good

#### Task 4.3: Proof Verification (Local, Dev Only)
- [ ] For MVP: Include optional local proof verification
  - Call `proof.verify()` before submission (Noir-js feature)
  - Display "Proof Valid ✓" if passes
  - This is developer convenience, not required for production
- [ ] Write tests
- **Acceptance**: Local verification works; helps with debugging

---

### Block 5: Transaction Submission & Audit Access (Week 3-4, Fri-Mon)
**Effort**: 3 days | **Owner**: React engineer

#### Task 5.1: Transaction Sender Component
- [ ] Create `src/components/TransactionSender.tsx`:
  - Display proof + public inputs
  - Button: "Execute on Stellar"
  - On click: build TX, sign with Freighter, submit
  - Show status:
    - "Signing..." (waiting for wallet)
    - "Submitting..." (sending to network)
    - "Confirming..." (waiting for ~5s settlement)
    - "Confirmed! TX: <hash>" (success)
  - Error display if fails
- [ ] Use Freighter for signing
- [ ] Use Soroban RPC for submission
- **Acceptance**: Transaction submission works end-to-end on testnet

#### Task 5.2: Auditor Access Component
- [ ] Create `src/components/AuditorAccess.tsx`:
  - Enterprise manager can share audit key
  - Input: copy audit key to clipboard
  - Auditor can paste key to decrypt
  - Display decrypted audit entries:
    - Recipient address
    - Amount
    - Timestamp
    - Compliance checks
  - Export as CSV/JSON
- [ ] Implement encryption/decryption utilities in `src/utils/crypto.ts`
- **Acceptance**: Auditor can decrypt and view transactions

#### Task 5.3: Dashboard Layout
- [ ] Create main `src/components/Dashboard.tsx`:
  ```tsx
  const Dashboard = () => {
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <CSVUpload />
              <BatchPreview />
              <ProofGenerator />
              <TransactionSender />
              <AuditorAccess />
          </div>
      );
  };
  ```
- [ ] Wire all components together
- [ ] Manage global state (Redux or Context)
- **Acceptance**: Full dashboard workflow works

---

### Block 6: Frontend Testing & Deployment (Week 4, Tue-Fri)
**Effort**: 3 days | **Owner**: React engineer

#### Task 6.1: Component Tests
- [ ] Create `src/components/__tests__/`:
  - CSVUpload.test.tsx
  - BatchPreview.test.tsx
  - ProofGenerator.test.tsx
  - TransactionSender.test.tsx
- [ ] Use Vitest + React Testing Library
- [ ] Test happy path + error cases
- **Acceptance**: All component tests pass

#### Task 6.2: Integration Tests
- [ ] Create `src/__tests__/integration.test.ts`:
  - Full flow: CSV → Proof → TX → Confirmation
  - Mock Freighter, Soroban RPC, Noir
- [ ] Use mocked data
- **Acceptance**: Integration tests pass

#### Task 6.3: Build & Deployment
- [ ] Create build script: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Create GitHub Actions workflow: `.github/workflows/deploy.yml`
  - On push to main: build + run tests
- **Acceptance**: Build succeeds; no TypeScript errors

#### Task 6.4: Documentation
- [ ] Add inline comments to complex functions
- [ ] Create `FRONTEND_SETUP.md` in docs/
- [ ] Document component props and usage
- **Acceptance**: Frontend code is self-documenting

---

## Cross-Workstream Coordination

### Synchronization Points

**Week 1, Friday (End of Week 1)**:
- [ ] Contracts: Soroban workspace + ShieldFlowPool skeleton ready
- [ ] Circuits: Noir setup + basic utilities
- [ ] Frontend: React project setup + Freighter integration

**Week 2, Wednesday (Mid-Week 2)**:
- [ ] Contracts: ComplianceVerifier + NullifierRegistry mostly done
- [ ] Circuits: Batch payout circuit taking shape
- [ ] Frontend: CSV upload + preview working

**Week 3, Friday (End of Week 3)**:
- [ ] Contracts: Full contracts + integration tests passing
- [ ] Circuits: Noir → WASM compilation working
- [ ] Frontend: Proof generation + TX submission working
- **Blockers resolved**: All three systems can talk to each other

**Week 4, Friday (Final)**:
- [ ] End-to-end testnet demo ready
- [ ] Demo video recorded
- [ ] All documentation complete
- [ ] Code pushed to GitHub

---

## Dependency Graph

```
Frontend/CSV Upload
    ↓
    ├→ Requires: PayrollData types
    └→ Produces: PayrollData[]

PayrollData[]
    ↓
    ├→ Feeds: ProofGenerator
    └→ Feeds: BatchPreview

ProofGenerator
    ├→ Requires: Noir circuit (WASM)
    ├→ Requires: audit_key input
    └→ Produces: ProofBlob

ProofBlob
    ↓
    ├→ Feeds: TransactionSender
    └→ Feeds: Contract verification

TransactionSender
    ├→ Requires: Freighter wallet
    ├→ Requires: ShieldFlowPool contract deployed
    └→ Produces: Transaction hash

Transaction
    ↓
    ├→ Feeds: ShieldFlowPool.verify_batch_proof()
    ├→ Calls: ComplianceVerifier.verify_kyckyc()
    ├→ Calls: NullifierRegistry.insert_nullifier()
    └→ Produces: Audit trail

Audit Trail
    ↓
    ├→ Feeds: AuditorAccess component
    └→ Requires: Decryption key
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Noir circuit too slow | Start with small MAX_RECIPIENTS (10-50); optimize later |
| BN254 host function unavailable | Use testnet first; fallback to mock verifier if needed |
| Proof serialization mismatch | Use test vectors; ensure Noir output matches contract input format |
| WASM file too large | Compression; consider circuit splitting if >20MB |
| Freighter timeout | Implement TX retry logic with exponential backoff |
| Contract deployment fails | Keep deploy script flexible; can re-deploy without data loss |

---

## Success Criteria

### Week 1
- [ ] All environments set up (Rust, Noir, Node)
- [ ] GitHub repo with full scaffolding
- [ ] No blocker issues

### Week 2
- [ ] Contracts compiling and passing unit tests
- [ ] Circuits generating test proofs
- [ ] Frontend CSV upload working

### Week 3
- [ ] Full end-to-end testnet demo
- [ ] Proof generation <30s (500 recipients)
- [ ] TX settlement ~5s

### Week 4
- [ ] Production-ready code (linted, documented, tested)
- [ ] Demo video recorded
- [ ] Ready for hackathon submission

---

## Effort Summary

| Workstream | Weeks | FTE | Total Effort |
|-----------|-------|-----|--------------|
| Contracts | 3 | 1.5 | 4.5 FTE-weeks |
| Circuits | 3 | 1 | 3 FTE-weeks |
| Frontend | 4 | 1.5 | 6 FTE-weeks |
| **Total** | **4** | **4** | **13.5 FTE-weeks** |

**For a 2-person team**: 6-7 weeks (with some parallelization loss)  
**For a 4-person team**: 3-4 weeks (optimal)  
**For a single person**: 13-14 weeks (doing sequentially)

---

## Appendix: External Resources

### Stellar & Soroban
- [Soroban Examples](https://github.com/stellar/soroban-examples)
- [rs-soroban-ultrahonk](https://github.com/yugocabrio/rs-soroban-ultrahonk)

### Noir
- [Noir Language Docs](https://noir-lang.org)
- [Noir Tutorials](https://docs.noir-lang.org/getting_started/installation)

### React & Vite
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

### Testing
- [Vitest Docs](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
