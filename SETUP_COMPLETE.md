# ShieldFlow Development Environment Setup ✅

## What's Been Done

### ✅ Repository Structure
```
ShieldFlow-/
├── contracts/                    # Soroban smart contracts
│   ├── Cargo.toml               # Workspace manifest
│   ├── ShieldFlowPool/          # Main pool contract
│   ├── ComplianceVerifier/      # KYC contract
│   └── NullifierRegistry/       # Double-spend prevention
├── circuits/                     # Noir ZK circuits
│   ├── Nargo.toml               # Circuit manifest
│   └── src/main.nr              # Batch payout circuit
├── frontend/                     # React dashboard
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   └── types/               # TypeScript types
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── index.html
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Technical deep-dive
│   ├── MVP_TASKS.md              # Detailed task breakdown
│   ├── DEPLOYMENT.md             # (placeholder)
│   └── SECURITY.md               # (placeholder)
├── README.md                     # Project overview
├── CONTRIBUTING.md               # Developer guide
├── package.json                  # Monorepo scripts
├── LICENSE                       # MIT License
└── .gitignore
```

### ✅ Documentation
- **README.md** — Project overview, tech stack, quick start
- **CONTRIBUTING.md** — Setup instructions, code style, PR process
- **docs/ARCHITECTURE.md** — Technical deep-dive into all components
- **docs/MVP_TASKS.md** — Detailed task breakdown (13.5 FTE-weeks)
- **MEMORY.md** — Local memory index for easy reference

### ✅ Boilerplate Code
- Soroban contract skeleton (3 contracts with stubs)
- Noir circuit scaffold with utility functions
- React frontend with Tailwind CSS, Freighter integration
- TypeScript type definitions
- Configuration files (Vite, Tailwind, Cargo)

### ✅ Development Scripts
Root `package.json` includes:
- `npm run build` — Build all components
- `npm run dev` — Run dev servers (watch mode for all)
- `npm run test` — Run full test suite
- `npm run lint` — Lint contracts + frontend
- `npm run format` — Format all code

---

## Next Steps (How to Proceed)

### 1. Initialize Git & Commit
```bash
cd C:\Users\Admin\ShieldFlow

# If not already done:
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Stage all files
git add .

# Create initial commit
git commit -m "feat: Initialize ShieldFlow project structure with boilerplate

- Set up Soroban contract workspace (3 contracts)
- Set up Noir circuit project
- Set up React frontend with Tailwind CSS
- Add comprehensive documentation (ARCHITECTURE, MVP_TASKS)
- Add development scripts and configuration

This is the foundation for MVP development across 3 parallel workstreams."

# Push to GitHub
git push -u origin main
```

### 2. Set Up Local Development Environment

#### **Option A: All-in-One Setup** (Recommended for quick testing)
```bash
# From project root
npm install

# This installs dependencies for the monorepo
# Next, install system tools:
```

#### **Option B: Development Environment per Workstream**

**For Contracts (Rust/Soroban):**
```bash
cd contracts

# Build all contracts
cargo build --target wasm32-unknown-unknown

# Run tests
cargo test

# Watch for changes
cargo watch -x "build --target wasm32-unknown-unknown"
```

**For Circuits (Noir):**
```bash
cd circuits

# Build circuits
nargo build

# Run tests
nargo test

# Watch for changes
nargo build --watch
```

**For Frontend (React/TypeScript):**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Dev server runs at http://localhost:5173
```

### 3. Start Development

#### **Recommended Start Path:**
1. **Week 1**: Contract setup + Freighter integration (highest risk)
2. **Week 2**: CSV upload + proof generation
3. **Week 3**: Contract execution + integration tests
4. **Week 4**: Polish + testing + demo video

See **docs/MVP_TASKS.md** for detailed task breakdown.

#### **Quick Demo to Verify Setup:**
```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev
# Opens http://localhost:5173

# Terminal 2: Contracts
cd contracts
cargo build --target wasm32-unknown-unknown

# Terminal 3: Circuits
cd circuits
nargo build

# Then test dashboard loads in browser
```

---

## Environment Configuration

### Create `.env.local` in `frontend/` for Stellar:
```env
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
VITE_DEBUG=true

