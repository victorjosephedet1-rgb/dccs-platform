export interface AssetMetadata {
  creatorId: string;
  assetTitle: string;
  assetType: 'audio' | 'music' | 'video' | 'image' | 'art' | 'artwork' | 'nft' | 'document' | 'design' | '3dmodel' | 'code' | 'ai-generated' | 'other';
  fileHash?: string;
  fingerprint?: string;
  timestamp?: Date;
  // NFT-specific metadata (optional)
  nftMetadata?: {
    blockchain?: string;        // e.g., 'Ethereum', 'Polygon', 'Solana'
    walletAddress?: string;     // Creator's wallet address
    tokenId?: string;           // Token ID if already minted
    contractAddress?: string;   // Smart contract address
  };
}

export interface ClearanceCode {
  code: string;
  assetType: string;
  year: string;
  uniqueId: string;
  fullCode: string;
  // Legacy fields for backward compatibility
  version?: string;
  creatorId?: string;
  dateCode?: string;
  hash?: string;
  checksum?: string;
}

export class ClearanceCodeGenerator {
  private static readonly PREFIX = 'DCCS';

  // Standardized type codes mapping for all creative assets
  private static readonly TYPE_CODES: Record<string, string> = {
    // Audio content
    audio: 'AUD',
    music: 'AUD',
    podcast: 'AUD',
    sample_pack: 'AUD',

    // Video content
    video: 'VID',
    film: 'VID',
    animation: 'VID',

    // Visual content (photos, graphics)
    image: 'IMG',
    photo: 'IMG',
    photography: 'IMG',

    // Artwork (digital or physical art)
    art: 'ART',
    artwork: 'ART',
    painting: 'ART',
    illustration: 'ART',
    'digital-art': 'ART',

    // NFT and blockchain assets
    nft: 'NFT',
    'nft-asset': 'NFT',
    'blockchain-asset': 'NFT',

    // Documents
    document: 'DOC',
    design: 'DOC',
    manuscript: 'DOC',

    // 3D and models
    '3dmodel': 'MOD',
    '3d': 'MOD',
    model: 'MOD',

    // Code and software
    code: 'COD',
    software: 'COD',
    app: 'COD',

    // AI-generated (inherit from base type)
    'ai-generated': 'AUD',

    // Other
    other: 'OTH'
  };

