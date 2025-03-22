import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  isActive: boolean;
  account: string | null;
  chainId: number | undefined;
  isConnecting: boolean;
  error: Error | null;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType>({
  connect: async () => {},
  disconnect: () => {},
  isActive: false,
  account: null,
  chainId: undefined,
  isConnecting: false,
  error: null,
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    // Initialize provider when component mounts
    if (window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      
      // Check if already connected
      ethersProvider.getSigner().then(signer => {
        signer.getAddress().then(address => {
          setAccount(address);
          setIsActive(true);
        }).catch(() => {
          // Not connected
        });
      }).catch(() => {
        // Not connected
      });
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsActive(true);
        } else {
          setAccount(null);
          setIsActive(false);
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError(new Error('No Ethereum wallet detected'));
      return;
    }
    
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsActive(true);
        
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
      }
    } catch (e) {
      setError(e as Error);
      console.error('Failed to connect wallet:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsActive(false);
  };

  const value = {
    connect,
    disconnect,
    isActive,
    account,
    chainId,
    isConnecting,
    error,
    provider,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};