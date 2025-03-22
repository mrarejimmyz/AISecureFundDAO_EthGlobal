import { AgentKit, CdpWalletProvider } from '@coinbase/agentkit';

// Initialize AgentKit with environment variables or config
export const initializeAgentKit = async () => {
  try {
    // You should store these in environment variables in a real app
    const cdpApiKeyName = process.env.REACT_APP_CDP_API_KEY_NAME || '';
    const cdpApiKeyPrivateKey = process.env.REACT_APP_CDP_API_KEY_PRIVATE || '';
    
    // Check if keys are provided
    if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
      console.warn('CDP API keys not provided. AgentKit initialization skipped.');
      return null;
    }
    
    // Initialize AgentKit
    const agentKit = await AgentKit.from({
      cdpApiKeyName,
      cdpApiKeyPrivateKey,
    });
    
    return agentKit;
  } catch (error) {
    console.error('Failed to initialize AgentKit:', error);
    return null;
  }
};

// Create AgentKit with custom wallet provider
export const createAgentKitWithWallet = async (address: string) => {
  try {
    const cdpApiKeyName = process.env.REACT_APP_CDP_API_KEY_NAME || '';
    const cdpApiKeyPrivateKey = process.env.REACT_APP_CDP_API_KEY_PRIVATE || '';
    
    if (!cdpApiKeyName || !cdpApiKeyPrivateKey) {
      console.warn('CDP API keys not provided.');
      return null;
    }
    
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: cdpApiKeyName,
      apiKeyPrivateKey: cdpApiKeyPrivateKey,
      networkId: "base-sepolia", // Default to Base testnet
    });
    
    const agentKit = await AgentKit.from({
      walletProvider,
    });
    
    return agentKit;
  } catch (error) {
    console.error('Failed to create AgentKit with wallet:', error);
    return null;
  }
};