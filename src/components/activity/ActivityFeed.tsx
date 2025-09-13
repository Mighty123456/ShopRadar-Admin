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
  Search,
  Download,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle
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

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadActivities = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const filters: any = {
        severity: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined
      };

      // Add date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        filters.dateFrom = startDate.toISOString();
      }
      
      const result = await apiService.getRecentActivities(page, 50, filters);
      
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

  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range);
    setCurrentPage(1);
    setHasMore(true);
    loadActivities(1, false);
  };

  const exportActivities = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Description', 'Severity', 'Status', 'User', 'Shop'],
      ...activities.map(activity => [
        new Date(activity.createdAt).toLocaleString(),
        activity.type,
        activity.description,
        activity.severity,
        activity.status,
        activity.user?.name || '',
        activity.shop?.name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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
          setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep only 50 most recent
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

  // Calculate stats
  const stats = {
    total: filteredActivities.length,
    critical: filteredActivities.filter(a => a.severity === 'critical').length,
    high: filteredActivities.filter(a => a.severity === 'high').length,
    medium: filteredActivities.filter(a => a.severity === 'medium').length,
    low: filteredActivities.filter(a => a.severity === 'low').length
  };

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Activity Feed</h1>
              <p className="text-gray-600">Real-time system activity monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportActivities}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-800">{stats.critical}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-600">High</p>
                <p className="text-2xl font-bold text-orange-800">{stats.high}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-600">Medium</p>
                <p className="text-2xl font-bold text-blue-800">{stats.medium}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-600">Low</p>
                <p className="text-2xl font-bold text-green-800">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value as typeof filter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as typeof dateRange)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between text-sm text-gray-500">
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
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div 
          ref={scrollContainerRef}
          className="max-h-96 overflow-y-auto"
        >
          <div className="p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filter !== 'all' || dateRange !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No activities have been recorded yet'
                  }
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh
                </button>
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
                      className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 ${
                        activity.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        activity.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        activity.severity === 'medium' ? 'border-blue-500 bg-blue-50' :
                        'border-gray-300'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 break-words mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.timeAgo}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${severityBadge.bg} ${severityBadge.text}`}>
                            {severityBadge.label}
                          </span>
                          {activity.user && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {activity.user.name}
                            </span>
                          )}
                          {activity.shop && (
                            <span className="flex items-center">
                              <Store className="h-3 w-3 mr-1" />
                              {activity.shop.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Load More Indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}
                
                {!hasMore && filteredActivities.length > 0 && (
                  <div className="text-center py-8 text-sm text-gray-500">
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
            <button
              onClick={scrollToTop}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            >
              ↑ Scroll to Top
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Showing {filteredActivities.length} activities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
