import { User, Shop, Product, Review, AdminStats, Notification } from '../types/admin';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'shopper',
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2024-01-20'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@shopexample.com',
    type: 'shopkeeper',
    status: 'active',
    joinedDate: '2024-01-10',
    lastActive: '2024-01-19'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    type: 'shopper',
    status: 'blocked',
    joinedDate: '2024-01-08',
    lastActive: '2024-01-18'
  }
];

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Tech Paradise',
    owner: 'Jane Smith',
    category: 'Electronics',
    address: '123 Main Street, Downtown Mall, Mumbai, Maharashtra',
    location: 'Downtown Mall',
    status: 'approved',
    verificationStatus: 'approved',
    registrationDate: '2024-01-10',
    licenseDocument: 'license-001.pdf',
    licenseNumber: 'MAH/SHOP/2024/001',
    phone: '9876543210',
    state: 'Maharashtra',
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    gpsAddress: '123 Main Street, Downtown Mall, Mumbai, Maharashtra',
    isLocationVerified: true,
    verifiedAt: '2024-01-11',
    verifiedBy: 'Admin User'
  },
  {
    id: '2',
    name: 'Fashion Hub',
    owner: 'Sarah Wilson',
    category: 'Clothing',
    address: '456 Fashion Avenue, City Center, Delhi, Delhi',
    location: 'City Center',
    status: 'pending',
    verificationStatus: 'pending',
    registrationDate: '2024-01-18',
    licenseNumber: 'DEL/SHOP/2024/002',
    phone: '9876543211',
    state: 'Delhi',
    coordinates: {
      latitude: 28.7041,
      longitude: 77.1025
    },
    gpsAddress: '456 Fashion Avenue, City Center, Delhi, Delhi',
    isLocationVerified: true
  },
  {
    id: '3',
    name: 'Book Corner',
    owner: 'David Brown',
    category: 'Books',
    address: '789 University Road, Near Campus, Bangalore, Karnataka',
    location: 'University Area',
    status: 'rejected',
    verificationStatus: 'rejected',
    registrationDate: '2024-01-12',
    licenseNumber: 'KAR/SHOP/2024/003',
    phone: '9876543212',
    state: 'Karnataka',
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    gpsAddress: '789 University Road, Near Campus, Bangalore, Karnataka',
    isLocationVerified: false,
    verificationNotes: 'License document was not clear and location verification failed'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone X1',
    shop: 'Tech Paradise',
    category: 'Electronics',
    price: 0,
    status: 'active',
    reportCount: 0,
    addedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Designer Jacket',
    shop: 'Fashion Hub',
    category: 'Clothing',
    price: 0,
    status: 'active',
    reportCount: 0,
    addedDate: '2024-01-16'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    user: 'John Doe',
    shop: 'Tech Paradise',
    rating: 0,
    comment: 'Great service and products!',
    date: '2024-01-17',
    status: 'active',
    reportCount: 0
  },
  {
    id: '2',
    user: 'Mike Johnson',
    shop: 'Fashion Hub',
    rating: 0,
    comment: 'Terrible quality, waste of money!',
    date: '2024-01-18',
    status: 'flagged',
    reportCount: 0
  }
];

export const mockStats: AdminStats = {
  activeUsers: 0,
  totalShops: 0,
  pendingVerifications: 0,
  totalProducts: 0,
  flaggedReviews: 0,
  dailyActiveUsers: 0
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Year Sale',
    message: 'Join our New Year sale with up to 50% off on all categories!',
    type: 'global',
    status: 'sent',
    createdDate: '2024-01-01',
    sentDate: '2024-01-01'
  },
  {
    id: '2',
    title: 'Shopkeeper Guidelines Update',
    message: 'Please review the updated guidelines for product listings.',
    type: 'shopkeeper',
    status: 'draft',
    createdDate: '2024-01-19'
  }
];