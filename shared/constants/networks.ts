import { NetworkConfig } from "../types/contracts";

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1337: {
    chainId: 1337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    contracts: {
      RoyaltySplitter: "",
      DCCSRegistry: "",
      LicenseNFT: "",
      InstantPayout: "",
    },
  },
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    contracts: {
      RoyaltySplitter: "",
      DCCSRegistry: "",
      LicenseNFT: "",
      InstantPayout: "",
    },
  },
  8453: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    contracts: {
      RoyaltySplitter: "",
      DCCSRegistry: "",
      LicenseNFT: "",
      InstantPayout: "",
    },
  },
};

export const DEFAULT_CHAIN_ID = 84532;

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS[chainId];
}

export function isNetworkSupported(chainId: number): boolean {
  return chainId in SUPPORTED_NETWORKS;
}
