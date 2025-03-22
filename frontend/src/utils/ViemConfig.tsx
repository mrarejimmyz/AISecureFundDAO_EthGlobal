import { createPublicClient, createWalletClient, http, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

export const address: any = async () => {
  const isUserLoggedIn: any | null = localStorage.getItem("walletAddress") || [""];

  if (isUserLoggedIn.length > 0 && window.ethereum) {
    const address: any = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return address[0];
  }
};

// eg: Metamask or Coinbase AgentKit
export const walletClient = createWalletClient({
  account: address[0],
  chain: arbitrumSepolia,
  transport: custom(window.ethereum!),
});
