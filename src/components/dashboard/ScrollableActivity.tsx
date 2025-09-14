import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  UserPlus, 
  Store, 
  AlertTriangle, 
  UserMinus, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Activity,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';
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
    shopName?: string;
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

const getSeverityBadge = (severity: string) => {
  const badgeMap: { [key: string]: { bg: string; text: string; label: string } } = {
    'low': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
    'medium': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
    'high': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
    'critical': { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' }
  };
  return badgeMap[severity] || badgeMap['medium'];
};

export const ScrollableActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadActivities = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const result = await apiService.getRecentActivities(page, 20, {
        severity: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined
      });
      
      if (result.success) {
        if (append) {
          setActivities(prev => [...prev, ...result.data.activities]);
        } else {
          setActivities(result.data.activities);
        }
        setHasMore(result.data.pagination.hasNext);
        setLastRefresh(new Date());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadActivities(nextPage, true);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadActivities(1, false);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setHasMore(true);
    loadActivities(1, false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setHasMore(true);
    loadActivities(1, false);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ 
        top: scrollContainerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
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
          setActivities(prev => [activity, ...prev.slice(0, 19)]); // Keep only 20 most recent
          setLastRefresh(new Date());
        }
      });
      
      return () => {
        unsubscribe();
        clearInterval(connectionInterval);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        
        if (isNearBottom && hasMore && !loadingMore) {
          loadMore();
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loadingMore]);

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.severity !== filter) return false;
    if (searchTerm && !activity.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Activity Feed</h3>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh activities"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as typeof filter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Updated {lastRefresh.toLocaleTimeString()}</span>
            {isWebSocketConnected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600">Live</span>
              </div>
            )}
          </div>
          <span>{filteredActivities.length} activities</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className={`overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'max-h-96' : 'max-h-64'
        }`}
      >
        <div className="p-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">No activities found</p>
              {searchTerm && (
                <p className="text-gray-500 text-xs mt-1">
                  Try adjusting your search or filter criteria
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                const color = getActivityColor(activity.severity, activity.status);
                const severityBadge = getSeverityBadge(activity.severity);
                
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 ${color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 break-words">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${severityBadge.bg} ${severityBadge.text}`}>
                          {severityBadge.label}
                        </span>
                        {activity.user && (
                          <span className="text-xs text-gray-500">
                            User: {activity.user.name}
                          </span>
                        )}
                        {activity.shop && (
                          <span className="text-xs text-gray-500">
                            Shop: {activity.shop.shopName || activity.shop.name || 'Unknown Shop'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Load More Indicator */}
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              )}
              
              {!hasMore && filteredActivities.length > 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No more activities to load
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={scrollToTop}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            >
              ↑ Top
            </button>
            <button
              onClick={scrollToBottom}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            >
              ↓ Bottom
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
