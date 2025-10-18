# Deployment Guide

## Prerequisites

1. Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Set up environment variables:

```bash
export PRIVATE_KEY="your_private_key_here"
export BASESCAN_API_KEY="your_basescan_api_key_here"  # Optional, for verification
```

## Deploy to Base Sepolia (Testnet)

1. Get testnet ETH from [Base Sepolia Faucet](https://bridge.base.org/deposit)

2. Deploy contracts:

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
```

Or using the profile:

```bash
forge script script/Deploy.s.sol --profile baseSepolia --broadcast --verify
```

## Deploy to Base Mainnet

1. Ensure you have ETH on Base mainnet

2. Deploy contracts:

```bash
forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast --verify
```

Or using the profile:

```bash
forge script script/Deploy.s.sol --profile baseMainnet --broadcast --verify
```

## Network Information

- **Base Sepolia**: Chain ID 84532, RPC: <https://sepolia.base.org>
- **Base Mainnet**: Chain ID 8453, RPC: <https://mainnet.base.org>

## After Deployment

1. The deployment script will create a `deployments.json` file with contract addresses
2. Update your frontend environment variables with the new addresses:

   ```bash
   NEXT_PUBLIC_AVATAR_NFT_ADDRESS=0x...
   NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x...
   ```

## Verification

To verify contracts on Basescan:

```bash
# For Base Sepolia
forge verify-contract --chain baseSepolia --num-of-optimizations 200 --watch --etherscan-api-key $BASESCAN_API_KEY <CONTRACT_ADDRESS> <CONTRACT_NAME>

# For Base Mainnet  
forge verify-contract --chain baseMainnet --num-of-optimizations 200 --watch --etherscan-api-key $BASESCAN_API_KEY <CONTRACT_ADDRESS> <CONTRACT_NAME>
```

Or use the direct API URLs:

```bash
# Base Sepolia
forge verify-contract --etherscan-api-key $BASESCAN_API_KEY --etherscan-url https://api-sepolia.basescan.org/api <CONTRACT_ADDRESS> <CONTRACT_NAME>

# Base Mainnet
forge verify-contract --etherscan-api-key $BASESCAN_API_KEY --etherscan-url https://api.basescan.org/api <CONTRACT_ADDRESS> <CONTRACT_NAME>
```

## Testing Before Deployment

Run tests first:

```bash
forge test
```

Run tests with gas reporting:

```bash
forge test --gas-report
```
