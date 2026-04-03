import React, { useState, useEffect } from 'react';
import { Globe, MapPin, DollarSign, TrendingUp, Eye, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface RoyaltyData {
  country: string;
  region: string;
  platform: string;
  plays: number;
  revenue: number;
  growth: number;
  lastUpdated: string;
  status: 'collecting' | 'pending' | 'blocked';
}

interface GlobalRoyaltyTrackingProps {
  artistId: string;
}

export default function GlobalRoyaltyTracking({ artistId }: GlobalRoyaltyTrackingProps) {
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadGlobalRoyaltyData();
  }, [artistId, timeRange]);

  const loadGlobalRoyaltyData = async () => {
    setLoading(true);
    
    // Simulate global royalty data
    setTimeout(() => {
      const mockData: RoyaltyData[] = [
        {
          country: 'United States',
          region: 'North America',
          platform: 'TikTok',
          plays: 1247000,
          revenue: 2847.50,
          growth: 23.5,
          lastUpdated: '2 hours ago',
          status: 'collecting'
        },
        {
          country: 'United Kingdom',
          region: 'Europe',
          platform: 'Instagram',
          plays: 892000,
          revenue: 1923.40,
          growth: 18.2,
          lastUpdated: '1 hour ago',
          status: 'collecting'
        },
        {
          country: 'Germany',
          region: 'Europe',
          platform: 'YouTube Shorts',
          plays: 654000,
          revenue: 1456.80,
          growth: 31.7,
          lastUpdated: '3 hours ago',
          status: 'collecting'
        },
        {
          country: 'Brazil',
          region: 'South America',
          platform: 'TikTok',
          plays: 543000,
          revenue: 987.60,
          growth: 45.3,
          lastUpdated: '1 hour ago',
          status: 'collecting'
        },
        {
          country: 'Japan',
          region: 'Asia',
          platform: 'Instagram',
          plays: 432000,
          revenue: 1234.20,
          growth: 12.8,
          lastUpdated: '4 hours ago',
          status: 'collecting'
        },
        {
          country: 'Australia',
          region: 'Oceania',
          platform: 'YouTube Shorts',
          plays: 321000,
          revenue: 876.30,
          growth: 28.4,
          lastUpdated: '2 hours ago',
          status: 'collecting'
        },
        {
          country: 'France',
          region: 'Europe',
          platform: 'TikTok',
          plays: 298000,
          revenue: 654.70,
          growth: 15.6,
          lastUpdated: '5 hours ago',
          status: 'pending'
        },
        {
          country: 'Canada',
          region: 'North America',
          platform: 'Instagram',
          plays: 267000,
          revenue: 723.90,
          growth: 22.1,
          lastUpdated: '1 hour ago',
          status: 'collecting'
        }
      ];
      
      setRoyaltyData(mockData);
      setLoading(false);
    }, 1500);
  };

  const filteredData = selectedRegion === 'all' 
    ? royaltyData 
    : royaltyData.filter(item => item.region === selectedRegion);

  const totalRevenue = royaltyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPlays = royaltyData.reduce((sum, item) => sum + item.plays, 0);
  const avgGrowth = royaltyData.reduce((sum, item) => sum + item.growth, 0) / royaltyData.length;

  const regions = [...new Set(royaltyData.map(item => item.region))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'blocked': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
        <div className="text-center">
          <Globe className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">Scanning Global Markets</h3>
          <p className="text-gray-400">Collecting royalty data from 195+ countries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Global DCCS Royalty Tracking</h2>
              <p className="text-gray-400">Sound Engineers get 80% • Lifetime tracking • 195+ countries</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-6 w-6 text-green-400" />
              <span className="text-sm text-gray-400">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-green-400">+{avgGrowth.toFixed(1)}% growth</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="h-6 w-6 text-blue-400" />
              <span className="text-sm text-gray-400">Total Plays</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</div>
            <div className="text-sm text-blue-400">Across all platforms</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-6 w-6 text-purple-400" />
              <span className="text-sm text-gray-400">Active Markets</span>
            </div>
            <div className="text-2xl font-bold text-white">{royaltyData.length}</div>
            <div className="text-sm text-purple-400">Countries collecting</div>
          </div>
        </div>
      </div>

      {/* Region Filter */}
      <div className="p-6 border-b border-white/10">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
              selectedRegion === 'all'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Regions ({royaltyData.length})
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {region} ({royaltyData.filter(item => item.region === region).length})
            </button>
          ))}
        </div>
      </div>

      {/* Royalty Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Country</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Platform</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Plays</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Revenue</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Growth</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-sm"></div>
                    <div>
                      <div className="text-white font-medium">{item.country}</div>
                      <div className="text-sm text-gray-400">{item.region}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-300">{item.platform}</td>
                <td className="py-4 px-6 text-white">{item.plays.toLocaleString()}</td>
                <td className="py-4 px-6 text-green-400 font-semibold">${item.revenue.toFixed(2)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">+{item.growth}%</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 w-fit ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-400 text-sm">{item.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            DCCS Tracking • 80% Sound Engineer / 20% Platform • Lifetime Contract • Updated Hourly • 195+ Countries
          </div>
          <button 
            onClick={() => {
              console.log('Exporting global royalty report for artist:', artistId);
              addNotification({
                type: 'success',
                title: 'Report Exported',
                message: 'Global royalty report has been generated and downloaded'
              });
              // Simulate file download
              const link = document.createElement('a');
              link.href = '#';
              link.download = `Global_Royalty_Report_${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white hover:from-green-600 hover:to-blue-600 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}