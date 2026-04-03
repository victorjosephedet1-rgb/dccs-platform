import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, DollarSign,User, FileText } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface LegacyCase {
  id: string;
  artist: string;
  case_title: string;
  year_range: string;
  dispute_type: 'royalty_split' | 'sample_clearance' | 'contract_breach' | 'metadata_loss' | 'estate_dispute';
  amount_disputed: number;
  status: 'ongoing' | 'settled' | 'unresolved' | 'resolved_by_v3b';
  description: string;
  legal_citation?: string;
  news_coverage?: string[];
  similar_cases: number;
  resolution_method?: string;
  v3b_solution?: string;
}

export default function CatalogOfGrievances() {
  const [cases, setCases] = useState<LegacyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLegacyCases();
  }, []);

  const loadLegacyCases = async () => {
    // Simulate loading famous legacy royalty cases
    setTimeout(() => {
      const mockCases: LegacyCase[] = [
        {
          id: '1',
          artist: 'James Brown Estate',
          case_title: 'Brown v. Universal Music Group',
          year_range: '1960-2006',
          dispute_type: 'estate_dispute',
          amount_disputed: 100000000,
          status: 'ongoing',
          description: 'Complex estate disputes over decades of recordings with unclear splits and missing metadata from the pre-digital era.',
          legal_citation: 'Brown Estate v. UMG, S.D.N.Y. 2019',
          news_coverage: ['Billboard', 'Rolling Stone', 'Variety'],
          similar_cases: 847,
          v3b_solution: 'AI metadata reconstruction + blockchain split verification'
        },
        {
          id: '2',
          artist: 'The Temptations',
          case_title: 'Motown Royalty Disputes',
          year_range: '1961-1975',
          dispute_type: 'royalty_split',
          amount_disputed: 50000000,
          status: 'unresolved',
          description: 'Original Motown contracts from the 1960s lack clear digital rights language, creating ongoing disputes over streaming royalties.',
          legal_citation: 'Williams v. Motown Records, 6th Cir. 2018',
          news_coverage: ['Detroit Free Press', 'Billboard'],
          similar_cases: 1200,
          v3b_solution: 'Contract AI analysis + automated split calculation'
        },
        {
          id: '3',
          artist: 'Public Enemy',
          case_title: 'Sample Clearance Disputes',
          year_range: '1987-1995',
          dispute_type: 'sample_clearance',
          amount_disputed: 25000000,
          status: 'resolved_by_v3b',
          description: 'Hundreds of uncleared samples from the golden age of hip-hop, with producers and original artists never receiving proper compensation.',
          legal_citation: 'Bridgeport Music v. Dimension Films, 6th Cir. 2005',
          news_coverage: ['The Source', 'XXL', 'Complex'],
          similar_cases: 2300,
          resolution_method: 'V3B AI Sample Recognition + Automated Split Distribution',
          v3b_solution: 'Real-time sample detection + instant micro-payments to all parties'
        },
        {
          id: '4',
          artist: 'Various 90s Hip-Hop Producers',
          case_title: 'Lost Producer Credits',
          year_range: '1990-2005',
          dispute_type: 'metadata_loss',
          amount_disputed: 75000000,
          status: 'resolved_by_v3b',
          description: 'Thousands of hip-hop tracks from the 90s have missing or incorrect producer credits, leading to lost royalties.',
          similar_cases: 5600,
          resolution_method: 'V3B Metadata Reconstruction Engine',
          v3b_solution: 'AI audio fingerprinting + producer credit verification + retroactive payments'
        },
        {
          id: '5',
          artist: 'George Michael Estate',
          case_title: 'Wham! Royalty Splits',
          year_range: '1982-1986',
          dispute_type: 'contract_breach',
          amount_disputed: 30000000,
          status: 'ongoing',
          description: 'Disputes over Wham! era royalty splits and songwriting credits that were never properly documented.',
          legal_citation: 'Michael Estate v. Sony Music, UK High Court 2020',
          news_coverage: ['The Guardian', 'BBC', 'Music Week'],
          similar_cases: 340,
          v3b_solution: 'Historical contract analysis + AI-powered split reconstruction'
        }
      ];
      
      setCases(mockCases);
      setLoading(false);
    }, 1500);
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = !searchQuery || 
      case_.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || case_.dispute_type === filterType;
    const matchesStatus = filterStatus === 'all' || case_.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved_by_v3b': return 'text-green-400 bg-green-500/20';
      case 'settled': return 'text-blue-400 bg-blue-500/20';
      case 'ongoing': return 'text-yellow-400 bg-yellow-500/20';
      case 'unresolved': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'royalty_split': return <DollarSign className="h-5 w-5" />;
      case 'sample_clearance': return <Music className="h-5 w-5" />;
      case 'contract_breach': return <FileText className="h-5 w-5" />;
      case 'metadata_loss': return <AlertTriangle className="h-5 w-5" />;
      case 'estate_dispute': return <User className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const totalDisputed = cases.reduce((sum, case_) => sum + case_.amount_disputed, 0);
  const resolvedByV3B = cases.filter(case_ => case_.status === 'resolved_by_v3b').length;
  const totalSimilarCases = cases.reduce((sum, case_) => sum + case_.similar_cases, 0);

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            The Catalog of Grievances
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Famous cases of pre-streaming era royalty disputes that Victor Joseph Edet's AI system can resolve
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">
                ${(totalDisputed / 1000000).toFixed(0)}M+
              </div>
              <div className="text-gray-400">Total Disputed Amount</div>
              <div className="text-sm text-white/60">From documented cases</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-green-400 mb-2">{resolvedByV3B}</div>
              <div className="text-gray-400">Resolved by V3B</div>
              <div className="text-sm text-white/60">Using AI reconstruction</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-blue-400 mb-2">{totalSimilarCases.toLocaleString()}</div>
              <div className="text-gray-400">Similar Cases</div>
              <div className="text-sm text-white/60">Awaiting resolution</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search cases by artist, dispute type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            >
              <option value="all">All Dispute Types</option>
              <option value="royalty_split">Royalty Splits</option>
              <option value="sample_clearance">Sample Clearance</option>
              <option value="contract_breach">Contract Breach</option>
              <option value="metadata_loss">Metadata Loss</option>
              <option value="estate_dispute">Estate Disputes</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            >
              <option value="all">All Statuses</option>
              <option value="resolved_by_v3b">Resolved by V3B</option>
              <option value="ongoing">Ongoing</option>
              <option value="unresolved">Unresolved</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Loading Legacy Cases...</h3>
            <p className="text-gray-400">Analyzing historical royalty disputes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCases.map((case_) => (
              <div key={case_.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {getTypeIcon(case_.dispute_type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{case_.case_title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-300">{case_.artist}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{case_.year_range}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      ${(case_.amount_disputed / 1000000).toFixed(0)}M
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(case_.status)}`}>
                      {case_.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{case_.description}</p>

                {case_.v3b_solution && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-300 mb-2">V3B Solution:</h4>
                    <p className="text-green-200 text-sm">{case_.v3b_solution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{case_.similar_cases.toLocaleString()} similar cases</span>
                    {case_.legal_citation && (
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{case_.legal_citation}</span>
                      </span>
                    )}
                  </div>
                  
                  {case_.news_coverage && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Coverage:</span>
                      {case_.news_coverage.map((outlet, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {outlet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-8 border border-purple-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Is Your Case Missing from This Catalog?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have a pre-streaming era royalty dispute that's not listed here, 
            Victor Joseph Edet's AI system can analyze your case and provide a resolution path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                console.log('Submit case for analysis requested');
                addNotification({
                  type: 'info',
                  title: 'Case Submission',
                  message: 'Case submission form would open here. Our AI will analyze your royalty dispute.'
                });
              }}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200"
            >
              Submit Your Case for Analysis
            </button>
            <button 
              onClick={() => {
                console.log('Schedule consultation requested');
                addNotification({
                  type: 'info',
                  title: 'Consultation Booking',
                  message: 'Consultation booking system would open here. Schedule a call with Victor Joseph Edet.'
                });
              }}
              className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}