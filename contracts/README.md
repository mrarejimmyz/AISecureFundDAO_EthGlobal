# Contracts for AISecureFundDAO

This directory contains the Solidity smart contracts that form the backbone of **AISecureFundDAO**, a decentralized autonomous organization (DAO) leveraging privacy-preserving technologies, artificial intelligence (AI), and Ethereum blockchain for secure governance and funding allocation.

---

## **Overview**

The contracts in this folder implement the core functionalities of AISecureFundDAO, including:

- **Project Registry**: Submission and management of projects seeking funding.
- **Private Voting**: Secure voting mechanisms using Trusted Execution Environments (TEEs).
- **Sealed-Bid Auctions**: Confidential funding pledges for projects.
- **Result Verification**: Validation of computation outcomes from TEEs.
- **Treasury Management**: Distribution of funds based on voting and auction results.

---

## **Folder Structure**

```
contracts/
├── ProjectRegistry.sol         # Manages project submissions and metadata
├── PrivateVoting.sol           # Implements encrypted voting via TEEs
├── SealedBidAuction.sol        # Handles sealed-bid funding pledges
├── ResultVerification.sol      # Verifies TEE computation results
├── Treasury.sol                # Manages fund distribution
└── interfaces/
    ├── ITEE.sol                # Interface for TEE interactions
    └── IAIComponent.sol        # Interface for AI components
```

---

## **Core Contracts**

### **1. ProjectRegistry.sol**

Manages the submission of projects seeking funding. Each project includes metadata such as:

- Project name
- Funding goal
- Proposer address

### **2. PrivateVoting.sol**

Enables secure, private voting using TEEs. Votes are encrypted and processed confidentially to ensure fairness and prevent manipulation.

### **3. SealedBidAuction.sol**

Implements a sealed-bid auction system where participants can pledge funds confidentially to support projects.

### **4. ResultVerification.sol**

Validates computation results from TEEs to ensure integrity and correctness.

### **5. Treasury.sol**

Handles the distribution of funds based on voting and auction outcomes. Ensures transparency while maintaining security.

---

## **Interfaces**

### **ITEE.sol**

Defines interaction with Trusted Execution Environments (TEEs), including methods for:

- Remote attestation
- Secure computation

### **IAIComponent.sol**

Defines interaction with AI components used for optimization and analysis, such as:

- Voting pattern analysis
- Funding allocation suggestions

---

## **How to Use**

### **1. Compilation**

Compile all contracts using Hardhat:

```bash
npx hardhat compile
```

### **2. Deployment**

Deploy contracts to an Ethereum testnet (e.g., Sepolia):

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### **3. Testing**

Run unit tests for individual contracts:

```bash
npx hardhat test tests/unit/contracts/test_ProjectRegistry.js
```

---

## **Technologies Used**

- Solidity `^0.8.28`
- Hardhat development framework
- Trusted Execution Environments (TEEs)
- Artificial Intelligence (AI) components

---

## **Best Practices**

1. Follow coding standards outlined in [Solidity Code Style Guide](../docs/coding_standards.md).
2. Use modular design principles to ensure maintainability.
3. Optimize gas usage by minimizing storage writes and loops.

---

## **Acknowledgments**

Special thanks to our sponsors for enabling advanced integrations:

- Marlin TEEs: Secure computation layer.
- Nillion: Privacy-preserving AI.
- Nethermind: Agentic AI capabilities.
- t1 Protocol: Real-time proving.
- Autonome: AI agent development.
- 0G Storage: Decentralized storage solutions.
- Coinbase AgentKit: Wallet management tools.

---
