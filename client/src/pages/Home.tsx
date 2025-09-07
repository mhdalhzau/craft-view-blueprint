import React from 'react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Package, 
  Receipt, 
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle
} from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  todaySales: number;
  totalProducts: number;
  lowStockItems: number;
  totalTransactions: number;
  totalEmployees: number;
}

export default function Home() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      // Mock data for now - will be replaced with real API
      return {
        totalSales: 15750000,
        todaySales: 2150000,
        totalProducts: 45,
        lowStockItems: 8,
        totalTransactions: 127,
        totalEmployees: 5
      };
    }
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="dashboard-container">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary to-red-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
            Selamat Datang di DIMSUM WARUNG
          </h1>
          <p className="text-red-100" data-testid="text-welcome-subtitle">
            Sistem Point of Sale untuk mengelola warung dimsum Anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-total-sales">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-sales">
                  {formatRupiah(stats?.totalSales || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-today-sales">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Penjualan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-today-sales">
                  {formatRupiah(stats?.todaySales || 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-total-products">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-products">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-low-stock">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Menipis</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-low-stock">
                  {stats?.lowStockItems || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-total-transactions">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-transactions">
                  {stats?.totalTransactions || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Receipt className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200" data-testid="card-total-employees">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-employees">
                  {stats?.totalEmployees || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/pos"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
            data-testid="link-quick-pos"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-full group-hover:bg-red-600 transition-colors">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Point of Sale</h3>
                <p className="text-sm text-gray-600">Mulai transaksi penjualan</p>
              </div>
            </div>
          </a>

          <a
            href="/inventory"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
            data-testid="link-quick-inventory"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kelola Inventory</h3>
                <p className="text-sm text-gray-600">Tambah dan kelola stok</p>
              </div>
            </div>
          </a>

          <a
            href="/reports"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
            data-testid="link-quick-reports"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-full group-hover:bg-green-600 transition-colors">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lihat Laporan</h3>
                <p className="text-sm text-gray-600">Analisis penjualan</p>
              </div>
            </div>
          </a>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900" data-testid="text-recent-transactions">
              Transaksi Terbaru
            </h3>
          </div>
          <div className="p-6">
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentTransactions?.length > 0 ? (
              <div className="space-y-4" data-testid="list-recent-transactions">
                {recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0" data-testid={`transaction-item-${index}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-transaction-number-${index}`}>
                        {transaction.transactionNumber}
                      </p>
                      <p className="text-xs text-gray-500" data-testid={`text-transaction-date-${index}`}>
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-600" data-testid={`text-transaction-amount-${index}`}>
                      {formatRupiah(parseFloat(transaction.totalAmount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8" data-testid="text-no-transactions">
                Belum ada transaksi
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}