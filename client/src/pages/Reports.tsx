import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  DollarSign,
  Package,
  Users,
  Receipt
} from 'lucide-react';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/reports/sales', dateRange],
    queryFn: async () => {
      // Mock data for now
      return {
        totalSales: 15750000,
        totalTransactions: 127,
        averageTransaction: 124015,
        growth: 12.5,
        dailySales: [
          { date: '2025-09-01', sales: 850000, transactions: 8 },
          { date: '2025-09-02', sales: 950000, transactions: 12 },
          { date: '2025-09-03', sales: 750000, transactions: 6 },
          { date: '2025-09-04', sales: 1200000, transactions: 15 },
          { date: '2025-09-05', sales: 980000, transactions: 11 },
          { date: '2025-09-06', sales: 1100000, transactions: 13 },
          { date: '2025-09-07', sales: 650000, transactions: 5 }
        ]
      };
    }
  });

  const { data: productReport, isLoading: productLoading } = useQuery({
    queryKey: ['/api/reports/products', dateRange],
    queryFn: async () => {
      // Mock data for now
      return {
        topProducts: [
          { name: 'Dimsum Ayam', sales: 45, revenue: 2250000 },
          { name: 'Paket Dimsum + Teh', sales: 32, revenue: 1920000 },
          { name: 'Siomay Udang', sales: 28, revenue: 1680000 },
          { name: 'Teh Tarik', sales: 67, revenue: 1340000 },
          { name: 'Es Jeruk', sales: 43, revenue: 860000 }
        ],
        categoryBreakdown: [
          { category: 'Satuan', sales: 85, revenue: 5100000 },
          { category: 'Paket', sales: 32, revenue: 4800000 },
          { category: 'Topping', sales: 110, revenue: 2200000 }
        ]
      };
    }
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="reports-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-reports-title">
              Laporan
            </h1>
            <p className="text-gray-600">Analisis penjualan dan performa bisnis</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" data-testid="button-export-report">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Periode:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                data-testid="input-date-start"
              />
              <span className="text-gray-500">sampai</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                data-testid="input-date-end"
              />
            </div>
          </div>
        </div>

        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-total-sales">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-sales">
                  {salesReport ? formatRupiah(salesReport.totalSales) : '...'}
                </p>
                {salesReport && salesReport.growth > 0 && (
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600" data-testid="text-sales-growth">
                      +{salesReport.growth}%
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-total-transactions">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-transactions">
                  {salesReport ? salesReport.totalTransactions : '...'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-average-transaction">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-average-transaction">
                  {salesReport ? formatRupiah(salesReport.averageTransaction) : '...'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-top-products">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produk Terlaris</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-top-product">
                  {productReport ? productReport.topProducts[0]?.name : '...'}
                </p>
                <p className="text-xs text-gray-500">
                  {productReport ? `${productReport.topProducts[0]?.sales} terjual` : ''}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="chart-daily-sales">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan Harian</h3>
            {salesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {salesReport?.dailySales.map((day: any, index: number) => (
                  <div key={day.date} className="flex items-center justify-between py-2" data-testid={`daily-sales-${index}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-primary rounded"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(day.date)}</p>
                        <p className="text-xs text-gray-500">{day.transactions} transaksi</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900" data-testid={`text-daily-sales-${index}`}>
                      {formatRupiah(day.sales)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="chart-category-breakdown">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Kategori</h3>
            {productLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {productReport?.categoryBreakdown.map((category: any, index: number) => (
                  <div key={category.category} className="space-y-2" data-testid={`category-breakdown-${index}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-600" data-testid={`text-category-revenue-${index}`}>
                        {formatRupiah(category.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(category.revenue / Math.max(...productReport.categoryBreakdown.map((c: any) => c.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{category.sales} item terjual</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Produk Terlaris</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="top-products-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontribusi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productReport?.topProducts.map((product: any, index: number) => (
                  <tr key={product.name} className="hover:bg-gray-50" data-testid={`top-product-row-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-8 rounded mr-3 ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900" data-testid={`text-product-name-${index}`}>
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900" data-testid={`text-product-sales-${index}`}>
                        {product.sales}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900" data-testid={`text-product-revenue-${index}`}>
                        {formatRupiah(product.revenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(product.revenue / Math.max(...productReport.topProducts.map((p: any) => p.revenue))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {((product.revenue / salesReport?.totalSales) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}