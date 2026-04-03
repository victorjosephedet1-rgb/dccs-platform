# V3BMusic.ai Smart Contracts

Professional blockchain infrastructure for the Decentralized Creative Content Services (DCCS) platform.

## Architecture Overview

```
blockchain/
├── contracts/
│   ├── core/           # Core protocol contracts
│   ├── interfaces/     # Contract interfaces
│   ├── libraries/      # Reusable libraries
│   └── mocks/          # Testing mocks
├── test/
│   ├── foundry/        # Solidity tests (unit + fuzz)
│   └── hardhat/        # TypeScript integration tests
├── scripts/
│   └── deploy/         # Deployment scripts
└── docs/               # Contract documentation
```

## Smart Contracts

### Core Contracts

- **RoyaltySplitter.sol** - Automated 80/20 artist/platform royalty distribution
- **DCCSRegistry.sol** - Digital Clearance Code System for license tracking
- **LicenseNFT.sol** - ERC-2981 compliant license tokens with on-chain royalties
- **InstantPayout.sol** - Multi-chain crypto instant royalty payouts

## Development Environment

This project uses a **hybrid Hardhat + Foundry setup** for maximum flexibility:

- **Foundry** - Fast Solidity testing with fuzz & invariant tests
- **Hardhat** - TypeScript deployment scripts and integration tests

## Quick Start

### Prerequisites

```bash
# Install Node.js dependencies
npm install

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Setup

```bash
# Initialize git (required for Foundry)
git init

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable

# Compile contracts
npm run compile
```

### Testing

```bash
# Run all tests
npm test                  # Hardhat tests
npm run test:forge        # Foundry tests (faster)

# Coverage and gas reporting
npm run test:coverage     # Code coverage
npm run test:gas          # Gas snapshot
```

### Deployment

```bash
# Local development
npm run node              # Start local Hardhat node
npm run deploy:local      # Deploy to local network

# Testnet deployment
npm run deploy:testnet    # Deploy to Base Sepolia

# Mainnet deployment
npm run deploy:mainnet    # Deploy to Base mainnet
```

## Security

This codebase implements multiple layers of security testing:

1. **Unit Tests** - Core functionality validation
2. **Fuzz Tests** - Random input testing for edge cases
3. **Invariant Tests** - Mathematical guarantees (e.g., royalty splits always = 100%)
4. **Integration Tests** - End-to-end system testing

### Security Checklist

- [ ] All tests passing with 100% coverage
- [ ] Fuzz tests run with 10,000+ iterations
- [ ] Invariant tests validate all financial logic
- [ ] External audit completed
- [ ] Multi-sig wallet configured for ownership
- [ ] Deployment scripts tested on testnet

## Networks

### Testnet
- **Base Sepolia** (Recommended) - Low cost, Ethereum-compatible
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org

### Mainnet
- **Base** (Primary) - Low fees, Coinbase-backed
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Block explorers
BASESCAN_API_KEY=your_api_key_here

# Optional
COINMARKETCAP_API_KEY=for_gas_reporting
REPORT_GAS=true
```

## CI/CD

Automated testing and deployment via GitHub Actions:

- Tests run on every PR
- Gas reports generated automatically
- Coverage tracked and reported
- Automated deployment to testnet on merge to `develop`
- Manual deployment to mainnet via workflow dispatch

## Documentation

Generate contract documentation:

```bash
forge doc --serve
```

## Contributing

1. Write comprehensive tests (unit + fuzz + invariant)
2. Follow Solidity style guide
3. Add NatSpec comments to all public functions
4. Run `npm run lint` before committing
5. Ensure gas efficiency with `npm run test:gas`

## License

MIT License - See LICENSE file for details
