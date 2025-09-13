import React, { useState, useEffect } from 'react';
import { Shop } from '../../types/admin';
import { CheckCircle, XCircle, Eye, Download, Clock, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';

export const VerificationPanel: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load shops from API
  const loadShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getAllShops();
      
      if (result.success) {
        // Transform backend data to match frontend interface
        const transformedShops = result.data.shops.map((shop: any) => ({
          id: shop._id,
          name: shop.shopName,
          owner: shop.ownerId?.fullName || 'Unknown',
          category: 'General', // You might want to add category to your shop model
          address: shop.address,
          location: shop.gpsAddress || shop.address,
          status: shop.verificationStatus,
          verificationStatus: shop.verificationStatus,
          registrationDate: new Date(shop.createdAt).toLocaleDateString(),
          licenseDocument: shop.licenseDocument?.url,
          licenseNumber: shop.licenseNumber,
          phone: shop.phone,
          state: shop.state,
          coordinates: shop.location?.coordinates ? {
            latitude: shop.location.coordinates[1], // GeoJSON format: [lng, lat]
            longitude: shop.location.coordinates[0]
          } : undefined,
          gpsAddress: shop.gpsAddress,
          isLocationVerified: shop.isLocationVerified,
          verificationNotes: shop.verificationNotes,
          verifiedAt: shop.verifiedAt,
          verifiedBy: shop.verifiedBy?.fullName
        }));
        
        setShops(transformedShops);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
      setError('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleVerification = async (shopId: string, status: 'approved' | 'rejected') => {
    try {
      setVerifying(shopId);
      setError(null);
      setSuccessMessage(null);
      
      const result = await apiService.verifyShop(shopId, status, verificationNotes);
      
      if (result.success) {
        // Show success message
        setSuccessMessage(`Shop ${status} successfully! Email notification sent to shop owner.`);
        
        // Update local state
        setShops(shops.map(shop => 
          shop.id === shopId 
            ? { ...shop, verificationStatus: status, status }
            : shop
        ));
        setSelectedShop(null);
        setVerificationNotes('');
        
        // Reload shops to get updated data
        await loadShops();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify shop');
    } finally {
      setVerifying(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Shopkeeper Verification</h3>
          <button
            onClick={loadShops}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading shops...</span>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No shops found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Shop Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">License Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Registration Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                <tr key={shop.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{shop.name}</td>
                  <td className="py-3 px-4 text-gray-600">{shop.owner}</td>
                  <td className="py-3 px-4 text-gray-600">{shop.licenseNumber}</td>
                  <td className="py-3 px-4 text-gray-600">{shop.registrationDate}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.verificationStatus === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : shop.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shop.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {shop.verificationStatus.charAt(0).toUpperCase() + shop.verificationStatus.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedShop(shop)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {shop.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerification(shop.id, 'approved')}
                            disabled={verifying === shop.id}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Shop"
                          >
                            {verifying === shop.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleVerification(shop.id, 'rejected')}
                            disabled={verifying === shop.id}
                            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject Shop"
                          >
                            {verifying === shop.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Shop Details - {selectedShop.name}</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <p className="text-gray-600">{selectedShop.owner}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-600">{selectedShop.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                <p className="text-gray-600">{selectedShop.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <p className="text-gray-600">{selectedShop.registrationDate}</p>
              </div>
            </div>

            {/* Location Verification Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location Verification
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Address</label>
                  <p className="text-gray-600 text-sm">{selectedShop.gpsAddress || 'Not available'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Status</label>
                  <div className="flex items-center">
                    {selectedShop.isLocationVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {selectedShop.coordinates && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                  <p className="text-gray-600 text-sm">
                    Lat: {selectedShop.coordinates.latitude}, Lng: {selectedShop.coordinates.longitude}
                  </p>
                </div>
              )}
            </div>

            {selectedShop.licenseDocument && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business License</label>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 block">License Document</span>
                    <span className="text-xs text-gray-500">Click to view/download</span>
                  </div>
                  <a 
                    href={selectedShop.licenseDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    View/Download
                  </a>
                </div>
              </div>
            )}

            {/* Verification Notes */}
            {selectedShop.verificationStatus === 'pending' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about the verification decision..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedShop(null);
                  setVerificationNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedShop.verificationStatus === 'pending' && (
                <>
                  <button
                    onClick={() => handleVerification(selectedShop.id, 'rejected')}
                    disabled={verifying === selectedShop.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {verifying === selectedShop.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleVerification(selectedShop.id, 'approved')}
                    disabled={verifying === selectedShop.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {verifying === selectedShop.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};