export interface ContractAddresses {
  RoyaltySplitter: string;
  DCCSRegistry: string;
  LicenseNFT: string;
  InstantPayout: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: ContractAddresses;
}

export interface LicenseData {
  artist: string;
  contentHash: string;
  timestamp: bigint;
  active: boolean;
  licenseType: string;
}

export interface RoyaltyDistribution {
  artist: string;
  platform: string;
  artistAmount: bigint;
  platformAmount: bigint;
  totalAmount: bigint;
  timestamp: number;
}

export interface PayoutRecord {
  artist: string;
  amount: bigint;
  timestamp: bigint;
  transactionHash: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  licenseType: string;
  artist: string;
  contentHash: string;
}
