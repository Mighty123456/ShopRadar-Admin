import React, { useState, useEffect } from 'react';
import { Product, Offer } from '../../types/admin';
import { AlertTriangle, Eye, Trash2, CheckCircle, RefreshCw, Tag, Package } from 'lucide-react';
import apiService from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';

export const ProductMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'offers'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOffers, setTotalOffers] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Product | Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAllProducts(currentPage, 10, {
        ...filters,
        search: debouncedSearch
      });
      
      if (result.success) {
        setProducts(result.data.products);
        setTotalPages(result.data.pagination.totalPages);
        setTotalProducts(result.data.pagination.totalProducts);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      console.log('Loading offers...');
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAllOffers(currentPage, 10, {
        ...filters,
        search: debouncedSearch
      });
      
      console.log('Offers result:', result);
      
      if (result.success) {
        console.log('Offers data:', result.data);
        setOffers(result.data.offers);
        setTotalPages(result.data.pagination.totalPages);
        setTotalOffers(result.data.pagination.totalOffers);
        console.log('Set offers:', result.data.offers);
      } else {
        console.error('Failed to load offers:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Error loading offers:', err);
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, activeTab:', activeTab);
    if (activeTab === 'products') {
      console.log('Loading products...');
      loadProducts();
    } else {
      console.log('Loading offers...');
      loadOffers();
    }
  }, [currentPage, filters.category, filters.status, debouncedSearch, activeTab]);

  const handleProductAction = async (productId: string, action: 'remove' | 'restore') => {
    try {
      const status = action === 'remove' ? 'removed' : 'active';
      const result = await apiService.updateProductStatus(productId, status);
      
      if (result.success) {
        await loadProducts(); // Reload products to get updated data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update product status');
      console.error('Error updating product status:', err);
    }
  };

  const handleOfferAction = async (offerId: string, status: string, notes?: string) => {
    try {
      const result = await apiService.updateOfferStatus(offerId, status, notes);
      
      if (result.success) {
        await loadOffers(); // Reload offers to get updated data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update offer status');
      console.error('Error updating offer status:', err);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handleViewDetails = async (itemId: string, type: 'product' | 'offer') => {
    try {
      setLoading(true);
      let result;
      
      if (type === 'product') {
        result = await apiService.getProductById(itemId);
      } else {
        result = await apiService.getOfferById(itemId);
      }
      
      if (result.success) {
        console.log('API Response:', result);
        console.log('Item Data:', result.data);
        console.log('Type:', type);
        setSelectedItem(result.data);
        setShowDetailsModal(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Failed to load ${type} details`);
      console.error(`Error loading ${type} details:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Product & Offer Monitoring</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Total: {activeTab === 'products' ? totalProducts : totalOffers}
            </span>
            <button
              onClick={activeTab === 'products' ? loadProducts : loadOffers}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title={`Refresh ${activeTab}`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab('products');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Products</span>
          </button>
          <button
            onClick={() => {
              console.log('Offers tab clicked');
              setActiveTab('offers');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'offers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Offers</span>
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
              placeholder={`Search ${activeTab}...`}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          {activeTab === 'products' && (
            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Food">Food</option>
              <option value="Others">Others</option>
            </select>
          )}
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            {activeTab === 'products' ? (
              <>
                <option value="active">Active</option>
                <option value="removed">Removed</option>
                <option value="flagged">Flagged</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </>
            )}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading {activeTab}...</span>
            </div>
          ) : (activeTab === 'products' ? products.length === 0 : offers.length === 0) ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} found</p>
            </div>
          ) : (
            <>
              {activeTab === 'products' ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Shop</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Reports</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {typeof product.shop === 'string' ? product.shop : product.shop?.shopName || product.shop?.name || 'Unknown Shop'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.category}</td>
                        <td className="py-3 px-4 text-gray-600">₹{product.price}</td>
                        <td className="py-3 px-4">
                          {product.reportCount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {product.reportCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'flagged'
                              ? 'bg-yellow-100 text-yellow-800'
                              : product.status === 'removed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(product.id, 'product')}
                              className="p-1 text-blue-600 hover:text-blue-700" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {product.status === 'active' ? (
                              <button
                                onClick={() => handleProductAction(product.id, 'remove')}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="Remove Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleProductAction(product.id, 'restore')}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="Restore Product"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Offer Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Shop</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Discount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Usage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => {
                      // Safely extract product and shop names
                      const productName = offer.productId?.name || 'Unknown Product';
                      const shopName = offer.shopId?.shopName || offer.shopId?.name || 'Unknown Shop';
                      
                      return (
                        <tr key={offer._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">{offer.title || 'Untitled Offer'}</td>
                          <td className="py-3 px-4 text-gray-600">{productName}</td>
                          <td className="py-3 px-4 text-gray-600">{shopName}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {offer.discountType === 'Percentage' 
                            ? `${offer.discountValue}%` 
                            : `₹${offer.discountValue}`}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {offer.currentUses}/{offer.maxUses}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            offer.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : offer.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : offer.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(offer._id, 'offer')}
                              className="p-1 text-blue-600 hover:text-blue-700" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {offer.status === 'active' ? (
                              <button
                                onClick={() => handleOfferAction(offer._id, 'suspended')}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="Suspend Offer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOfferAction(offer._id, 'active')}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="Activate Offer"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

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

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeTab === 'products' ? 'Product Details' : 'Offer Details'}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {activeTab === 'products' ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Product Name</label>
                        <p className="text-gray-800">{(selectedItem as Product).name || 'Unknown'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <p className="text-gray-800">{(selectedItem as Product).category || 'Unknown'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Price</label>
                        <p className="text-gray-800">₹{(selectedItem as Product).price || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (selectedItem as Product).status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : (selectedItem as Product).status === 'flagged'
                            ? 'bg-yellow-100 text-yellow-800'
                            : (selectedItem as Product).status === 'removed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(selectedItem as Product).status ? (selectedItem as Product).status.charAt(0).toUpperCase() + (selectedItem as Product).status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Report Count</label>
                        <p className="text-gray-800">{(selectedItem as Product).reportCount || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Added Date</label>
                        <p className="text-gray-800">{(selectedItem as Product).addedDate}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-800 mt-1">{(selectedItem as Product).description || 'No description available'}</p>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Shop</label>
                      <p className="text-gray-800">
                        {typeof (selectedItem as Product).shop === 'string' 
                          ? (selectedItem as Product).shop 
                          : (selectedItem as Product).shop && typeof (selectedItem as Product).shop === 'object'
                          ? ((selectedItem as Product).shop as any).shopName || ((selectedItem as Product).shop as any).name || 'Unknown Shop'
                          : 'Unknown Shop'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Offer Title</label>
                        <p className="text-gray-800">{(selectedItem as Offer).title || 'Untitled Offer'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (selectedItem as Offer).status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : (selectedItem as Offer).status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : (selectedItem as Offer).status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(selectedItem as Offer).status ? (selectedItem as Offer).status.charAt(0).toUpperCase() + (selectedItem as Offer).status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Discount</label>
                        <p className="text-gray-800">
                          {(selectedItem as Offer).discountType === 'Percentage' 
                            ? `${(selectedItem as Offer).discountValue || 0}%` 
                            : `₹${(selectedItem as Offer).discountValue || 0}`}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Usage</label>
                        <p className="text-gray-800">
                          {(selectedItem as Offer).currentUses || 0}/{(selectedItem as Offer).maxUses || 0}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Product</label>
                        <p className="text-gray-800">
                          {(selectedItem as Offer).productId?.name || 'Unknown Product'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Shop</label>
                        <p className="text-gray-800">
                          {(selectedItem as Offer).shopId?.shopName || (selectedItem as Offer).shopId?.name || 'Unknown Shop'}
                        </p>
                      </div>
                    </div>
                    {(selectedItem as Offer).description && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-800 mt-1">{(selectedItem as Offer).description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};