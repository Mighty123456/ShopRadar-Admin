// User interface for admin dashboard
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'shopper' | 'shopkeeper';
  status: 'active' | 'blocked';
  joinedDate: string;
  lastActive: string;
  shopInfo?: {
    name: string;
    licenseNumber: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    isActive: boolean;
    location?: string;
  };
}

export interface Shop {
  id: string;
  name: string;
  owner: string;
  category: string;
  address: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  licenseDocument?: string;
  licenseNumber?: string;
  phone?: string;
  state?: string;
  
  // Location verification fields
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  gpsAddress?: string;
  isLocationVerified?: boolean;
  
  // Verification details
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Product {
  id: string;
  name: string;
  shop: string;
  category: string;
  price: number;
  status: 'active' | 'removed' | 'flagged';
  reportCount: number;
  addedDate: string;
}

export interface Review {
  id: string;
  user: string;
  shop: string;
  rating: number;
  comment: string;
  date: string;
  status: 'active' | 'flagged' | 'removed';
  reportCount: number;
}

export interface AdminStats {
  activeUsers: number;
  totalShops: number;
  pendingVerifications: number;
  totalProducts: number;
  flaggedReviews: number;
  dailyActiveUsers: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'global' | 'shopkeeper' | 'shopper';
  status: 'draft' | 'sent';
  createdDate: string;
  sentDate?: string;
}