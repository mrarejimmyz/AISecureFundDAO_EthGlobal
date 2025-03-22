import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define supported chain IDs
export const supportedChainIds = [1, 5, 137, 80001, 42161, 84531, 11155111];

// Configure the connectors
export const injected = new InjectedConnector({
  supportedChainIds,
});

// Get provider from window.ethereum
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Get signer from provider
export const getSigner = async (provider: ethers.BrowserProvider) => {
  if (provider) {
    return provider.getSigner();
  }
  return null;
};

// Format address for display
export const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Get chain name from chain ID
export const getChainName = (chainId: number) => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 137:
      return 'Polygon Mainnet';
    case 80001:
      return 'Mumbai Testnet';
    case 42161:
      return 'Arbitrum One';
    case 84531:
      return 'Base Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    default:
      return 'Unknown Network';
  }
};