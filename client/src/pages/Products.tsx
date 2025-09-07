import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  Search,
  Tag,
  Settings,
  ShoppingBag
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

interface ProductFormData {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  isActive: boolean;
  inventoryItems: Array<{
    inventoryId: string;
    quantity: number;
  }>;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    price: '0',
    description: '',
    isActive: true,
    inventoryItems: []
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: async () => {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    }
  });

  // Initialize categories if empty
  const initCategoriesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/init-categories', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      return await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      price: '0',
      description: '',
      isActive: true,
      inventoryItems: []
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    
    // Fetch product inventory
    try {
      const response = await fetch(`/api/products/${product.id}/inventory`);
      const productInventory = response.ok ? await response.json() : [];
      
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        description: product.description || '',
        isActive: product.isActive,
        inventoryItems: productInventory.map((item: any) => ({
          inventoryId: item.inventoryId,
          quantity: parseFloat(item.quantity)
        }))
      });
    } catch (error) {
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        description: product.description || '',
        isActive: product.isActive,
        inventoryItems: []
      });
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const addInventoryItem = () => {
    setFormData({
      ...formData,
      inventoryItems: [...formData.inventoryItems, { inventoryId: '', quantity: 1 }]
    });
  };

  const removeInventoryItem = (index: number) => {
    setFormData({
      ...formData,
      inventoryItems: formData.inventoryItems.filter((_, i) => i !== index)
    });
  };

  const updateInventoryItem = (index: number, field: 'inventoryId' | 'quantity', value: string | number) => {
    const updatedItems = [...formData.inventoryItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' ? Number(value) : value
    };
    setFormData({ ...formData, inventoryItems: updatedItems });
  };

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const formatRupiah = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((cat: Category) => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find((cat: Category) => cat.id === categoryId);
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category.type) {
      case 'satuan': return 'bg-blue-100 text-blue-800';
      case 'paket': return 'bg-green-100 text-green-800';
      case 'topping': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Initialize categories if empty
  React.useEffect(() => {
    if (categories && categories.length === 0) {
      initCategoriesMutation.mutate();
    }
  }, [categories]);

  return (
    <Layout>
      <div className="space-y-6" data-testid="products-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-products-title">
              Manajemen Produk
            </h1>
            <p className="text-gray-600">Kelola produk dengan kategori satuan, paket, dan topping</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            data-testid="button-add-product"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="input-search-products"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            data-testid="select-category-filter"
          >
            <option value="all">Semua Kategori</option>
            {categories?.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid="tab-all-categories"
          >
            Semua
          </button>
          {categories?.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid={`tab-category-${category.type}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${
                  !product.isActive ? 'opacity-60' : ''
                }`}
                data-testid={`product-card-${product.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.categoryId)}`} data-testid={`badge-category-${product.id}`}>
                          {getCategoryName(product.categoryId)}
                        </span>
                        {!product.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Harga:</span>
                    <span className="font-semibold text-primary" data-testid={`text-product-price-${product.id}`}>
                      {formatRupiah(product.price)}
                    </span>
                  </div>
                  
                  {product.description && (
                    <div>
                      <span className="text-sm text-gray-600">Deskripsi:</span>
                      <p className="text-sm text-gray-900 mt-1" data-testid={`text-product-description-${product.id}`}>
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !productsLoading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500" data-testid="text-no-products">
              {searchTerm ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-product">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="text-modal-title">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    data-testid="input-product-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    data-testid="select-product-category"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories?.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  data-testid="input-product-price"
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
                  data-testid="textarea-product-description"
                />
              </div>

              {/* Inventory Items (Recipe) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Resep / Komposisi (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={addInventoryItem}
                    className="text-primary hover:text-red-600 text-sm flex items-center space-x-1"
                    data-testid="button-add-inventory-item"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Bahan</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Tambahkan bahan/inventory yang digunakan untuk membuat produk ini (khususnya untuk paket)
                </p>
                
                {formData.inventoryItems.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2" data-testid={`inventory-item-${index}`}>
                    <select
                      value={item.inventoryId}
                      onChange={(e) => updateInventoryItem(index, 'inventoryId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                      data-testid={`select-inventory-${index}`}
                    >
                      <option value="">Pilih Bahan</option>
                      {inventory?.map((inv: InventoryItem) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateInventoryItem(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      min="0"
                      step="0.001"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                      data-testid={`input-quantity-${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeInventoryItem(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      data-testid={`button-remove-inventory-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  data-testid="checkbox-is-active"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Produk Aktif
                </label>
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