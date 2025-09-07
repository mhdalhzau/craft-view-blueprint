import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package2, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Users, 
  DollarSign, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package2, label: 'Inventory', path: '/inventory' },
  { icon: ShoppingCart, label: 'Produk', path: '/products' },
  { icon: Receipt, label: 'Point of Sale', path: '/pos' },
  { icon: BarChart3, label: 'Transaksi', path: '/transactions' },
  { icon: BarChart3, label: 'Laporan', path: '/reports' },
  { icon: Users, label: 'Karyawan', path: '/employees' },
  { icon: DollarSign, label: 'Cash Flow', path: '/cash-flow' },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="layout-container">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} data-testid="sidebar">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DW</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">DIMSUM WARUNG</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-user-email">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize" data-testid="text-user-role">
                {user?.role}
              </p>
            </div>
          </div>
          <a
            href="/api/logout"
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            data-testid="link-logout"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Keluar
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            data-testid="button-open-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 ml-4 lg:ml-0" data-testid="text-page-title">
              {menuItems.find(item => item.path === location)?.label || 'Dashboard'}
            </h2>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}