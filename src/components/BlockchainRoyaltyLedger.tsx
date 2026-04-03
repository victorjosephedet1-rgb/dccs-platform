import React, { useState, useEffect } from 'react';
import { Shield, Link, Eye, Download, CheckCircle, Clock, Hash } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'license' | 'royalty' | 'split';
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  blockNumber: number;
  confirmations: number;
  gasUsed: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface SmartContract {
  address: string;
  type: 'royalty' | 'licensing' | 'split';
  name: string;
  deployedAt: string;
  verified: boolean;
}

interface BlockchainRoyaltyLedgerProps {
  artistId: string;
}

export default function BlockchainRoyaltyLedger({ artistId }: BlockchainRoyaltyLedgerProps) {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [, setSelectedTx] = useState<string | null>(null);

  useEffect(() => {
    loadBlockchainData();
  }, [artistId]);

  const loadBlockchainData = async () => {
    setLoading(true);
    
    // Simulate blockchain data loading
    setTimeout(() => {
      const mockTransactions: BlockchainTransaction[] = [
        {
          id: '1',
          hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
          type: 'royalty',
          amount: 127.45,
          from: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          to: '0x8ba1f109551bD432803012645Hac136c0532925a',
          timestamp: '2025-01-15 14:30:25',
          blockNumber: 18945672,
          confirmations: 1247,
          gasUsed: '21,000',
          status: 'confirmed'
        },
        {
          id: '2',
          hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          type: 'license',
          amount: 0.15,
          from: '0x532925a3b8D4C0532925a3b8D4742d35Cc6634C05',
          to: '0x8ba1f109551bD432803012645Hac136c0532925a',
          timestamp: '2025-01-15 12:15:10',
          blockNumber: 18945234,
          confirmations: 2085,
          gasUsed: '45,000',
          status: 'confirmed'
        },
        {
          id: '3',
          hash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
          type: 'split',
          amount: 89.32,
          from: '0x8ba1f109551bD432803012645Hac136c0532925a',
          to: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          timestamp: '2025-01-15 09:45:33',
          blockNumber: 18944891,
          confirmations: 2428,
          gasUsed: '32,000',
          status: 'confirmed'
        },
        {
          id: '4',
          hash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          type: 'royalty',
          amount: 234.67,
          from: '0x532925a3b8D4C0532925a3b8D4742d35Cc6634C05',
          to: '0x8ba1f109551bD432803012645Hac136c0532925a',
          timestamp: '2025-01-14 18:22:15',
          blockNumber: 18943456,
          confirmations: 3863,
          gasUsed: '28,500',
          status: 'confirmed'
        }
      ];

      const mockContracts: SmartContract[] = [
        {
          address: '0x8ba1f109551bD432803012645Hac136c0532925a',
          type: 'royalty',
          name: 'V3B Royalty Distribution',
          deployedAt: '2025-01-01 00:00:00',
          verified: true
        },
        {
          address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
          type: 'licensing',
          name: 'V3B Instant Licensing',
          deployedAt: '2025-01-01 00:00:00',
          verified: true
        },
        {
          address: '0x532925a3b8D4C0532925a3b8D4742d35Cc6634C05',
          type: 'split',
          name: 'V3B Revenue Split',
          deployedAt: '2025-01-01 00:00:00',
          verified: true
        }
      ];

      setTransactions(mockTransactions);
      setContracts(mockContracts);
      setLoading(false);
    }, 1500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'royalty': return 'text-green-400 bg-green-500/20';
      case 'license': return 'text-blue-400 bg-blue-500/20';
      case 'split': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Loading Blockchain Data</h3>
          <p className="text-gray-400">Syncing with Ethereum mainnet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Overview */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Blockchain Royalty Ledger</h2>
            <p className="text-gray-400">Immutable, transparent, and verifiable royalty tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold text-white">{transactions.length}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Confirmed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {transactions.filter(tx => tx.status === 'confirmed').length}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Smart Contracts</span>
            </div>
            <div className="text-2xl font-bold text-white">{contracts.length}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Network</span>
            </div>
            <div className="text-lg font-bold text-white">Ethereum</div>
          </div>
        </div>
      </div>

      {/* Smart Contracts */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Smart Contracts</h3>
          <p className="text-gray-400">Verified contracts managing your royalties</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.address} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{contract.name}</div>
                      <div className="text-sm text-gray-400 font-mono">{contract.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contract.verified && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(contract.type)}`}>
                      {contract.type}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Deployed: {contract.deployedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Transaction History</h3>
              <p className="text-gray-400">All royalty transactions on the blockchain</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => {
                console.log('Exporting blockchain transaction history for artist:', artistId);
                addNotification({
                  type: 'success',
                  title: 'Blockchain Data Exported',
                  message: 'Transaction history has been exported to CSV'
                });
                // Simulate file download
                const link = document.createElement('a');
                link.href = '#';
                link.download = `Blockchain_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Transaction Hash</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Block</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Confirmations</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="font-mono text-white">{truncateHash(tx.hash)}</div>
                    <div className="text-sm text-gray-400">{tx.timestamp}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-semibold">${tx.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">Gas: {tx.gasUsed}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{tx.blockNumber.toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-300">{tx.confirmations.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 w-fit ${getStatusColor(tx.status)}`}>
                      {tx.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                      {tx.status === 'pending' && <Clock className="h-3 w-3" />}
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => {
                        console.log('Viewing transaction details:', tx);
                        addNotification({
                          type: 'info',
                          title: 'Transaction Details',
                          message: `Viewing details for transaction ${tx.hash.slice(0, 10)}...`
                        });
                        setSelectedTx(tx.id);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockchain Benefits */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Blockchain Advantages Over Traditional Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Immutable Records</h4>
            <p className="text-sm text-blue-200">
              Every royalty payment is permanently recorded on the blockchain. No disputes, no "lost" payments like with PRS UK.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Full Transparency</h4>
            <p className="text-sm text-blue-200">
              See exactly where your money comes from and goes. No black box accounting like traditional collection societies.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-cyan-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Instant Verification</h4>
            <p className="text-sm text-blue-200">
              Smart contracts automatically verify and execute payments. No 6-month delays like traditional royalty systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}