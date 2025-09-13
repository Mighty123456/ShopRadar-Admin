import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Store, Package, Star, RefreshCw, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { ActiveUsers } from '../users/ActiveUsers';

const chartData = [
  { month: 'Jan', users: 1200, shops: 85 },
  { month: 'Feb', users: 1350, shops: 87 },
  { month: 'Mar', users: 1247, shops: 89 }
];

const categoryData = [
  { name: 'Electronics', count: 0, percentage: 0 },
  { name: 'Clothing', count: 0, percentage: 0 },
  { name: 'Food', count: 0, percentage: 0 },
  { name: 'Books', count: 0, percentage: 0 },
  { name: 'Others', count: 0, percentage: 0 }
];

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    pendingVerifications: 0,
    activeShops: 0,
    totalShoppers: 0,
    totalShopkeepers: 0,
    verifiedUsers: 0,
    newUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [shopStatsResult, userStatsResult] = await Promise.all([
        apiService.getShopStats(),
        apiService.getUserStats()
      ]);
      
      if (shopStatsResult.success && userStatsResult.success) {
        setStats({
          totalUsers: userStatsResult.stats.totalUsers,
          totalShops: shopStatsResult.stats.totalShops,
          pendingVerifications: shopStatsResult.stats.pendingVerifications,
          activeShops: shopStatsResult.stats.activeShops,
          totalShoppers: userStatsResult.stats.totalShoppers,
          totalShopkeepers: userStatsResult.stats.totalShopkeepers,
          verifiedUsers: userStatsResult.stats.verifiedUsers,
          newUsers: userStatsResult.stats.newUsers
        });
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? <RefreshCw className="h-8 w-8 animate-spin" /> : stats.totalUsers}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats.newUsers} new this month
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shops</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? <RefreshCw className="h-8 w-8 animate-spin" /> : stats.totalShops}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats.activeShops} active
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? <RefreshCw className="h-8 w-8 animate-spin" /> : stats.pendingVerifications}
              </p>
              <div className="flex items-center mt-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Awaiting review
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? <RefreshCw className="h-8 w-8 animate-spin" /> : stats.verifiedUsers}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                {Math.round((stats.verifiedUsers / stats.totalUsers) * 100) || 0}% verified
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={loadStats}
            className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Growth Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-4">
            {chartData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="flex space-x-2 mb-2">
                  <div 
                    className="w-6 bg-blue-500 rounded-t"
                    style={{ height: `${(data.users / 1500) * 200}px` }}
                  ></div>
                  <div 
                    className="w-6 bg-green-500 rounded-t"
                    style={{ height: `${(data.shops / 100) * 200}px` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Users</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Shops</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Popular Categories</h3>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800">{category.name}</span>
                      <span className="text-sm text-gray-600">{category.count}</span>
                    </div>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 min-w-[40px]">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">1.2s</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">856</div>
            <div className="text-sm text-gray-600">Daily API Calls</div>
          </div>
        </div>
      </div>

      {/* Active Users Section */}
      <ActiveUsers />
    </div>
  );
};