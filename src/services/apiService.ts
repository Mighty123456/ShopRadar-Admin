// Prefer Vite env var; fallback to localhost in dev; otherwise production
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    || (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api'
      : 'https://shopradarbackend.onrender.com/api');

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Admin Authentication
  async adminLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.data.token) {
      localStorage.setItem('adminToken', data.data.token);
      return { success: true, token: data.data.token, admin: data.data.admin };
    }
    
    return { success: false, message: data.message || 'Login failed' };
  }

  // Shop Management
  async getAllShops(status?: string, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/shops/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch shops' };
  }

  async getShopById(shopId: string) {
    const response = await fetch(`${API_BASE_URL}/shops/admin/${shopId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, shop: data.shop };
    }
    
    return { success: false, message: data.message || 'Failed to fetch shop' };
  }

  async verifyShop(shopId: string, status: 'approved' | 'rejected', notes?: string) {
    const response = await fetch(`${API_BASE_URL}/shops/admin/${shopId}/verify`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to verify shop' };
  }

  async updateShopStatus(shopId: string, isActive: boolean, isLive: boolean) {
    const response = await fetch(`${API_BASE_URL}/shops/admin/${shopId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive, isLive }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update shop status' };
  }

  async getShopStats() {
    const response = await fetch(`${API_BASE_URL}/shops/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, stats: data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch shop stats' };
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 10, type?: string, status?: string, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type && type !== 'all') {
      params.append('type', type);
    }
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${API_BASE_URL}/users/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch users' };
  }

  async getUserById(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, user: data.user };
    }
    
    return { success: false, message: data.message || 'Failed to fetch user' };
  }

  async updateUserStatus(userId: string, status: 'active' | 'blocked') {
    const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update user status' };
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to delete user' };
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, stats: data.stats };
    }
    
    return { success: false, message: data.message || 'Failed to fetch user stats' };
  }

  async getActiveUsers(timeframe: string = '24h', page: number = 1, limit: number = 50) {
    const params = new URLSearchParams({
      timeframe,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/users/admin/active?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch active users' };
  }

  // Logout
  logout() {
    localStorage.removeItem('adminToken');
  }

  // Activity Management
  async getRecentActivities(page: number = 1, limit: number = 20, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await fetch(`${API_BASE_URL}/activities/recent?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch recent activities' };
  }

  async getActivityStats(timeframe: string = '24h') {
    const response = await fetch(`${API_BASE_URL}/activities/stats?timeframe=${timeframe}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch activity statistics' };
  }

  async getActivityById(activityId: string) {
    const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch activity' };
  }

  async createActivity(activityData: any) {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(activityData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to create activity' };
  }

  // Product Management
  async getAllProducts(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/products/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch products' };
  }

  async getProductById(productId: string) {
    const response = await fetch(`${API_BASE_URL}/products/admin/${productId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch product' };
  }

  async updateProductStatus(productId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/products/admin/${productId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update product status' };
  }

  async getProductStats() {
    const response = await fetch(`${API_BASE_URL}/products/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch product statistics' };
  }

  // Review Management
  async getAllReviews(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.rating) params.append('rating', filters.rating);
    if (filters?.shopId) params.append('shopId', filters.shopId);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/reviews/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch reviews' };
  }

  async getReviewById(reviewId: string) {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch review' };
  }

  async updateReviewStatus(reviewId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update review status' };
  }

  async getReviewStats() {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch review statistics' };
  }

  // Notification Management
  async getAllNotifications(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/notifications/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch notifications' };
  }

  async getNotificationById(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/${notificationId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch notification' };
  }

  async createNotification(notificationData: any) {
    const response = await fetch(`${API_BASE_URL}/notifications/admin`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to create notification' };
  }

  async updateNotification(notificationId: string, notificationData: any) {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/${notificationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update notification' };
  }

  async sendNotification(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/${notificationId}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to send notification' };
  }

  async getNotificationStats() {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch notification statistics' };
  }

  // Offer Management
  async getAllOffers(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.shopId) params.append('shopId', filters.shopId);
    if (filters?.search) params.append('search', filters.search);

    console.log('Fetching offers with params:', params.toString());
    console.log('API URL:', `${API_BASE_URL}/offers/admin/all?${params}`);

    const response = await fetch(`${API_BASE_URL}/offers/admin/all?${params}`, {
      headers: this.getAuthHeaders(),
    });

    console.log('Offers response status:', response.status);
    const data = await response.json();
    console.log('Offers response data:', data);
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch offers' };
  }

  async getOfferById(offerId: string) {
    const response = await fetch(`${API_BASE_URL}/offers/admin/${offerId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch offer' };
  }

  async updateOfferStatus(offerId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/offers/admin/${offerId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    }
    
    return { success: false, message: data.message || 'Failed to update offer status' };
  }

  async getOfferStats() {
    const response = await fetch(`${API_BASE_URL}/offers/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.data };
    }
    
    return { success: false, message: data.message || 'Failed to fetch offer statistics' };
  }

  // Check if admin is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  }
}

export default new ApiService();
