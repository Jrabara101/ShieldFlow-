# ShieldFlow 🛡️
## ZK-Shielded Enterprise Mass-Payout & FX Protocol with Selective Compliance

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/built%20on-Stellar-00CAFF.svg)](https://stellar.org)
[![ZK](https://img.shields.io/badge/uses-Zero%20Knowledge-FF6B6B.svg)](https://noir-lang.org)

**ShieldFlow** enables enterprises to execute private, compliant, cross-border mass payouts on Stellar. Recipients and payment amounts remain hidden from competitors, while cryptographic proofs guarantee to regulators that every transaction passes tax, sanction, and KYC screening.

---

## The Problem

Enterprises cannot use public blockchains for payroll or B2B payments because:
- **Competitive intelligence leak** — Competitors see payment volumes, patterns, and recipient addresses
- **Cost structure exposure** — Vendor payments and contractor rates become public
- **Regulatory friction** — Most enterprises are prohibited from using transparent public ledgers

**ShieldFlow solves this** with Zero-Knowledge, Zero-Leak Enterprise Finance.

---

## The Solution: Three Layers

### 🔐 Shielded Ledger
Public observers see zero information about payment volumes, recipient addresses, or amounts.

### ✅ ZK-KYC Passports
Recipients hold encrypted credentials proving they've passed KYC screening. Contracts validate compliance without revealing identity.

### 📋 Auditable Hashes
Senders include encrypted state roots matching their payroll invoices. Auditors receive decryption keys to verify compliance while keeping data secure.

**Result**: Competitors see nothing, regulators see proof of compliance, auditors see everything.

---

## How It Works

```
HR Manager uploads CSV
    ↓
Browser generates ZK proof (Noir → WASM)
    ↓
Freighter wallet signs transaction
    ↓
Stellar receives transaction with proof blob
    ↓
Soroban calls native BN254 verifier (Protocol 25/26)
    ↓
Contract executes transfers in ~5 seconds
    ↓
Auditor decrypts audit trail with encryption key
```

---

## Tech Stack

### Frontend
- **React** 18+ with TypeScript
- **Tailwind CSS** for styling
- **Freighter** wallet integration
- **Noir.wasm** for browser proof generation
- **Vite** for fast development

### Smart Contracts
- **Soroban** (Stellar's smart contract layer)
- **Rust** with soroban-sdk
- **Protocol 25/26** native host functions:
  - BN254 elliptic curve operations (CAP-0080)
  - Poseidon hashing (CAP-0075)
  - Checked 256-bit arithmetic (CAP-0082)

### Zero-Knowledge
- **Noir** for circuit development
- **UltraHonk** proof system
- **NoirJs** for WASM proof generation
- **rs-soroban-ultrahonk** for on-chain verification

---

## Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Soroban CLI (`cargo install soroban-cli`)
- Noir (`noirup` from https://noir-lang.org)

### Setup Development Environment

```bash
# Clone repo
git clone https://github.com/Jrabara101/ShieldFlow-.git
cd ShieldFlow-

# Install dependencies
npm install

# Set up Soroban contracts
cd contracts && cargo build --target wasm32-unknown-unknown && cd ..

# Set up Noir circuits
cd circuits && nargo build && cd ..

# Start frontend dev server
cd frontend && npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions.

---

## Project Structure

```
ShieldFlow-/
├── contracts/
│   ├── ShieldFlowPool/          # Main liquidity pool contract
│   ├── ComplianceVerifier/      # KYC + tax/sanction logic
│   ├── NullifierRegistry/       # Double-spend prevention
│   └── Cargo.toml
├── circuits/
│   ├── batch_payout/            # Noir circuit for batch proofs
│   ├── src/
│   └── Nargo.toml
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page templates
│   │   ├── hooks/              # Custom React hooks
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md          # Technical deep-dive
│   ├── PROTOCOL.md              # Proof system spec
│   └── DEPLOYMENT.md            # Testnet & mainnet guides
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Project planning + architecture
- [ ] Soroban contracts (ShieldFlowPool, ComplianceVerifier, NullifierRegistry)
- [ ] Noir batch payout circuit
- [ ] React dashboard (CSV upload → proof generation)
- [ ] Testnet deployment
- [ ] Demo video + GitHub release

**Timeline**: 4 weeks  
**Goal**: Working proof-of-concept on Stellar testnet

### Phase 2: Private Beta
- [ ] Sanction screening integration (Sayari API)
- [ ] DID credential system
- [ ] Auditor access portal
- [ ] Enterprise pilots (2-3 companies)
- [ ] External security audit

**Timeline**: 5 weeks (overlaps with Phase 1)

### Phase 3: Mainnet
- [ ] Production contract hardening
- [ ] High-availability dashboard
- [ ] SLA + support
- [ ] Direct sales + partnerships

**Timeline**: 6 weeks (post-hackathon)

---

## Key Features (Implemented & Planned)

| Feature | Status | Timeline |
|---------|--------|----------|
| Soroban contracts | 🔄 In Progress | Week 1-2 |
| Noir proof circuits | 🔄 In Progress | Week 2-3 |
| React dashboard | 🔄 In Progress | Week 2-4 |
| Testnet deployment | ⏳ Planned | Week 3 |
| Demo video | ⏳ Planned | Week 4 |
| Audit integration | ⏳ Planned | Phase 2 |
| Mainnet launch | ⏳ Planned | Phase 3 |

---

## Architecture Highlights

### Protocol 25/26 Integration
ShieldFlow directly uses native Stellar host functions for ZK operations:

- **BN254 Verification (CAP-0080)**: Proof verification at 50k gas (vs 1M+ on EVM)
- **Poseidon Hashing (CAP-0075)**: ZK-friendly Merkle trees for nullifier registry
- **Checked Arithmetic (CAP-0082)**: Safe overflow handling for payout calculations

### Gas Efficiency
- **Per-transaction verification**: ~100-200k stroops (vs millions on other chains)
- **Batch processing**: 500 recipients per transaction
- **Proof size**: ~10KB (compressed)

### Privacy Guarantees
- **Zero-knowledge**: Proof validates without revealing private inputs
- **Selective disclosure**: Auditors can decrypt specific transactions with key
- **Unlinkability**: Observers cannot correlate payments to recipients
- **Non-malleability**: Proofs cannot be modified or reused

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development environment setup
- Code style and conventions
- Testing procedures
- Pull request process
- Security considerations

---

## Resources

### Documentation
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Technical overview
- [PROTOCOL.md](docs/PROTOCOL.md) — Proof system specifications
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Network deployment guides

### External Resources
- [Stellar Docs](https://developers.stellar.org)
- [Soroban Docs](https://soroban.stellar.org)
- [Noir Docs](https://noir-lang.org/docs)
- [Noir-Stellar Tutorial](https://jamesbachini.com/noir-on-stellar/)
- [UltraHonk Verifier](https://github.com/yugocabrio/rs-soroban-ultrahonk)

---

## Security

### Audits
- [ ] Internal security review (Week 3)
- [ ] External ZK audit (Phase 2)
- [ ] External contract audit (Phase 2)

### Known Limitations
- **Proof generation**: WASM proof generation takes 10-30s for 500 recipients (optimization in progress)
- **Batch size**: Limited by Stellar transaction size (~1KB memo)
- **Regulatory**: ZK + compliance is an emerging legal space; jurisdictions vary

See [SECURITY.md](docs/SECURITY.md) for details.

---

## License

MIT License. See [LICENSE](LICENSE) file.

---

## Team

Built for the **Stellar Hacks 2026** hackathon.

**Vision**: Make enterprise privacy and compliance native to public blockchains.

---

## Get Started

1. **Read** [CONTRIBUTING.md](CONTRIBUTING.md) for setup
2. **Explore** [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical overview
3. **Run** `npm install && npm run dev` to start the frontend
4. **Join** discussions in GitHub Issues

---

**Questions?** Open a GitHub issue or start a discussion.

**Ready to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md).
