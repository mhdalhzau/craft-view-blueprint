import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryFormData {
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: string;
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    unit: '',
    stock: 0,
    minStock: 0,
    cost: '0'
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: async () => {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      return await apiRequest('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InventoryFormData }) => {
      return await apiRequest(`/api/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
  });

  const stockUpdateMutation = useMutation({
    mutationFn: async ({ id, newStock, type, notes }: { 
      id: string; 
      newStock: number; 
      type: string; 
      notes: string; 
    }) => {
      return await apiRequest(`/api/inventory/${id}/stock`, {
        method: 'POST',
        body: JSON.stringify({ newStock, type, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      stock: 0,
      minStock: 0,
      cost: '0'
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      stock: item.stock,
      minStock: item.minStock,
      cost: item.cost
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStockUpdate = (item: InventoryItem, adjustment: number, type: string) => {
    const newStock = item.stock + adjustment;
    if (newStock < 0) return;
    
    const notes = type === 'in' ? `Tambah stok: +${adjustment}` : `Kurangi stok: ${adjustment}`;
    stockUpdateMutation.mutate({
      id: item.id,
      newStock,
      type,
      notes
    });
  };

  const filteredInventory = inventory?.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatRupiah = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="inventory-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-inventory-title">
              Manajemen Inventory
            </h1>
            <p className="text-gray-600">Kelola stok barang dan bahan baku</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            data-testid="button-add-inventory"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari item inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="input-search-inventory"
          />
        </div>

        {/* Inventory Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="inventory-grid">
            {filteredInventory.map((item: InventoryItem) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
                data-testid={`inventory-card-${item.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`text-item-name-${item.id}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500" data-testid={`text-item-unit-${item.id}`}>
                        Unit: {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      data-testid={`button-edit-${item.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stok Saat Ini:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        item.stock <= item.minStock ? 'text-red-600' : 'text-green-600'
                      }`} data-testid={`text-stock-${item.id}`}>
                        {item.stock}
                      </span>
                      {item.stock <= item.minStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stok Minimum:</span>
                    <span className="text-sm text-gray-900" data-testid={`text-min-stock-${item.id}`}>
                      {item.minStock}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Harga:</span>
                    <span className="text-sm font-medium text-gray-900" data-testid={`text-cost-${item.id}`}>
                      {formatRupiah(item.cost)}
                    </span>
                  </div>
                </div>

                {/* Quick Stock Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Adjustment Cepat:</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStockUpdate(item, -1, 'out')}
                      disabled={item.stock <= 0}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid={`button-decrease-stock-${item.id}`}
                    >
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      -1
                    </button>
                    <button
                      onClick={() => handleStockUpdate(item, 1, 'in')}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                      data-testid={`button-increase-stock-${item.id}`}
                    >
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +1
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredInventory.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500" data-testid="text-no-inventory">
              {searchTerm ? 'Tidak ada item yang ditemukan' : 'Belum ada item inventory'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-inventory">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="text-modal-title">
              {editingItem ? 'Edit Item Inventory' : 'Tambah Item Inventory'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Item
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="input-item-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, pcs, liter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="input-item-unit"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    data-testid="input-stock"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    data-testid="input-min-stock"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga per Unit (Rp)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="input-cost"
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  data-testid="button-save"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}