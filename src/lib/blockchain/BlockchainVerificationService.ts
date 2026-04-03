/**
 * Blockchain Verification Service - Phase 1 Core Component
 * Engineer: Web3 Specialist
 *
 * Purpose: Real blockchain integration for DCCS certificate anchoring
 * Implements Polygon mainnet deployment, transaction management, and verification
 */

import { ethers } from 'ethers';
import { supabase } from '../supabase';

export interface BlockchainConfig {
  network: 'polygon' | 'ethereum' | 'polygon-mumbai';
  rpcUrl: string;
  chainId: number;
  privateKey?: string;
  contractAddress?: string;
}

export interface CertificateAnchor {
  certificateId: string;
  contentHash: string;
  clearanceCode: string;
  timestamp: number;
  creatorAddress: string;
}

export interface TransactionResult {
  txHash: string;
  blockNumber: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
  networkFee: string;
}

export interface VerificationResult {
  isValid: boolean;
  onChainData: CertificateAnchor | null;
  txHash: string;
  blockTimestamp: number;
  confirmations: number;
}

export class BlockchainVerificationService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private config: BlockchainConfig;

  private readonly CONTRACT_ABI = [
    'function registerCertificate(string certificateId, bytes32 contentHash, string clearanceCode) returns (uint256)',
    'function verifyCertificate(string certificateId) view returns (bool, bytes32, string, uint256, address)',
    'function getCertificateByCode(string clearanceCode) view returns (bool, string, bytes32, uint256, address)',
    'event CertificateRegistered(string indexed certificateId, bytes32 contentHash, string clearanceCode, address creator, uint256 timestamp)'
  ];

  private readonly GAS_LIMIT = 500000;
  private readonly MAX_RETRIES = 3;
  private readonly CONFIRMATION_BLOCKS = 3;

  constructor(config: BlockchainConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.config.chainId) {
        throw new Error(`Network mismatch: expected ${this.config.chainId}, got ${network.chainId}`);
      }

      if (this.config.privateKey) {
        this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
      }

      if (this.config.contractAddress && this.wallet) {
        this.contract = new ethers.Contract(
          this.config.contractAddress,
          this.CONTRACT_ABI,
          this.wallet
        );
      }

      console.log('Blockchain service initialized:', {
        network: this.config.network,
        chainId: this.config.chainId,
        contractAddress: this.config.contractAddress
      });
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async anchorCertificate(anchor: CertificateAnchor): Promise<TransactionResult> {
    if (!this.contract || !this.wallet) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const contentHashBytes = ethers.id(anchor.contentHash);

      const tx = await this.contract.registerCertificate(
        anchor.certificateId,
        contentHashBytes,
        anchor.clearanceCode,
        {
          gasLimit: this.GAS_LIMIT
        }
      );

      console.log('Transaction submitted:', tx.hash);

      await this.updateDatabasePendingTx(anchor.certificateId, tx.hash);

      const receipt = await tx.wait(this.CONFIRMATION_BLOCKS);

      const result: TransactionResult = {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        networkFee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
      };

      await this.updateDatabaseConfirmedTx(anchor.certificateId, result);

      return result;
    } catch (error) {
      console.error('Certificate anchoring failed:', error);
      throw error;
    }
  }

  async verifyCertificate(certificateId: string): Promise<VerificationResult> {
    if (!this.contract || !this.provider) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const [exists, contentHash, clearanceCode, timestamp, creator] =
        await this.contract.verifyCertificate(certificateId);

      if (!exists) {
        return {
          isValid: false,
          onChainData: null,
          txHash: '',
          blockTimestamp: 0,
          confirmations: 0
        };
      }

      const { data: dbRecord } = await supabase
        .from('dccs_certificates')
        .select('blockchain_tx_hash')
        .eq('certificate_id', certificateId)
        .single();

      let blockTimestamp = 0;
      let confirmations = 0;

      if (dbRecord?.blockchain_tx_hash) {
        const receipt = await this.provider.getTransactionReceipt(dbRecord.blockchain_tx_hash);
        if (receipt) {
          const block = await this.provider.getBlock(receipt.blockNumber);
          blockTimestamp = block?.timestamp || 0;

          const currentBlock = await this.provider.getBlockNumber();
          confirmations = currentBlock - receipt.blockNumber;
        }
      }

      return {
        isValid: true,
        onChainData: {
          certificateId,
          contentHash,
          clearanceCode,
          timestamp: Number(timestamp),
          creatorAddress: creator
        },
        txHash: dbRecord?.blockchain_tx_hash || '',
        blockTimestamp,
        confirmations
      };
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return {
        isValid: false,
        onChainData: null,
        txHash: '',
        blockTimestamp: 0,
        confirmations: 0
      };
    }
  }

  async verifyCertificateByCode(clearanceCode: string): Promise<VerificationResult> {
    if (!this.contract || !this.provider) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const [exists, certificateId, contentHash, timestamp, creator] =
        await this.contract.getCertificateByCode(clearanceCode);

      if (!exists) {
        return {
          isValid: false,
          onChainData: null,
          txHash: '',
          blockTimestamp: 0,
          confirmations: 0
        };
      }

      return await this.verifyCertificate(certificateId);
    } catch (error) {
      console.error('Certificate verification by code failed:', error);
      return {
        isValid: false,
        onChainData: null,
        txHash: '',
        blockTimestamp: 0,
        confirmations: 0
      };
    }
  }

  async batchAnchorCertificates(anchors: CertificateAnchor[]): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const anchor of anchors) {
      try {
        const result = await this.anchorCertificate(anchor);
        results.push(result);

        await this.delay(2000);
      } catch (error) {
        console.error(`Failed to anchor certificate ${anchor.certificateId}:`, error);
        results.push({
          txHash: '',
          blockNumber: 0,
          confirmations: 0,
          status: 'failed',
          gasUsed: '0',
          networkFee: '0'
        });
      }
    }

    return results;
  }

  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber: number;
  }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          status: 'pending',
          confirmations: 0,
          blockNumber: 0
        };
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        status: 'failed',
        confirmations: 0,
        blockNumber: 0
      };
    }
  }

  async estimateGasCost(anchor: CertificateAnchor): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }> {
    if (!this.contract || !this.provider) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const contentHashBytes = ethers.id(anchor.contentHash);

      const gasLimit = await this.contract.registerCertificate.estimateGas(
        anchor.certificateId,
        contentHashBytes,
        anchor.clearanceCode
      );

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');

      const estimatedCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedCost: ethers.formatEther(estimatedCost)
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  async getNetworkStats(): Promise<{
    network: string;
    chainId: number;
    blockNumber: number;
    gasPrice: string;
    isConnected: boolean;
  }> {
    if (!this.provider) {
      return {
        network: 'disconnected',
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false
      };
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();

      return {
        network: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to get network stats:', error);
      return {
        network: 'error',
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false
      };
    }
  }

  private async updateDatabasePendingTx(
    certificateId: string,
    txHash: string
  ): Promise<void> {
    await supabase
      .from('dccs_certificates')
      .update({
        blockchain_tx_hash: txHash,
        blockchain_network: this.config.network,
        blockchain_verified: false
      })
      .eq('certificate_id', certificateId);
  }

  private async updateDatabaseConfirmedTx(
    certificateId: string,
    result: TransactionResult
  ): Promise<void> {
    await supabase
      .from('dccs_certificates')
      .update({
        blockchain_verified: result.status === 'confirmed',
        verified_at: result.status === 'confirmed' ? new Date().toISOString() : null,
        blockchain_confirmation_count: result.confirmations
      })
      .eq('certificate_id', certificateId);

    await supabase.from('blockchain_transactions').insert({
      certificate_id: certificateId,
      tx_hash: result.txHash,
      network: this.config.network,
      block_number: result.blockNumber,
      gas_used: result.gasUsed,
      network_fee: result.networkFee,
      status: result.status,
      confirmations: result.confirmations,
      created_at: new Date().toISOString()
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
  }
}

export function createBlockchainService(network: 'polygon' | 'polygon-mumbai' = 'polygon'): BlockchainVerificationService {
  const configs: Record<string, BlockchainConfig> = {
    polygon: {
      network: 'polygon',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      privateKey: import.meta.env.VITE_BLOCKCHAIN_PRIVATE_KEY,
      contractAddress: import.meta.env.VITE_DCCS_CONTRACT_ADDRESS
    },
    'polygon-mumbai': {
      network: 'polygon-mumbai',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      privateKey: import.meta.env.VITE_BLOCKCHAIN_PRIVATE_KEY,
      contractAddress: import.meta.env.VITE_DCCS_CONTRACT_ADDRESS
    }
  };

  return new BlockchainVerificationService(configs[network]);
}

export const blockchainService = createBlockchainService();
