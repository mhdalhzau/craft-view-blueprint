import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { 
  Receipt, 
  Search, 
  Eye, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface Transaction {
  id: string;
  transactionNumber: string;
  userId: string;
  totalAmount: string;
  paymentMethod: string;
  paymentAmount: string;
  changeAmount: string;
  status: string;
  createdAt: string;
}

interface TransactionItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  const { data: transactionItems } = useQuery({
    queryKey: ['/api/transactions', selectedTransaction?.id, 'items'],
    queryFn: async () => {
      if (!selectedTransaction) return [];
      const response = await fetch(`/api/transactions/${selectedTransaction.id}/items`);
      if (!response.ok) throw new Error('Failed to fetch transaction items');
      return response.json();
    },
    enabled: !!selectedTransaction
  });

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || transaction.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  }) || [];

  const formatRupiah = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'card': return 'Kartu';
      case 'transfer': return 'Transfer';
      default: return method;
    }
  };

  const viewTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="transactions-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-transactions-title">
              Transaksi
            </h1>
            <p className="text-gray-600">Kelola dan pantau semua transaksi penjualan</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" data-testid="button-export">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nomor transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-search-transactions"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-status-filter"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-payment-filter"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai</option>
            <option value="card">Kartu</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="input-date-filter"
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="transactions-table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode Bayar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction: Transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50" data-testid={`transaction-row-${transaction.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900" data-testid={`text-transaction-number-${transaction.id}`}>
                            {transaction.transactionNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900" data-testid={`text-transaction-date-${transaction.id}`}>
                          {formatDate(transaction.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900" data-testid={`text-transaction-total-${transaction.id}`}>
                          {formatRupiah(transaction.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900" data-testid={`text-payment-method-${transaction.id}`}>
                          {getPaymentMethodText(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`} data-testid={`badge-status-${transaction.id}`}>
                          {transaction.status === 'completed' ? 'Selesai' : 
                           transaction.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewTransactionDetail(transaction)}
                          className="text-primary hover:text-red-600 text-sm flex items-center space-x-1"
                          data-testid={`button-view-detail-${transaction.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500" data-testid="text-no-transactions">
                    {searchTerm ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {isDetailOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-transaction-detail">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900" data-testid="text-detail-title">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-close-detail"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Transaksi</label>
                <p className="text-sm text-gray-900" data-testid="text-detail-number">
                  {selectedTransaction.transactionNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <p className="text-sm text-gray-900" data-testid="text-detail-date">
                  {formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`} data-testid="badge-detail-status">
                  {selectedTransaction.status === 'completed' ? 'Selesai' : 
                   selectedTransaction.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                <p className="text-sm text-gray-900" data-testid="text-detail-payment-method">
                  {getPaymentMethodText(selectedTransaction.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Transaction Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Pembelian</h3>
              <div className="space-y-2" data-testid="transaction-items-list">
                {transactionItems?.map((item: TransactionItem, index: number) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0" data-testid={`transaction-item-${index}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Item #{item.productId}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatRupiah(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900" data-testid={`text-item-total-${index}`}>
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ringkasan Pembayaran</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-detail-total">
                    {formatRupiah(selectedTransaction.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dibayar:</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-detail-paid">
                    {formatRupiah(selectedTransaction.paymentAmount)}
                  </span>
                </div>
                {selectedTransaction.paymentMethod === 'cash' && parseFloat(selectedTransaction.changeAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kembali:</span>
                    <span className="text-sm font-medium text-green-600" data-testid="text-detail-change">
                      {formatRupiah(selectedTransaction.changeAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-close"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  // Print receipt logic here
                  window.print();
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors"
                data-testid="button-print-receipt"
              >
                Print Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}