import { createPublicClient, createWalletClient, http, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { type Address } from "viem";

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

export const getAddress = async (): Promise<Address | undefined> => {
  const storedAddress = localStorage.getItem("walletAddress");
  
  if (window.ethereum) {
    try {
      const addresses = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      // Cast the returned address to the Address type
      return addresses[0] as Address;
    } catch (error) {
      console.error("Error fetching address:", error);
      return undefined;
    }
  }
  return undefined;
};

// Create wallet client when needed
export const createWallet = async () => {
  const address = await getAddress();
  
  if (!address || !window.ethereum) return null;
  
  return createWalletClient({
    account: address, // Now properly typed as Address
    chain: arbitrumSepolia,
    transport: custom(window.ethereum),
  });
};