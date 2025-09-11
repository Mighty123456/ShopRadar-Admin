import React, { useState, useEffect } from 'react';
import { Notification } from '../../types/admin';
import { Send, Eye, Edit, Plus, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  
  const debouncedSearch = useDebounce(filters.search, 500);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'global' as 'global' | 'shopkeeper' | 'shopper'
  });

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAllNotifications(currentPage, 10, {
        ...filters,
        search: debouncedSearch
      });
      
      if (result.success) {
        setNotifications(result.data.notifications);
        setTotalPages(result.data.pagination.totalPages);
        setTotalNotifications(result.data.pagination.totalNotifications);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filters.type, filters.status, debouncedSearch]);

  const handleSendNotification = async (notificationId: string) => {
    try {
      const result = await apiService.sendNotification(notificationId);
      
      if (result.success) {
        await loadNotifications(); // Reload notifications to get updated data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send notification');
      console.error('Error sending notification:', err);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const result = await apiService.createNotification(newNotification);
      
      if (result.success) {
    setNewNotification({ title: '', message: '', type: 'global' });
    setShowCreateModal(false);
        await loadNotifications(); // Reload notifications to get updated data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create notification');
      console.error('Error creating notification:', err);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">Notification Management</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total: {totalNotifications}</span>
              <button
                onClick={loadNotifications}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Refresh notifications"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="mb-4 flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search notifications by title or message..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="global">Global</option>
            <option value="shopkeeper">Shopkeeper</option>
            <option value="shopper">Shopper</option>
          </select>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Notification
              </button>
            </div>
          ) : (
            <>
          {notifications.map((notification) => (
            <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">{notification.title}</h4>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Target: {notification.type}</span>
                    <span>Created: {notification.createdDate}</span>
                    {notification.sentDate && <span>Sent: {notification.sentDate}</span>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notification.status === 'sent' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button className="p-2 text-blue-600 hover:text-blue-700">
                  <Eye className="h-4 w-4" />
                </button>
                {notification.status === 'draft' && (
                  <>
                    <button className="p-2 text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSendNotification(notification.id)}
                      className="p-2 text-green-600 hover:text-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Create New Notification</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="global">All Users</option>
                  <option value="shopkeeper">Shopkeepers Only</option>
                  <option value="shopper">Shoppers Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};