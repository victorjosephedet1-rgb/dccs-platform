import React from 'react';
import { TrendingUp, Users, DollarSign, Music, Download } from 'lucide-react';

interface AnalyticsProps {
  data: {
    totalRevenue: number;
    totalUsers: number;
    totalSnippets: number;
    totalLicenses: number;
    monthlyGrowth: number;
    topGenres: Array<{ name: string; count: number; revenue: number }>;
    recentActivity: Array<{
      id: string;
      type: 'license' | 'upload' | 'signup';
      user: string;
      snippet?: string;
      amount?: number;
      timestamp: string;
    }>;
  };
}

export default function Analytics({ data }: AnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-green-400">+{data.monthlyGrowth}%</span>
            <span className="text-gray-400">this month</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.totalUsers)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Artists & Creators
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Music className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Snippets</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.totalSnippets)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Ready for licensing
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Download className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Licenses</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.totalLicenses)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Issued this month
          </div>
        </div>
      </div>

      {/* Top Genres */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Top Performing Genres</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.topGenres.map((genre, index) => (
              <div key={genre.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{genre.name}</div>
                    <div className="text-sm text-gray-400">{genre.count} snippets</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatCurrency(genre.revenue)}</div>
                  <div className="text-sm text-gray-400">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-white/10">
          {data.recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'license' ? 'bg-green-500/20' :
                    activity.type === 'upload' ? 'bg-blue-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {activity.type === 'license' ? (
                      <Download className="h-4 w-4 text-green-400" />
                    ) : activity.type === 'upload' ? (
                      <Music className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Users className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white text-sm">
                      {activity.type === 'license' && `${activity.user} licensed "${activity.snippet}"`}
                      {activity.type === 'upload' && `${activity.user} uploaded "${activity.snippet}"`}
                      {activity.type === 'signup' && `${activity.user} joined the platform`}
                    </div>
                    <div className="text-xs text-gray-400">{activity.timestamp}</div>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-green-400 font-semibold">
                    {formatCurrency(activity.amount)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}