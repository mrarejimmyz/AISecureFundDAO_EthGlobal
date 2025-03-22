import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { coinbaseConnector } from "../utils/coinbaseWalletSDK";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type WalletType = "metamask" | "coinbase" | null;

interface WalletContextType {
  connect: () => Promise<void>;
  connectWithCoinbase: () => Promise<void>;
  disconnect: () => void;
  isActive: boolean;
  account: string | null;
  chainId: number | undefined;
  isConnecting: boolean;
  error: Error | null;
  provider: ethers.BrowserProvider | null;
  balance: string | null;
  walletType: WalletType;
}

const WalletContext = createContext<WalletContextType>({
  connect: async () => {},
  connectWithCoinbase: async () => {},
  disconnect: () => {},
  isActive: false,
  account: null,
  chainId: undefined,
  isConnecting: false,
  error: null,
  provider: null,
  balance: null,
  walletType: null,
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
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);

  useEffect(() => {
    // Initialize provider when component mounts for MetaMask/browser wallets
    if (window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      // Check if already connected
      ethersProvider
        .getSigner()
        .then((signer) => {
          signer
            .getAddress()
            .then((address) => {
              setAccount(address);
              setIsActive(true);
              setWalletType("metamask");

              // Get chain ID
              window.ethereum
                .request({ method: "eth_chainId" })
                .then((chainId: string) => {
                  setChainId(parseInt(chainId, 16));
                });

              // Get balance
              ethersProvider.getBalance(address).then((balance) => {
                setBalance(ethers.formatEther(balance));
              });
            })
            .catch(() => {
              // Not connected
            });
        })
        .catch(() => {
          // Not connected
        });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsActive(true);
          setWalletType("metamask");

          // Update balance when account changes
          ethersProvider.getBalance(accounts[0]).then((balance) => {
            setBalance(ethers.formatEther(balance));
          });
        } else {
          setAccount(null);
          setIsActive(false);
          setWalletType(null);
          setBalance(null);
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(parseInt(chainId, 16));

        // Update balance when chain changes
        if (account) {
          ethersProvider.getBalance(account).then((balance) => {
            setBalance(ethers.formatEther(balance));
          });
        }
      });
    }

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [account]);

  const connect = async () => {
    if (!window.ethereum) {
      setError(new Error("No Ethereum wallet detected"));
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsActive(true);
        setWalletType("metamask");

        // Get chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChainId(parseInt(chainId, 16));

        // Get balance
        if (provider) {
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));
        }
      }
    } catch (e) {
      setError(e as Error);
      console.error("Failed to connect wallet:", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWithCoinbase = async () => {
    setIsConnecting(true);

    try {
      // Note: No parameters needed for initialize() with the new implementation
      const success = await coinbaseConnector.initialize();

      if (success) {
        const address = await coinbaseConnector.getWalletAddress();
        const chainId = await coinbaseConnector.getChainId();
        const balance = await coinbaseConnector.getBalance();

        if (address) {
          setAccount(address);
          setIsActive(true);
          setWalletType("coinbase");

          if (chainId) {
            setChainId(chainId);
          }

          if (balance) {
            setBalance(balance);
          }

          // Now getEthersProvider is defined in the connector
          const ethersProvider = coinbaseConnector.getEthersProvider();
          if (ethersProvider) {
            setProvider(ethersProvider);
          }
        }
      } else {
        throw new Error("Failed to initialize Coinbase Wallet");
      }
    } catch (e) {
      setError(e as Error);
      console.error("Failed to connect Coinbase wallet:", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (walletType === "coinbase") {
      coinbaseConnector.disconnect();
    }

    setAccount(null);
    setIsActive(false);
    setWalletType(null);
    setBalance(null);
  };

  const value = {
    connect,
    connectWithCoinbase,
    disconnect,
    isActive,
    account,
    chainId,
    isConnecting,
    error,
    provider,
    balance,
    walletType,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
