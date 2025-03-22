import { AgentKit, CdpWalletProvider } from "@coinbase/agentkit";
import { ethers } from "ethers";

// Class to handle AgentKit wallet connections
export class CoinbaseWalletConnector {
  private agentKit: AgentKit | null = null;
  private walletProvider: CdpWalletProvider | null = null;

  // Initialize AgentKit with API keys
  async initialize(
    cdpApiKeyName: string,
    cdpApiKeyPrivateKey: string
  ): Promise<boolean> {
    try {
      this.agentKit = await AgentKit.from({
        cdpApiKeyName,
        cdpApiKeyPrivateKey,
      });

      // Get the wallet provider through the supported method
      const walletProvider = await this.getWalletProviderFromAgentKit();
      if (walletProvider) {
        this.walletProvider = walletProvider;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize AgentKit:", error);
      return false;
    }
  }

  // Helper method to safely get the wallet provider
  private async getWalletProviderFromAgentKit(): Promise<CdpWalletProvider | null> {
    if (!this.agentKit) return null;

    try {
      // Use the getActions() method that's available in the public API
      const actions = this.agentKit.getActions();

      // If we have wallet-related actions available, we can try to cast and access the provider
      if (actions.some((action) => action.name === "get_wallet_details")) {
        // This is a workaround since walletProvider is private
        return (this.agentKit as any).walletProvider as CdpWalletProvider;
      }

      return null;
    } catch (error) {
      console.error("Error accessing wallet provider:", error);
      return null;
    }
  }

  // Get the wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      if (!this.walletProvider) return null;
      return await this.walletProvider.getAddress();
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      return null;
    }
  }

  // Get the current chain ID
  async getChainId(): Promise<number | null> {
    try {
      if (!this.walletProvider) return null;

      // Get network information and extract chain ID
      const network = await this.walletProvider.getNetwork();

      // Convert chainId to number explicitly
      return typeof network.chainId === "bigint"
        ? Number(network.chainId)
        : (network.chainId as unknown as number);
    } catch (error) {
      console.error("Failed to get chain ID:", error);
      return null;
    }
  }

  // Get wallet balance
  async getBalance(): Promise<string | null> {
    try {
      if (!this.walletProvider) return null;
      const balance = await this.walletProvider.getBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return null;
    }
  }

  createCompatibleProvider(): ethers.BrowserProvider | null {
    return null;
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.walletProvider !== null;
  }

  // Disconnect wallet
  disconnect(): void {
    this.walletProvider = null;
    this.agentKit = null;
  }
}

// Create and export a singleton instance
export const coinbaseConnector = new CoinbaseWalletConnector();
