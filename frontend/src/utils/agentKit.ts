import { AgentKit, CdpWalletProvider } from '@coinbase/agentkit';

// Enhanced version of agentKit.ts with better error handling and interface
export class AgentKitService {
  private static instance: AgentKitService;
  private agentKit: AgentKit | null = null;
  private walletProvider: CdpWalletProvider | null = null;
  
  private constructor() {}
  
  // Singleton pattern
  public static getInstance(): AgentKitService {
    if (!AgentKitService.instance) {
      AgentKitService.instance = new AgentKitService();
    }
    return AgentKitService.instance;
  }
  
  // Initialize AgentKit with API keys
  public async initialize(cdpApiKeyName: string, cdpApiKeyPrivateKey: string): Promise<boolean> {
    try {
      if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
        console.warn('CDP API keys not provided. AgentKit initialization skipped.');
        return false;
      }
      
      this.agentKit = await AgentKit.from({
        cdpApiKeyName,
        cdpApiKeyPrivateKey,
      });
      
      // Extract wallet provider through a safe method
      await this.extractWalletProvider();
      
      return this.agentKit !== null;
    } catch (error) {
      console.error('Failed to initialize AgentKit:', error);
      return false;
    }
  }
  
  // Helper method to extract wallet provider safely
  private async extractWalletProvider(): Promise<void> {
    if (!this.agentKit) return;
    
    try {
      const actions = this.agentKit.getActions();
      // If there are wallet-related actions, we can assume the provider exists
      if (actions.some(action => action.name === 'get_wallet_details')) {
        // We need to cast as any to access the private property
        // This is a workaround that might break in future AgentKit versions
        this.walletProvider = (this.agentKit as any).walletProvider as CdpWalletProvider;
      }
    } catch (error) {
      console.error('Failed to extract wallet provider:', error);
    }
  }
  
  // Get the current AgentKit instance
  public getAgentKit(): AgentKit | null {
    return this.agentKit;
  }
  
  // Get the wallet provider (now using our cached reference)
  public getWalletProvider(): CdpWalletProvider | null {
    return this.walletProvider;
  }
  
  // Create AgentKit with custom wallet provider
  public async createWithAddress(
    cdpApiKeyName: string, 
    cdpApiKeyPrivateKey: string, 
    networkId: string = "base-sepolia"
  ): Promise<boolean> {
    try {
      if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
        console.warn('CDP API keys not provided.');
        return false;
      }
      
      const walletProvider = await CdpWalletProvider.configureWithWallet({
        apiKeyName: cdpApiKeyName,
        apiKeyPrivateKey: cdpApiKeyPrivateKey,
        networkId,
      });
      
      if (!walletProvider) {
        return false;
      }
      
      this.walletProvider = walletProvider;
      
      this.agentKit = await AgentKit.from({
        walletProvider,
      });
      
      return this.agentKit !== null;
    } catch (error) {
      console.error('Failed to create AgentKit with wallet:', error);
      return false;
    }
  }
  
  // Cleanup / Reset instance
  public reset(): void {
    this.agentKit = null;
    this.walletProvider = null;
  }
}

// Export the singleton instance
export const agentKitService = AgentKitService.getInstance();