# Contributing to ShieldFlow

Thank you for your interest in ShieldFlow! This document provides guidance for setting up your development environment and contributing to the project.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Building & Testing](#building--testing)
5. [Code Style](#code-style)
6. [Pull Request Process](#pull-request-process)
7. [Security Considerations](#security-considerations)

---

## Prerequisites

Before starting, ensure you have:

### System Requirements
- **OS**: macOS, Linux, or Windows (WSL2 recommended)
- **Node.js**: 18.0 or higher
- **Rust**: 1.70 or higher
- **Git**: Latest version

### Required Tools
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Soroban CLI
cargo install soroban-cli

# Install Noir
bash <(curl -s https://raw.githubusercontent.com/noir-lang/noirup/main/install)

# Verify installations
rustc --version
soroban --version
nargo --version
```

---

## Development Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Jrabara101/ShieldFlow-.git
cd ShieldFlow-
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Set Up Soroban Contracts

```bash
cd contracts

# Build WASM binaries
cargo build --target wasm32-unknown-unknown --release

# (Optional) Run tests
cargo test

cd ..
```

**Troubleshooting**:
- If you get `error: cannot find -lc`, ensure Rust is fully installed: `rustup update`
- For Windows, use WSL2 or ensure MSVC is installed

### 4. Set Up Noir Circuits

```bash
cd circuits

# Build circuits
nargo build

# (Optional) Run circuit tests
nargo test

cd ..
```

**Troubleshooting**:
- If `nargo` is not found, reinstall Noir: `noirup`
- Check Noir version: `nargo --version` (should be 0.25+)

### 5. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### 6. Configure Stellar Network

Create `.env.local` in the `frontend/` directory:

```env
# Stellar Testnet Configuration
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443

# Contract Addresses (update after deployment)
VITE_SHIELDFLOW_POOL_CONTRACT=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB5H
VITE_COMPLIANCE_VERIFIER_CONTRACT=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB5H

# Development Settings
VITE_DEBUG=false
```

---

## Project Structure

```
ShieldFlow-/
├── contracts/                    # Soroban smart contracts (Rust)
│   ├── ShieldFlowPool/
│   │   ├── src/
│   │   │   ├── lib.rs           # Main contract logic
│   │   │   ├── storage.rs       # Data structures
│   │   │   └── verification.rs  # Proof verification
│   │   └── Cargo.toml
│   ├── ComplianceVerifier/
│   │   ├── src/
│   │   └── Cargo.toml
│   ├── NullifierRegistry/
│   │   ├── src/
│   │   └── Cargo.toml
│   ├── Cargo.toml               # Workspace manifest
│   └── tests/                   # Integration tests
│
├── circuits/                     # Noir ZK circuits
│   ├── src/
│   │   ├── batch_payout.nr      # Main batch payout circuit
│   │   ├── utils.nr             # Circuit utilities
│   │   └── lib.nr
│   ├── Nargo.toml
│   └── tests/                   # Circuit tests
│
├── frontend/                     # React web dashboard
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CSVUpload.tsx
│   │   │   ├── ProofGenerator.tsx
│   │   │   └── AuditorAccess.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useWallet.ts
│   │   │   ├── useSoroban.ts
│   │   │   └── useProof.ts
│   │   ├── utils/               # Utility functions
│   │   │   ├── stellar.ts       # Stellar integration
│   │   │   ├── noir.ts          # Noir proof generation
│   │   │   └── crypto.ts        # Encryption utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Technical deep-dive
│   ├── PROTOCOL.md               # Proof system specs
│   ├── DEPLOYMENT.md             # Deployment guides
│   ├── SECURITY.md               # Security considerations
│   └── ROADMAP.md                # Development roadmap
│
├── .github/workflows/            # CI/CD pipelines
│   ├── test.yml                  # Run tests on push
│   └── build.yml                 # Build contracts + frontend
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

---

## Building & Testing

### Build All Components

```bash
npm run build
```

This runs:
- `cargo build --target wasm32-unknown-unknown --release` (contracts)
- `nargo build` (circuits)
- `npm run build` (frontend)

### Test Suite

```bash
# Test everything
npm run test

# Test contracts only
cd contracts && cargo test && cd ..

# Test circuits only
cd circuits && nargo test && cd ..

# Test frontend only
cd frontend && npm run test && cd ..
```

### Run Linters

```bash
# Lint everything
npm run lint

# Lint Rust (contracts)
cd contracts && cargo clippy && cd ..

# Lint TypeScript (frontend)
cd frontend && npm run lint && cd ..
```

### Format Code

```bash
# Format everything
npm run format

# Format Rust
cd contracts && cargo fmt && cd ..

# Format TypeScript
cd frontend && npm run format && cd ..
```

---

## Code Style

### Rust (Contracts)

- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `cargo fmt` and `cargo clippy`
- Comments for non-obvious logic only
- No trailing whitespace

Example:
```rust
pub fn verify_batch_proof(
    env: &Env,
    proof_blob: &Bytes,
    public_inputs: &BatchProofInputs,
) -> Result<(), ContractError> {
    // Validate proof signature
    host::bn254_verify(proof_blob, public_inputs.to_bytes())?;
    Ok(())
}
```

### TypeScript (Frontend)

- Use `eslint` configuration in `package.json`
- Run `npm run format` before committing
- Type all function parameters and returns
- Prefer `const` over `let`

Example:
```typescript
export const generateBatchProof = async (
    payroll: PayrollData[],
    auditKey: string,
): Promise<ProofBlob> => {
    const proof = await noir.generateProof(payroll, auditKey);
    return proof;
};
```

### Noir (Circuits)

- Use clear variable names
- Document inputs/outputs
- Test edge cases (zero amounts, max values)

Example:
```noir
fn verify_batch(
    private_amounts: [Field; N],
    private_ledger_state: Field,
    public_total: Field,
    public_recipient_commits: [Field; N],
) -> bool {
    // Verify sum matches
    let sum = sum_amounts(private_amounts);
    assert(sum == public_total);
    
    // Verify recipients pass KYC
    // ...
    true
}
```

---

## Pull Request Process

### Before You Start
1. **Check existing issues/PRs** — Avoid duplicate work
2. **Open an issue first** for major features — Get feedback early

### Making Your Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make focused commits**:
   ```bash
   git commit -m "Add XYZ feature

   Description of what changed and why.
   
   Fixes #123 (if applicable)
   "
   ```

3. **Test thoroughly**:
   ```bash
   npm run test
   npm run lint
   npm run format
   ```

4. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Open a Pull Request** with:
   - Clear title: `feat: Add batch proof generation` or `fix: Nullifier registry overflow`
   - Description of changes (what + why)
   - Test results
   - Screenshots/demo videos (if applicable)

### Review Process
- At least 1 code review required before merge
- All tests must pass
- No merge conflicts
- Documentation updated if needed

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Example**:
```
feat(contracts): Add BN254 proof verification

Implement native host function for UltraHonk proof verification
in ShieldFlowPool contract. Reduces verification cost from 1M+ to ~100k stroops.

Fixes #42
```

---

## Security Considerations

### General Guidelines
- **Never commit secrets** (private keys, API keys, passwords)
- **Use `.env.local`** for sensitive configuration
- **Validate all inputs** at contract boundaries
- **Test edge cases** (overflow, underflow, zero values)

### Cryptography
- **Do not modify** proof verification logic without deep understanding
- **Use native host functions** for ZK operations (don't re-implement)
- **Audit any changes** to ComplianceVerifier logic

### Smart Contracts
- All state changes must be carefully reviewed
- Use `checked_add`, `checked_sub` for arithmetic (CAP-0082)
- Emit events for all state transitions
- Test with various amounts (zero, max, typical)

### Frontend
- **Sanitize all user inputs** (CSV parsing, recipient addresses)
- **Validate proof blobs** before submission
- **Never log private keys** or sensitive data
- **Use HTTPS** in production

### Testing
Before submitting PRs involving:
- **Smart contracts**: Include integration tests with testnet
- **Circuits**: Include test cases for boundary conditions
- **Frontend**: Include component tests + E2E tests

---

## Development Workflow Tips

### Quick Local Testing

```bash
# Start all services in separate terminals
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Watch contracts for changes
cd contracts && cargo watch -x "build --target wasm32-unknown-unknown"

# Terminal 3: Watch circuits for changes
cd circuits && cargo watch -x "build"
```

### Debugging

**Contracts**:
```bash
cd contracts
RUST_BACKTRACE=1 cargo test -- --nocapture
```

**Circuits**:
```bash
cd circuits
RUST_LOG=debug nargo test
```

**Frontend**:
```bash
cd frontend
VITE_DEBUG=true npm run dev
```

### Useful Commands

```bash
# Clean build artifacts
npm run clean

# Check for common issues
npm run check

# Generate documentation
npm run docs

# Deploy to testnet (requires setup)
npm run deploy:testnet
```

---

## Getting Help

- **Technical questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue with reproduction steps
- **Security concerns**: Email security@shieldflow.dev (or contact maintainers privately)
- **Feature requests**: Open an Issue with `[FEATURE]` in title

---

## Recognition

Contributors will be recognized in:
- README contributors section
- GitHub contributors page
- Release notes

Thank you for helping build ShieldFlow! 🚀
