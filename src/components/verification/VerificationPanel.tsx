import React, { useState, useEffect } from 'react';
import { Shop } from '../../types/admin';
import { CheckCircle, XCircle, Eye, Download, Clock, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';

// Universal Document Viewer Component
const DocumentViewer: React.FC<{ url: string }> = ({ url }) => {
  const [viewerType, setViewerType] = useState<'iframe' | 'image' | 'google' | 'error'>('iframe');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Detect file type from URL
  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    return extension;
  };

  const fileType = getFileType(url);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileType);
  const isPdf = fileType === 'pdf';

  useEffect(() => {
    console.log('DocumentViewer: URL =', url);
    console.log('DocumentViewer: File type =', fileType);
    console.log('DocumentViewer: Is PDF =', isPdf);
    console.log('DocumentViewer: Is Image =', isImage);
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    // Reset states
    setError(null);
    setRetryCount(0);
    
    if (isImage) {
      setViewerType('image');
      setIsLoading(false);
    } else if (isPdf) {
      setViewerType('iframe');
      setIsLoading(true);
      // Set a shorter timeout for iframe loading
      const timeout = setTimeout(() => {
        console.log('Iframe timeout - switching to Google Viewer');
        setViewerType('google');
        setIsLoading(true);
      }, 3000);
      setTimeoutId(timeout);
    } else {
      setViewerType('google');
      setIsLoading(true);
      // Set a timeout for Google Viewer as well
      const timeout = setTimeout(() => {
        console.log('Google Viewer timeout - showing error');
        setViewerType('error');
        setError('Document preview timed out. Please try downloading the file.');
        setIsLoading(false);
      }, 5000);
      setTimeoutId(timeout);
    }
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    };
  }, [url, isImage, isPdf, fileType]);

  const handleIframeError = () => {
    console.log('Iframe failed, trying Google Viewer');
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setViewerType('google');
    } else {
      setViewerType('error');
      setError('Unable to preview this document. Please try downloading it.');
    }
  };

  const handleGoogleViewerError = () => {
    console.log('Google Viewer failed, showing error');
    setViewerType('error');
    setError('Unable to preview this document type');
  };


  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded flex flex-col items-center justify-center p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">Loading document...</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setViewerType('error');
              setIsLoading(false);
              setError('Preview not available. Please use download options below.');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Skip Preview
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            View in New Tab
          </a>
        </div>
      </div>
    );
  }

  if (viewerType === 'image') {
    return (
      <div className="relative h-96 bg-gray-100 rounded overflow-hidden">
        <img
          src={url}
          alt="Document Preview"
          className="w-full h-full object-contain"
          onError={() => {
            setViewerType('error');
            setError('Failed to load image');
          }}
        />
      </div>
    );
  }

  if (viewerType === 'iframe') {
    // For Cloudinary raw URLs, we need to handle them differently
    const isCloudinaryRaw = url.includes('cloudinary.com') && url.includes('/raw/upload/');
    const iframeSrc = isCloudinaryRaw ? url : `${url}#toolbar=1&navpanes=1&scrollbar=1`;
    
    return (
      <div className="relative h-96 bg-gray-100 rounded overflow-hidden">
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          className="border-0"
          title="Document Preview"
          onError={handleIframeError}
          onLoad={() => {
            console.log('Iframe onLoad triggered');
            setIsLoading(false);
          }}
        />
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Loading document...</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewerType('google');
                  setIsLoading(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Google Viewer
              </button>
              <button
                onClick={() => {
                  setViewerType('error');
                  setIsLoading(false);
                  setError('Preview not available. Please use download options.');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Skip Preview
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewerType === 'google') {
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    console.log('Google Viewer URL:', googleViewerUrl);
    return (
      <div className="relative h-96 bg-gray-100 rounded overflow-hidden">
        <iframe
          src={googleViewerUrl}
          width="100%"
          height="100%"
          className="border-0"
          title="Google Document Viewer"
          onError={handleGoogleViewerError}
          onLoad={() => {
            console.log('Google Viewer onLoad triggered');
            setIsLoading(false);
          }}
        />
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Loading with Google Viewer...</p>
            <button
              onClick={handleGoogleViewerError}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Skip to Download
            </button>
          </div>
        )}
        {/* Error fallback */}
        <div 
          className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center"
          style={{ display: 'none' }}
        >
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-gray-600 mb-4">Google Viewer not available</p>
          <div className="flex gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View in New Tab
            </a>
            <a 
              href={url} 
              download
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="h-96 bg-gray-100 rounded flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-600 mb-4">{error || 'Unable to preview this document'}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Eye className="h-4 w-4 mr-2" />
          View in New Tab
        </a>
        <a 
          href={url} 
          download
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </a>
      </div>
    </div>
  );
};

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
          licenseDocument: shop.licenseDocument,
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-gray-800">Shop Details - {selectedShop.name}</h4>
                <button
                  onClick={() => {
                    setSelectedShop(null);
                    setVerificationNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            
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

            {selectedShop.licenseDocument && selectedShop.licenseDocument.url && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Business License</label>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 block">License Document</span>
                        {selectedShop.licenseDocument.mimeType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedShop.licenseDocument.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Click to view/download</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={selectedShop.licenseDocument.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download (Cloudinary)
                      </a>
                      {selectedShop.licenseDocument.localPath && (
                        <a 
                          href={`/api/upload/local/${selectedShop.licenseDocument.localPath.split('/')[1]}/${selectedShop.licenseDocument.localFilename}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-orange-600 hover:text-orange-700 px-3 py-2 rounded border border-orange-200 hover:bg-orange-50 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download (Local)
                        </a>
                      )}
                      <button
                        onClick={() => selectedShop.licenseDocument && window.open(selectedShop.licenseDocument.url, '_blank')}
                        className="flex items-center text-green-600 hover:text-green-700 px-3 py-2 rounded border border-green-200 hover:bg-green-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View in New Tab
                      </button>
                      <button
                        onClick={() => {
                          if (selectedShop.licenseDocument && selectedShop.licenseDocument.url) {
                            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedShop.licenseDocument.url)}&embedded=true`;
                            window.open(googleViewerUrl, '_blank');
                          }
                        }}
                        className="flex items-center text-purple-600 hover:text-purple-700 px-3 py-2 rounded border border-purple-200 hover:bg-purple-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Google Viewer
                      </button>
                    </div>
                  </div>
                  
                  {/* Universal Document Preview */}
                  <div className="mt-4">
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">Document Preview:</p>
                      <DocumentViewer url={selectedShop.licenseDocument.url} />
                    </div>
                  </div>
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

            </div>
            
            {/* Fixed Footer with Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 rounded-b-xl">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setSelectedShop(null);
                    setVerificationNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedShop.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerification(selectedShop.id, 'rejected')}
                      disabled={verifying === selectedShop.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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
        </div>
      )}
    </div>
  );
};