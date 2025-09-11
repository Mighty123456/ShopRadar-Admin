import React, { useState, useEffect } from 'react';
import { Bell, Search, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchResult {
  type: 'user' | 'shop' | 'product' | 'review' | 'notification';
  id: string;
  title: string;
  subtitle: string;
  status?: string;
}

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Global search functionality
  const performGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const [usersResult, shopsResult, productsResult, reviewsResult, notificationsResult] = await Promise.all([
        apiService.getAllUsers(1, 5, 'all', 'all', query),
        apiService.getAllShops('all', 1, 5),
        apiService.getAllProducts(1, 5, { search: query }),
        apiService.getAllReviews(1, 5, { search: query }),
        apiService.getAllNotifications(1, 5, { search: query })
      ]);

      const results: SearchResult[] = [];

      // Process users
      if (usersResult.success) {
        usersResult.data.users.forEach((user: any) => {
          results.push({
            type: 'user',
            id: user.id,
            title: user.name,
            subtitle: user.email,
            status: user.status
          });
        });
      }

      // Process shops
      if (shopsResult.success) {
        shopsResult.data.shops.forEach((shop: any) => {
          results.push({
            type: 'shop',
            id: shop.id,
            title: shop.name,
            subtitle: shop.address,
            status: shop.status
          });
        });
      }

      // Process products
      if (productsResult.success) {
        productsResult.data.products.forEach((product: any) => {
          results.push({
            type: 'product',
            id: product.id,
            title: product.name,
            subtitle: `${product.shop} - ${product.category}`,
            status: product.status
          });
        });
      }

      // Process reviews
      if (reviewsResult.success) {
        reviewsResult.data.reviews.forEach((review: any) => {
          results.push({
            type: 'review',
            id: review.id,
            title: `${review.user} - ${review.shop}`,
            subtitle: review.comment.substring(0, 50) + '...',
            status: review.status
          });
        });
      }

      // Process notifications
      if (notificationsResult.success) {
        notificationsResult.data.notifications.forEach((notification: any) => {
          results.push({
            type: 'notification',
            id: notification.id,
            title: notification.title,
            subtitle: notification.message.substring(0, 50) + '...',
            status: notification.status
          });
        });
      }

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Global search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const result = await apiService.getAllNotifications(1, 10, { status: 'sent' });
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      performGlobalSearch(debouncedSearch);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container') && !target.closest('.notification-container')) {
        setShowSearchResults(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchResultClick = (result: SearchResult) => {
    // Navigate to the appropriate section based on result type
    // This would typically use a router or state management
    console.log('Navigate to:', result.type, result.id);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative search-container">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, shops, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Search Results</span>
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            result.type === 'user' ? 'bg-blue-500' :
                            result.type === 'shop' ? 'bg-green-500' :
                            result.type === 'product' ? 'bg-purple-500' :
                            result.type === 'review' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{result.title}</p>
                            <p className="text-xs text-gray-500">{result.subtitle}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {result.type}
                              </span>
                              {result.status && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  result.status === 'active' ? 'bg-green-100 text-green-600' :
                                  result.status === 'blocked' ? 'bg-red-100 text-red-600' :
                                  result.status === 'flagged' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {result.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          <div className="relative notification-container">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 last:border-b-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.createdDate}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};