import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { ethers } from "ethers";

export class CoinbaseWalletConnector {
  private provider: any = null;
  private ethersProvider: ethers.BrowserProvider | null = null;
  private coinbaseWallet: any = null;

  // Initialize the Coinbase Wallet connection
  async initialize(): Promise<boolean> {
    try {
      // Initialize the Coinbase Wallet SDK
      this.coinbaseWallet = new CoinbaseWalletSDK({
        appName: "AISecureFundDAO",
        appLogoUrl: "",
      });

      // Create Web3 Provider
      this.provider = this.coinbaseWallet.makeWeb3Provider();

      // Connect to the wallet
      await this.provider.request({ method: "eth_requestAccounts" });

      // Create ethers provider
      this.ethersProvider = new ethers.BrowserProvider(this.provider);

      return true;
    } catch (error) {
      console.error("Failed to initialize Coinbase wallet:", error);
      return false;
    }
  }

  // Get the wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      if (!this.ethersProvider) return null;
      const signer = await this.ethersProvider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      return null;
    }
  }

  // Get the current chain ID
  async getChainId(): Promise<number | null> {
    try {
      if (!this.provider) return null;
      const chainId = await this.provider.request({ method: "eth_chainId" });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error("Failed to get chain ID:", error);
      return null;
    }
  }

  // Get wallet balance
  async getBalance(): Promise<string | null> {
    try {
      if (!this.ethersProvider) return null;
      const address = await this.getWalletAddress();
      if (!address) return null;

      const balance = await this.ethersProvider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return null;
    }
  }

  // Create an Ethers-compatible provider - add this method
  getEthersProvider(): ethers.BrowserProvider | null {
    return this.ethersProvider;
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.provider !== null && this.ethersProvider !== null;
  }

  // Disconnect wallet
  disconnect(): void {
    if (this.coinbaseWallet && this.provider) {
      this.provider.disconnect();
    }
    this.provider = null;
    this.ethersProvider = null;
  }
}

// Create and export a singleton instance
export const coinbaseConnector = new CoinbaseWalletConnector();
