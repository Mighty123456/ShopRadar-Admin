import React, { useState, useEffect } from 'react';
import { Review } from '../../types/admin';
import { Star, AlertTriangle, Trash2, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import apiService from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    search: ''
  });
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAllReviews(currentPage, 10, {
        ...filters,
        search: debouncedSearch
      });
      
      if (result.success) {
        setReviews(result.data.reviews);
        setTotalPages(result.data.pagination.totalPages);
        setTotalReviews(result.data.pagination.totalReviews);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [currentPage, filters.status, filters.rating, debouncedSearch]);

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'remove') => {
    try {
      const status = action === 'approve' ? 'active' : 'removed';
      const result = await apiService.updateReviewStatus(reviewId, status);
      
      if (result.success) {
        await loadReviews(); // Reload reviews to get updated data
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update review status');
      console.error('Error updating review status:', err);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Review & Rating Moderation</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total: {totalReviews}</span>
            <button
              onClick={loadReviews}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh reviews"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
              placeholder="Search reviews by user, shop, or comment..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Reviews</option>
            <option value="flagged">Flagged</option>
            <option value="active">Active</option>
            <option value="removed">Removed</option>
          </select>
          <select 
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews found</p>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-800">{review.user}</span>
                    <span className="text-gray-500">reviewed</span>
                    <span className="font-medium text-blue-600">{review.shop}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {review.reportCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {review.reportCount} reports
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    review.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'flagged'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="flex justify-end space-x-2">
                <button className="p-2 text-blue-600 hover:text-blue-700">
                  <Eye className="h-4 w-4" />
                </button>
                {review.status !== 'removed' && (
                  <>
                    {review.status === 'flagged' && (
                      <button
                        onClick={() => handleReviewAction(review.id, 'approve')}
                        className="p-2 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReviewAction(review.id, 'remove')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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
    </div>
  );
};