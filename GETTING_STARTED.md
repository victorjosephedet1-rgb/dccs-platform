# 🚀 Getting Started with V3BMusic.ai

## Welcome to V3BMusic.ai Development!

This guide will help you set up your development environment and get the platform running locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v20 or higher)
   ```bash
   # Check version
   node --version  # Should show v20.x.x or higher

   # Install from: https://nodejs.org/
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version  # Should show 9.x.x or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Foundry** (for blockchain development)
   ```bash
   # Install Foundry
   curl -L https://foundry.paradigm.xyz | bash
   foundryup

   # Verify installation
   forge --version
   ```

### Required Accounts

1. **Supabase Account**
   - Sign up at: https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **MetaMask Wallet** (for blockchain features)
   - Install from: https://metamask.io
   - Create a wallet
   - Save your seed phrase securely

3. **Base Sepolia Testnet**
   - Add Base Sepolia to MetaMask
   - Get test ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🎯 Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/v3bmusic/v3bmusic-ai.git
cd v3bmusic-ai
```

### 2. Install Frontend Dependencies

```bash
# Install main project dependencies
npm install

# This will install:
# - React, TypeScript, Vite
# - Supabase client
# - ethers.js for Web3
# - i18next for translations
# - And more...
```

### 3. Install Blockchain Dependencies

```bash
cd blockchain
npm install
forge install
cd ..
```

### 4. Configure Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp blockchain/.env.example blockchain/.env

# Edit .env files with your credentials
nano .env
```

**Frontend `.env` configuration:**
```env
# Supabase (get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Blockchain (testnet for development)
VITE_DEFAULT_CHAIN_ID=84532
```

**Blockchain `blockchain/.env` configuration:**
```env
# Your deployer private key (testnet only!)
DEPLOYER_PRIVATE_KEY=your_test_wallet_private_key

# Platform wallet address
PLATFORM_ADDRESS=your_platform_wallet_address

# RPC URLs (public endpoints work for testing)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### 5. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Open http://localhost:5173

**Terminal 2 - Local Blockchain (optional):**
```bash
cd blockchain
npm run node
```

**Terminal 3 - Deploy Contracts (optional):**
```bash
cd blockchain
npm run deploy:local
```

## 🎨 Development Workflow

### Frontend Development

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Blockchain Development

```bash
cd blockchain

# Compile contracts
npm run compile

# Run tests
npm run test:forge      # Foundry tests (faster)
npm test                # Hardhat tests

# Check coverage
npm run test:coverage

# Deploy to testnet
npm run deploy:testnet
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name and password
4. Wait for project to be created (~2 minutes)

### 2. Run Migrations

The migrations are in `supabase/migrations/`. Supabase will automatically run them, or you can run them manually:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Set Up Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Enable Email provider
3. Disable email confirmation (for development)
4. Set site URL to `http://localhost:5173`

## 🔗 Blockchain Integration

### Connect to Base Sepolia Testnet

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network" → "Add network manually"
4. Enter:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

### Get Test ETH

1. Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet
3. Request testnet ETH
4. Wait ~1 minute for funds to arrive

### Deploy Smart Contracts

```bash
cd blockchain

# Deploy to local Hardhat network
npm run node              # Terminal 1
npm run deploy:local      # Terminal 2

# Deploy to Base Sepolia testnet
npm run deploy:testnet

# Verify contracts on BaseScan
npm run verify
```

## 📚 Project Structure

```
v3bmusic-ai/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/           # React contexts (Auth, Web3, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   └── pages/              # Page components
├── blockchain/             # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── test/               # Contract tests
│   └── scripts/            # Deployment scripts
├── supabase/               # Backend
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── shared/                 # Shared types and constants
```

## 🧪 Testing

### Frontend Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

### Smart Contract Tests

```bash
cd blockchain

# Unit tests (Foundry - very fast)
npm run test:forge

# Integration tests (Hardhat)
npm test

# Coverage report
npm run test:coverage

# Gas report
npm run test:gas
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot find module 'ethers'"**
```bash
# Solution: Install dependencies
npm install
```

**Issue: "Supabase connection failed"**
```bash
# Solution: Check your .env file has correct values
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

**Issue: "MetaMask not detected"**
```bash
# Solution: Install MetaMask extension
# Visit: https://metamask.io
```

**Issue: "Insufficient funds for gas"**
```bash
# Solution: Get test ETH from faucet
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```

**Issue: "Contract not found"**
```bash
# Solution: Deploy contracts first
cd blockchain
npm run deploy:local
```

### Get Help

- **GitHub Issues**: https://github.com/yourusername/dccs-platform/issues
- **Discord**: [Join our community](#)
- **Documentation**: See `/docs` folder
- **Email**: support@dccsverify.com

## 📖 Next Steps

Now that you have everything set up:

1. **Explore the codebase**
   - Read `PROJECT_STRUCTURE.md` for architecture overview
   - Check out the components in `src/components/`
   - Review smart contracts in `blockchain/contracts/`

2. **Try the features**
   - Create an artist account
   - Upload a music track
   - Purchase a license
   - View royalty distributions

3. **Start developing**
   - Pick an issue from GitHub
   - Create a new branch
   - Make your changes
   - Submit a pull request

4. **Read the docs**
   - `BLOCKCHAIN_SETUP.md` - Blockchain development guide
   - `DEPLOYMENT_GUIDE.md` - Production deployment
   - `V3BMUSIC_FEATURES_DOCUMENTATION.md` - Feature documentation

## 🎉 You're Ready!

You now have a fully functional local development environment for V3BMusic.ai!

### Development Checklist

- [ ] Node.js v20+ installed
- [ ] Foundry installed
- [ ] MetaMask extension installed
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Frontend running on localhost:5173
- [ ] Test ETH in wallet
- [ ] Contracts deployed (optional)

### Quick Commands Reference

```bash
# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run type-check    # Check TypeScript types
npm run lint          # Lint code

# Blockchain
cd blockchain
npm run compile       # Compile contracts
npm run test:forge    # Run tests
npm run deploy:local  # Deploy locally
npm run deploy:testnet # Deploy to testnet

# Both
npm install           # Install dependencies
```

Happy coding! 🚀

If you encounter any issues, don't hesitate to reach out through GitHub Issues or our Discord community.
