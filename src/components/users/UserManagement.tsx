import React, { useState, useEffect } from 'react';
import { User } from '../../types/admin';
import { Ban, CheckCircle, Eye, Mail, RefreshCw, AlertCircle, Trash2, X } from 'lucide-react';
import apiService from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'shopper' | 'shopkeeper'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAllUsers(currentPage, 10, filterType, filterStatus, debouncedSearch);
      
      if (result.success) {
        setUsers(result.data.users);
        setTotalPages(result.data.pagination.totalPages);
        setTotalUsers(result.data.pagination.totalUsers);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterType, filterStatus, debouncedSearch]);

  const handleUserAction = async (userId: string, action: 'block' | 'unblock') => {
    try {
      const status = action === 'block' ? 'blocked' : 'active';
      const result = await apiService.updateUserStatus(userId, status);
      
      if (result.success) {
        // Reload users to get updated data
        await loadUsers();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update user status');
      console.error('Error updating user status:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const isShopkeeper = user?.type === 'shopkeeper';
    
    const warningMessage = isShopkeeper 
      ? `⚠️ WARNING: You are about to permanently delete a shopkeeper and ALL their related data:\n\n• User account\n• Shop profile\n• All products\n• All offers\n• All reviews\n• All activities\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to continue?`
      : `⚠️ WARNING: You are about to permanently delete this user and ALL their related data:\n\n• User account\n• All reviews written by this user\n• All activities\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to continue?`;

    if (!window.confirm(warningMessage)) {
      return;
    }

    try {
      const result = await apiService.deleteUser(userId);
      
      if (result.success) {
        // Show success message with details of what was deleted
        const deletedItems = result.deletedItems;
        let successMessage = 'User deleted successfully!';
        
        if (deletedItems) {
          const details = [];
          if (deletedItems.shop) details.push('Shop');
          if (deletedItems.products > 0) details.push(`${deletedItems.products} products`);
          if (deletedItems.offers > 0) details.push(`${deletedItems.offers} offers`);
          if (deletedItems.reviews > 0) details.push(`${deletedItems.reviews} reviews`);
          if (deletedItems.activities > 0) details.push(`${deletedItems.activities} activities`);
          
          if (details.length > 0) {
            successMessage += `\n\nAlso deleted: ${details.join(', ')}`;
          }
        }
        
        alert(successMessage);
        
        // Reload users to get updated data
        await loadUsers();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const result = await apiService.getUserById(userId);
      
      if (result.success) {
        setSelectedUser(result.user);
        setShowUserModal(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load user details');
      console.error('Error loading user details:', err);
    }
  };

  const handleSendEmail = (user: User) => {
    setSelectedUser(user);
    setEmailSubject('');
    setEmailMessage('');
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async () => {
    if (!selectedUser || !emailSubject.trim() || !emailMessage.trim()) {
      setError('Please fill in both subject and message');
      return;
    }

    try {
      // For now, we'll just show a success message
      // In a real implementation, you would call an API to send the email
      alert(`Email sent to ${selectedUser.email}!\n\nSubject: ${emailSubject}\nMessage: ${emailMessage}`);
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to send email');
      console.error('Error sending email:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">
              Total Users: {totalUsers} | Page {currentPage} of {totalPages}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
            />
            
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="shopper">Shoppers</option>
              <option value="shopkeeper">Shopkeepers</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.type === 'shopkeeper' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.joinedDate}</td>
                      <td className="py-3 px-4 text-gray-600">{user.lastActive}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user.id)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleSendEmail(user)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'block')}
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Block User"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'unblock')}
                              className="p-1 text-green-600 hover:text-green-700"
                              title="Unblock User"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-800">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.type === 'shopkeeper' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-gray-800">{selectedUser.joinedDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Active</label>
                  <p className="text-gray-800">{selectedUser.lastActive}</p>
                </div>
              </div>
              
              {selectedUser.shopInfo && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Shop Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Shop Name</label>
                      <p className="text-gray-800">{selectedUser.shopInfo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">License Number</label>
                      <p className="text-gray-800">{selectedUser.shopInfo.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Verification Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.shopInfo.verificationStatus === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : selectedUser.shopInfo.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.shopInfo.verificationStatus.charAt(0).toUpperCase() + selectedUser.shopInfo.verificationStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Shop Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.shopInfo.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.shopInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Send Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">To</label>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSubmit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};