  static async generateFingerprint(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 12).toUpperCase();
  }

  static generateClearanceCode(metadata: AssetMetadata): ClearanceCode {
    const typeCode = this.TYPE_CODES[metadata.assetType] || 'OTH';
    const timestamp = metadata.timestamp || new Date();
    const year = timestamp.getFullYear().toString();

    // Generate globally unique ID from fingerprint/hash or create new one
    const uniqueId = this.generateUniqueId(metadata);

    // Standardized DCCS format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
    const fullCode = `${this.PREFIX}-${typeCode}-${year}-${uniqueId}`;

    console.log('[DCCS] Code generated:', fullCode);
    console.log('[DCCS] Type detected:', metadata.assetType, '→', typeCode);
    console.log('[DCCS] Unique ID assigned:', uniqueId);

    return {
      code: fullCode,
      assetType: typeCode,
      year,
      uniqueId,
      fullCode
    };
  }

  /**
   * Generate a globally unique 6-character alphanumeric ID
   * Uses fingerprint/hash if available, otherwise generates random
   */
  private static generateUniqueId(metadata: AssetMetadata): string {
    if (metadata.fingerprint) {
      // Use first 6 chars of fingerprint (already unique)
      return metadata.fingerprint.substring(0, 6).toUpperCase();
    }

    if (metadata.fileHash) {
      // Use first 6 chars of file hash
      return metadata.fileHash.substring(0, 6).toUpperCase();
    }

    // Generate cryptographically random 6-char ID
    return this.generateRandomHash();
  }

  /**
   * Generate cryptographically random 6-character alphanumeric ID
   * Uses uppercase letters and numbers for readability
   * Now uses crypto.getRandomValues() for true randomness
   */
  private static generateRandomHash(): string {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O for clarity
    const randomValues = new Uint8Array(6);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
    return result;
  }

  /**
   * Generate a unique DCCS code with database collision check
   * Retries with new random hash if collision detected
   */
  static async generateUniqueClearanceCode(
    metadata: AssetMetadata,
    checkUniqueness: (code: string) => Promise<boolean>
  ): Promise<ClearanceCode> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const clearanceCode = this.generateClearanceCode(metadata);

      const isUnique = await checkUniqueness(clearanceCode.fullCode);

      if (isUnique) {
        console.log(`[DCCS] Unique code generated on attempt ${attempts + 1}`);
        return clearanceCode;
      }

      console.warn(`[DCCS] Code collision detected, regenerating... (attempt ${attempts + 1}/${maxAttempts})`);

      // Force new random ID for next attempt
      metadata.fingerprint = undefined;
      metadata.fileHash = undefined;
      attempts++;
    }

    throw new Error('Failed to generate unique DCCS code after maximum attempts');
  }

  /**
   * Validate DCCS clearance code format
   * Supports both new format (DCCS-TYPE-YEAR-ID) and legacy format for backward compatibility
   */
  static validateClearanceCode(code: string): boolean {
    // New standardized format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
    // Now supports: AUD, VID, IMG, ART, NFT, DOC, MOD, COD, OTH
    const newPattern = /^DCCS-(AUD|VID|IMG|ART|NFT|DOC|MOD|COD|OTH)-\d{4}-[A-Z0-9]{6}$/;

    // Legacy format for backward compatibility
    const legacyPattern = /^DCCS-\d{2}-(AUD|MUS|VID|IMG|ART|DOC|DES|3DM|AIG|OTH)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$/;

    return newPattern.test(code) || legacyPattern.test(code);
  }

  /**
   * Parse DCCS clearance code into components
   * Supports both new and legacy formats
   */
  static parseClearanceCode(code: string): Partial<ClearanceCode> | null {
    if (!this.validateClearanceCode(code)) {
      return null;
    }

    const parts = code.split('-');

    // New format: DCCS-TYPE-YEAR-ID (4 parts)
    if (parts.length === 4) {
      return {
        code,
        assetType: parts[1],
        year: parts[2],
        uniqueId: parts[3],
        fullCode: code
      };
    }

    // Legacy format: DCCS-VER-TYPE-CREATOR-DATE-HASH-CHECKSUM (7 parts)
    if (parts.length === 7) {
      return {
        code,
        version: parts[1],
        assetType: parts[2],
        creatorId: parts[3],
        dateCode: parts[4],
        hash: parts[5],
        checksum: parts[6],
        fullCode: code,
        // Extract year from legacy dateCode (YYYYMMDD)
        year: parts[4].substring(0, 4),
        uniqueId: parts[5]
      };
    }

    return null;
  }

  static async generateAssetFingerprint(file: File): Promise<{
    fingerprint: string;
    fileHash: string;
    fileSize: number;
    fileType: string;
  }> {
    const fingerprint = await this.generateFingerprint(file);

    return {
      fingerprint,
      fileHash: fingerprint,
      fileSize: file.size,
      fileType: file.type
    };
  }

  /**
   * Get human-readable asset type name from code
   */
  static getAssetTypeName(typeCode: string): string {
    const typeNames: Record<string, string> = {
      AUD: 'Audio',
      VID: 'Video',
      IMG: 'Image',
      ART: 'Artwork',
      NFT: 'NFT',
      DOC: 'Document',
      MOD: '3D Model',
      COD: 'Code',
      OTH: 'Other'
    };

    return typeNames[typeCode] || 'Unknown';
  }

  /**
   * Check if asset type is NFT
   */
  static isNFTAsset(typeCode: string): boolean {
    return typeCode === 'NFT';
  }
}
