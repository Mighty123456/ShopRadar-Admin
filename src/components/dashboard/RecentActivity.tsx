import React, { useState, useEffect } from 'react';
import { Clock, UserPlus, Store, AlertTriangle, UserMinus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';

interface Activity {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'warning' | 'error';
  createdAt: string;
  timeAgo: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  shop?: {
    id: string;
    name: string;
    licenseNumber: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

const getActivityIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    'user_registered': UserPlus,
    'user_login': UserPlus,
    'user_logout': UserMinus,
    'user_blocked': UserMinus,
    'user_unblocked': UserPlus,
    'user_deleted': UserMinus,
    'shop_registered': Store,
    'shop_verified': CheckCircle,
    'shop_rejected': XCircle,
    'shop_activated': CheckCircle,
    'shop_deactivated': XCircle,
    'product_added': Store,
    'product_removed': Store,
    'review_posted': AlertTriangle,
    'review_flagged': AlertTriangle,
    'review_removed': AlertTriangle,
    'admin_login': UserPlus,
    'admin_action': AlertTriangle
  };
  return iconMap[type] || AlertTriangle;
};

const getActivityColor = (severity: string, status: string) => {
  if (status === 'error') return 'text-red-500';
  if (status === 'warning') return 'text-yellow-500';
  
  const colorMap: { [key: string]: string } = {
    'low': 'text-gray-500',
    'medium': 'text-blue-500',
    'high': 'text-orange-500',
    'critical': 'text-red-500'
  };
  return colorMap[severity] || 'text-blue-500';
};

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getRecentActivities(1, 10);
      
      if (result.success) {
        setActivities(result.data.activities);
        setLastRefresh(new Date());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    
    // Connect to WebSocket for real-time updates
    const token = localStorage.getItem('adminToken');
    if (token) {
      websocketService.connect(token);
      
      // Check WebSocket connection status
      const checkConnection = () => {
        const status = websocketService.getConnectionStatus();
        setIsWebSocketConnected(status.connected);
      };
      
      // Initial check
      checkConnection();
      
      // Check periodically
      const connectionInterval = setInterval(checkConnection, 5000);
      
      // Subscribe to real-time activity updates
      const unsubscribe = websocketService.subscribeToActivities((activity, type) => {
        if (type === 'new_activity') {
          setActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep only 10 most recent
          setLastRefresh(new Date());
        }
      });
      
      return () => {
        unsubscribe();
        clearInterval(connectionInterval);
      };
    }
  }, []);

  const handleRefresh = () => {
    loadActivities();
  };

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Refresh activities"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated {lastRefresh.toLocaleTimeString()}</span>
          {isWebSocketConnected && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600">Live</span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            const color = getActivityColor(activity.severity, activity.status);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 break-words">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    {activity.severity === 'critical' && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                        Critical
                      </span>
                    )}
                    {activity.severity === 'high' && (
                      <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                        High
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <button 
        onClick={handleRefresh}
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Refresh Activities</span>
      </button>
    </div>
  );
};