# Update after deploying contracts to testnet:
VITE_SHIELDFLOW_POOL_CONTRACT=C...
VITE_COMPLIANCE_VERIFIER_CONTRACT=C...
VITE_NULLIFIER_REGISTRY_CONTRACT=C...
```

---

## Architecture Overview

### **Frontend (React)**
- CSV upload & parsing
- Batch preview
- Noir proof generation (browser WASM)
- Freighter wallet integration
- Transaction submission
- Auditor access portal

### **Contracts (Soroban/Rust)**
- **ShieldFlowPool**: Main contract, proof verification, transfers
- **ComplianceVerifier**: KYC checks, sanction screening
- **NullifierRegistry**: Replay prevention, Merkle tree

### **Circuits (Noir)**
- **batch_payout.nr**: ZK proof circuit
  - Verifies sum of amounts
  - Validates KYC commitments
  - Confirms state root
  - Generates UltraHonk proof

### **Data Flow**
```
CSV → Parser → Proof Gen (WASM) → Sign (Freighter) → 
Stellar TX → Contract Verify (BN254 host fn) → 
Transfer → Nullifier → Audit Trail
```

---

## Key Technologies

| Component | Tech | Notes |
|-----------|------|-------|
| **Frontend** | React 18, TypeScript, Vite | Modern dev experience |
| **Contracts** | Soroban SDK (Rust), WASM | Protocol 25/26 support |
| **Circuits** | Noir 0.25+, UltraHonk | ZK proof generation |
| **Styling** | Tailwind CSS | Enterprise UI |
| **Build** | Cargo, Nargo, Vite | Monorepo with npm scripts |
| **Wallet** | Freighter SDK | Stellar signing |
| **Testing** | Cargo test, Nargo test, Vitest | Full coverage |

---

## Development Tips

### Run Everything in Dev Mode (Parallel)
```bash
npm run dev

# Automatically starts:
# - React dev server (localhost:5173)
# - Cargo watch (contracts)
# - Nargo watch (circuits)
```

### Debug Specific Component
```bash
# Contracts only
cd contracts && cargo test -- --nocapture

# Circuits only
cd circuits && nargo test

# Frontend only
cd frontend && npm run dev -- --open
```

### Code Quality
```bash
npm run lint   # Check for issues
npm run format # Auto-format all code
```

---

## Troubleshooting

### Rust/Soroban Issues
- Ensure Rust 1.70+: `rustc --version`
- Update Soroban CLI: `cargo install soroban-cli --force`
- Clear cache: `rm -rf contracts/target && cargo build --target wasm32-unknown-unknown`

### Noir Issues
- Ensure Noir 0.25+: `nargo --version`
- Reinstall if needed: `noirup`
- Check dependencies: `cd circuits && nargo check`

### Frontend Issues
- Clear cache: `rm -rf frontend/node_modules frontend/dist && npm install`
- Port 5173 already in use? `npm run dev -- --port 5174`
- TypeScript errors? `npm run lint` to see issues

---

## Deployment Preview (Post-MVP)

### Testnet Deployment
```bash
npm run deploy:testnet
# Outputs contract IDs to .env.local
```

### GitHub Workflow
CI/CD is configured to:
- Run tests on every push
- Build all components
- Check for TypeScript errors
- Lint Rust code

---

## References

### Documentation (In This Repo)
- `README.md` — Project overview
- `CONTRIBUTING.md` — Developer guide
- `docs/ARCHITECTURE.md` — Technical deep-dive
- `docs/MVP_TASKS.md` — Detailed task breakdown

### External Resources
- [Stellar Docs](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Noir Docs](https://noir-lang.org)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

---

## Success Checklist

- [ ] Git repo initialized and first commit pushed
- [ ] All dependencies installed (`npm install` works)
- [ ] Contracts build: `cargo build --target wasm32-unknown-unknown` ✓
- [ ] Circuits build: `nargo build` ✓
- [ ] Frontend starts: `npm run dev` opens localhost:5173 ✓
- [ ] All tests pass: `npm run test` ✓
- [ ] Code formatting works: `npm run format` ✓

---

## Questions?

- **Setup issues?** → See CONTRIBUTING.md
- **Architecture questions?** → See docs/ARCHITECTURE.md
- **Task planning?** → See docs/MVP_TASKS.md
- **Project overview?** → See README.md

**Next Action**: Commit to GitHub and start on Week 1 tasks from `docs/MVP_TASKS.md`

---

**Built for Stellar Hacks 2026** 🚀
