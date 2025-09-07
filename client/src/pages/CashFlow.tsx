import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Filter,
  Search,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

interface CashFlowItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: string;
  description: string;
  referenceId?: string;
  userId: string;
  createdAt: string;
}

interface CashFlowFormData {
  type: 'income' | 'expense';
  category: string;
  amount: string;
  description: string;
}

export default function CashFlow() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CashFlowFormData>({
    type: 'expense',
    category: '',
    amount: '0',
    description: ''
  });

  const { data: cashFlow, isLoading } = useQuery({
    queryKey: ['/api/cash-flow'],
    queryFn: async () => {
      const response = await fetch('/api/cash-flow');
      if (!response.ok) throw new Error('Failed to fetch cash flow');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: CashFlowFormData) => {
      return await apiRequest('/api/cash-flow', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-flow'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: '0',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredCashFlow = cashFlow?.filter((item: CashFlowItem) => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
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

  // Calculate totals
  const totalIncome = cashFlow?.reduce((sum: number, item: CashFlowItem) => 
    item.type === 'income' ? sum + parseFloat(item.amount) : sum, 0) || 0;
  
  const totalExpense = cashFlow?.reduce((sum: number, item: CashFlowItem) => 
    item.type === 'expense' ? sum + parseFloat(item.amount) : sum, 0) || 0;
  
  const netCashFlow = totalIncome - totalExpense;

  const categories = {
    income: ['sales', 'investment', 'loan', 'other_income'],
    expense: ['purchase', 'salary', 'rent', 'utility', 'marketing', 'maintenance', 'other_expense']
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      sales: 'Penjualan',
      investment: 'Investasi',
      loan: 'Pinjaman',
      other_income: 'Pemasukan Lainnya',
      purchase: 'Pembelian Bahan',
      salary: 'Gaji Karyawan',
      rent: 'Sewa Tempat',
      utility: 'Listrik & Air',
      marketing: 'Marketing',
      maintenance: 'Perawatan',
      other_expense: 'Pengeluaran Lainnya'
    };
    return categoryMap[category] || category;
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? ArrowUpCircle : ArrowDownCircle;
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="cash-flow-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-cash-flow-title">
              Cash Flow
            </h1>
            <p className="text-gray-600">Kelola arus kas masuk dan keluar</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            data-testid="button-add-cash-flow"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-total-income">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-total-income">
                  {formatRupiah(totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-total-expense">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-total-expense">
                  {formatRupiah(totalExpense)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="card-net-cash-flow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Arus Kas Bersih</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-cash-flow">
                  {formatRupiah(netCashFlow)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-search-cash-flow"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-type-filter"
          >
            <option value="all">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-category-filter"
          >
            <option value="all">Semua Kategori</option>
            <optgroup label="Pemasukan">
              {categories.income.map(category => (
                <option key={category} value={category}>
                  {getCategoryText(category)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pengeluaran">
              {categories.expense.map(category => (
                <option key={category} value={category}>
                  {getCategoryText(category)}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="input-date-filter"
          />
        </div>

        {/* Cash Flow List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200" data-testid="cash-flow-list">
              {filteredCashFlow.map((item: CashFlowItem) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50" data-testid={`cash-flow-item-${item.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <TypeIcon className={`w-5 h-5 ${getTypeColor(item.type)}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900" data-testid={`text-description-${item.id}`}>
                            {item.description}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500" data-testid={`text-category-${item.id}`}>
                              {getCategoryText(item.category)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500" data-testid={`text-date-${item.id}`}>
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-semibold ${getTypeColor(item.type)}`} data-testid={`text-amount-${item.id}`}>
                          {item.type === 'income' ? '+' : '-'}{formatRupiah(item.amount)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredCashFlow.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500" data-testid="text-no-cash-flow">
                {searchTerm ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi cash flow'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Cash Flow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-cash-flow">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="text-modal-title">
              Tambah Transaksi Cash Flow
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Transaksi
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      data-testid="radio-type-income"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      Pemasukan
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      data-testid="radio-type-expense"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      Pengeluaran
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="select-category"
                >
                  <option value="">Pilih Kategori</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>
                      {getCategoryText(category)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="input-amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="textarea-description"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="button-cancel"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  data-testid="button-save"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}