import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  MessageSquare,
  Bell,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: UserCheck, label: 'Shopkeeper Verification', id: 'verification' },
  { icon: Store, label: 'Shop Management', id: 'shops' },
  { icon: Users, label: 'User Management', id: 'users' },
  { icon: Package, label: 'Products & Offers', id: 'products' },
  { icon: MessageSquare, label: 'Reviews & Ratings', id: 'reviews' },
  { icon: Activity, label: 'Activity Feed', id: 'activity' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'System Config', id: 'settings' }
];

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  // Cleanup modal state on unmount
  useEffect(() => {
    return () => {
      setShowConfirm(false);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">ShopRadar</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center px-6 py-3 text-sm cursor-pointer transition-colors ${
              currentView === item.id
                ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </div>
        ))}
      </nav>

      {/* Bottom logout */}
      <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-800">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 shadow hover:shadow-md hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400/60 active:scale-[.98] transition-all duration-150"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" key="logout-modal">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            console.log('Modal backdrop clicked');
            setShowConfirm(false);
          }}></div>
          <div className="relative z-10 w-[92%] max-w-sm rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mr-3">
                <LogOut className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm logout</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to end your session?</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { 
                  console.log('Logout button clicked');
                  setShowConfirm(false); 
                  logout(); 
                }}
                className="px-4 py-2 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};