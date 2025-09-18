import React, { useState, useEffect } from 'react';
import { Users, Store, Package, AlertTriangle, Star, UserCheck, Tag } from 'lucide-react';
import apiService from '../../services/apiService';
import { useRealTimeStats } from '../../hooks/useRealTimeStats';

interface StatsData {
  totalShops: number;
  pendingShops: number;
  approvedShops: number;
  rejectedShops: number;
  activeShops: number;
  liveShops: number;
  recentRegistrations: number;
  activeUsers?: number;
  totalProducts?: number;
  totalOffers?: number;
}

export const RealStatsCard: React.FC = () => {
  const { stats, setStats, loading, setLoading, error, setError } = useRealTimeStats();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [shopStatsResult, userStatsResult, productStatsResult, offerStatsResult] = await Promise.all([
        apiService.getShopStats(),
        apiService.getUserStats(),
        apiService.getProductStats(),
        apiService.getOfferStats()
      ]);
      
      if (shopStatsResult.success && userStatsResult.success && productStatsResult.success && offerStatsResult.success) {
        setStats({
          ...shopStatsResult.stats,
          activeUsers: userStatsResult.stats.totalUsers,
          totalProducts: productStatsResult.data.totalProducts,
          totalOffers: offerStatsResult.data.totalOffers
        });
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Shops',
      value: stats.totalShops,
      icon: Store,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingShops,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500'
    },
    {
      title: 'Approved Shops',
      value: stats.approvedShops,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500'
    },
    {
      title: 'Active Shops',
      value: stats.activeShops,
      icon: Store,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Live Shops',
      value: stats.liveShops,
      icon: Star,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Recent Registrations',
      value: stats.recentRegistrations,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      iconColor: 'text-indigo-500'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconColor: 'text-orange-500',
      isRealTime: true
    },
    {
      title: 'Total Offers',
      value: stats.totalOffers || 0,
      icon: Tag,
      color: 'rose',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      iconColor: 'text-rose-500',
      isRealTime: true
    },
    {
      title: 'Total Users',
      value: stats.activeUsers || 0,
      icon: Users,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
            {stat.isRealTime && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
