/**
 * NFT Metadata Service
 * Handles NFT-specific metadata and blockchain information
 * DCCS remains the primary ownership layer
 */

export interface NFTMetadata {
  blockchain?: string;
  walletAddress?: string;
  tokenId?: string;
  contractAddress?: string;
}

export interface NFTAsset {
  clearanceCode: string;
  assetType: 'NFT';
  nftMetadata: NFTMetadata;
  creatorId: string;
  projectTitle: string;
  createdAt: Date;
}

export class NFTMetadataService {
  /**
   * Validate blockchain name
   */
  static validateBlockchain(blockchain: string): boolean {
    const supportedBlockchains = [
      'ethereum',
      'polygon',
      'solana',
      'avalanche',
      'binance',
      'arbitrum',
      'optimism',
      'base',
      'other'
    ];

    return supportedBlockchains.includes(blockchain.toLowerCase());
  }

  /**
   * Validate Ethereum-like wallet address
   */
  static validateWalletAddress(address: string, blockchain: string = 'ethereum'): boolean {
    // Ethereum-like addresses (Ethereum, Polygon, Avalanche, BSC, etc.)
    if (['ethereum', 'polygon', 'avalanche', 'binance', 'arbitrum', 'optimism', 'base'].includes(blockchain.toLowerCase())) {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // Solana addresses
    if (blockchain.toLowerCase() === 'solana') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    return false;
  }

  /**
   * Validate contract address
   */
  static validateContractAddress(address: string, blockchain: string = 'ethereum'): boolean {
    // Same as wallet address for most blockchains
    return this.validateWalletAddress(address, blockchain);
  }

  /**
   * Format blockchain name for display
   */
  static formatBlockchainName(blockchain: string): string {
    const nameMap: Record<string, string> = {
      ethereum: 'Ethereum',
      polygon: 'Polygon',
      solana: 'Solana',
      avalanche: 'Avalanche',
      binance: 'BNB Chain',
      arbitrum: 'Arbitrum',
      optimism: 'Optimism',
      base: 'Base',
      other: 'Other'
    };

    return nameMap[blockchain.toLowerCase()] || blockchain;
  }

  /**
   * Get blockchain explorer URL
   */
  static getExplorerUrl(blockchain: string, address: string, type: 'address' | 'token' = 'address'): string | null {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      solana: 'https://explorer.solana.com',
      avalanche: 'https://snowtrace.io',
      binance: 'https://bscscan.com',
      arbitrum: 'https://arbiscan.io',
      optimism: 'https://optimistic.etherscan.io',
      base: 'https://basescan.org'
    };

    const baseUrl = explorers[blockchain.toLowerCase()];
    if (!baseUrl) return null;

    if (blockchain.toLowerCase() === 'solana') {
      return `${baseUrl}/address/${address}`;
    }

    return type === 'address'
      ? `${baseUrl}/address/${address}`
      : `${baseUrl}/token/${address}`;
  }

  /**
   * Validate NFT metadata
   */
  static validateNFTMetadata(metadata: NFTMetadata): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (metadata.blockchain) {
      if (!this.validateBlockchain(metadata.blockchain)) {
        errors.push('Invalid blockchain network');
      }
    }

    if (metadata.walletAddress) {
      if (metadata.blockchain && !this.validateWalletAddress(metadata.walletAddress, metadata.blockchain)) {
        errors.push('Invalid wallet address format');
      }
    }

    if (metadata.contractAddress) {
      if (metadata.blockchain && !this.validateContractAddress(metadata.contractAddress, metadata.blockchain)) {
        errors.push('Invalid contract address format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format NFT metadata for display
   */
  static formatNFTMetadata(metadata: NFTMetadata): {
    blockchain: string;
    walletAddress?: string;
    tokenId?: string;
    contractAddress?: string;
    explorerLinks?: {
      wallet?: string;
      contract?: string;
    };
  } {
    const formatted = {
      blockchain: metadata.blockchain ? this.formatBlockchainName(metadata.blockchain) : 'Not specified',
      walletAddress: metadata.walletAddress,
      tokenId: metadata.tokenId,
      contractAddress: metadata.contractAddress,
      explorerLinks: {} as { wallet?: string; contract?: string }
    };

    if (metadata.blockchain && metadata.walletAddress) {
      formatted.explorerLinks.wallet = this.getExplorerUrl(metadata.blockchain, metadata.walletAddress, 'address') || undefined;
    }

    if (metadata.blockchain && metadata.contractAddress) {
      formatted.explorerLinks.contract = this.getExplorerUrl(metadata.blockchain, metadata.contractAddress, 'token') || undefined;
    }

    return formatted;
  }

  /**
   * IMPORTANT: DCCS is the primary ownership layer
   * NFT metadata is supplementary information only
   */
  static getDCCSPriorityMessage(): string {
    return 'DCCS (Digital Creative Copyright System) is the primary proof of ownership. ' +
           'Blockchain/NFT information is supplementary and does not supersede DCCS verification.';
  }
}
