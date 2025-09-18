import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';

interface StatsData {
  totalShops: number;
  pendingVerifications: number;
  activeShops: number;
  liveShops: number;
  recentRegistrations: number;
  activeUsers?: number;
  totalProducts?: number;
  totalOffers?: number;
  totalUsers?: number;
}

export const useRealTimeStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateStats = useCallback((statsType: string, data: any) => {
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      
      switch (statsType) {
        case 'product_count':
          return { ...prevStats, totalProducts: data.totalProducts };
        case 'offer_count':
          return { ...prevStats, totalOffers: data.totalOffers };
        case 'shop_count':
          return { ...prevStats, totalShops: data.totalShops };
        case 'user_count':
          return { ...prevStats, totalUsers: data.totalUsers };
        default:
          return prevStats;
      }
    });
  }, []);

  useEffect(() => {
    // Subscribe to stats updates
    const unsubscribe = websocketService.subscribeToStatsUpdates((data) => {
      console.log('Real-time stats update received:', data);
      updateStats(data.type, data.data);
    });

    return () => {
      unsubscribe();
    };
  }, [updateStats]);

  return {
    stats,
    setStats,
    loading,
    setLoading,
    error,
    setError,
    updateStats
  };
};
