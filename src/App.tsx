import { useState, useEffect } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { RealStatsCard } from './components/dashboard/RealStatsCard';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { ScrollableActivity } from './components/dashboard/ScrollableActivity';
import { VerificationPanel } from './components/verification/VerificationPanel';
import { UserManagement } from './components/users/UserManagement';
import { ActiveUsers } from './components/users/ActiveUsers';
import { ActivityFeed } from './components/activity/ActivityFeed';
import { ProductMonitoring } from './components/products/ProductMonitoring';
import { ReviewModeration } from './components/reviews/ReviewModeration';
import { NotificationManager } from './components/notifications/NotificationManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { LoginForm } from './components/auth/LoginForm';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { useAuth } from './contexts/AuthContext';
import { Users, Package, Star, UserCheck } from 'lucide-react';
import websocketService from './services/websocketService';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loginError, setLoginError] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { isAuthenticated, login, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    const success = await login(email, password);
    if (!success) {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        websocketService.connect(token);
      }
    } else {
      websocketService.disconnect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl animate-pulse border-2 border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-blue-200 border-opacity-50 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">ShopRadar</h1>
          <p className="text-gray-600 mb-8">Admin Dashboard</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} error={loginError} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'verification':
        return <VerificationPanel />;
      case 'shops':
        return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop Management</h2>
          <p className="text-gray-600">Shop management functionality coming soon...</p>
        </div>;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductMonitoring />;
      case 'reviews':
        return <ReviewModeration />;
      case 'notifications':
        return <NotificationManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'activity':
        return <ActivityFeed />;
      case 'settings':
        return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">System Configuration</h2>
          <p className="text-gray-600">System configuration settings coming soon...</p>
        </div>;
      default:
        return (
          <div className="space-y-6">
            {/* Real Stats Overview */}
            <RealStatsCard />

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setCurrentView('verification')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <UserCheck className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Verify Shops</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('users')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Manage Users</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('products')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Package className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Monitor Products</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('reviews')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Review Moderation</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <ScrollableActivity />
              </div>
            </div>
            
            {/* Active Users Section */}
            <div className="mt-8">
              <ActiveUsers />
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'verification', label: 'Verification' },
            { id: 'users', label: 'Users' },
            { id: 'products', label: 'Products' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'activity', label: 'Activity' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {renderCurrentView()}
    </AdminLayout>
  );
}

export default App;