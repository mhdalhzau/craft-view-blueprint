import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard,
  Banknote,
  Receipt,
  Calculator,
  X,
  Printer,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: string;
  description: string;
  isActive: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export default function PointOfSale() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: printerStatus } = useQuery({
    queryKey: ['/api/printer-status'],
    queryFn: async () => {
      const response = await fetch('/api/printer-status');
      if (!response.ok) throw new Error('Failed to fetch printer status');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return await apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setLastTransactionId(data.id);
      setCart([]);
      setPaymentAmount('');
      setIsCheckoutOpen(false);
      // Generate receipt
      generateReceipt(data);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const filteredProducts = products?.filter((product: Product) => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesCategory && product.isActive;
  }) || [];

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        total: parseFloat(product.price)
      }]);
    }
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const paymentAmountNum = parseFloat(paymentAmount) || 0;
  const changeAmount = paymentAmountNum - cartTotal;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'cash' && paymentAmountNum < cartTotal) {
      alert('Jumlah pembayaran tidak mencukupi');
      return;
    }

    setIsProcessing(true);
    
    const transactionData = {
      totalAmount: cartTotal.toString(),
      paymentMethod,
      paymentAmount: paymentMethod === 'cash' ? paymentAmount : cartTotal.toString(),
      changeAmount: paymentMethod === 'cash' ? Math.max(0, changeAmount).toString() : '0',
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price.toString(),
        totalPrice: item.total.toString()
      }))
    };

    createTransactionMutation.mutate(transactionData);
  };

  const generateReceipt = (transaction: any) => {
    const receiptContent = `
=================================
        DIMSUM WARUNG
=================================
No: ${transaction.transactionNumber}
Tanggal: ${new Date().toLocaleDateString('id-ID')}
Waktu: ${new Date().toLocaleTimeString('id-ID')}

---------------------------------
${cart.map(item => `${item.name}
${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.total)}`).join('\n')}

---------------------------------
Total: ${formatRupiah(cartTotal)}
Bayar: ${formatRupiah(paymentAmountNum)}
${paymentMethod === 'cash' ? `Kembali: ${formatRupiah(Math.max(0, changeAmount))}` : ''}

Terima kasih atas kunjungan Anda!
=================================
    `;

    // Show receipt modal
    alert(`Transaksi berhasil!\n\n${receiptContent}`);
    
    // Print to Bluetooth RPP02N printer
    printReceipt(transaction.id);
  };

  const printReceipt = async (transactionId: string) => {
    try {
      const response = await fetch('/api/print-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Print success:', result.message);
      } else {
        console.error('Print failed:', await response.text());
        // Show fallback message
        alert('Printer tidak terhubung. Struk disimpan untuk dicetak nanti.');
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Gagal mencetak struk. Periksa koneksi printer bluetooth.');
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <Layout>
      <div className="flex gap-6 h-[calc(100vh-8rem)]" data-testid="pos-page">
        {/* Product Selection */}
        <div className="flex-1 flex flex-col">
          {/* Header with Printer Status */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <div className="flex items-center space-x-4">
              {/* Printer Status */}
              <div className="flex items-center space-x-2">
                {printerStatus?.connected ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Printer Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Printer Offline</span>
                  </div>
                )}
              </div>
              
              {/* Manual Print Button */}
              {lastTransactionId && (
                <button
                  onClick={() => printReceipt(lastTransactionId)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  data-testid="button-manual-print"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm">Print Ulang</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-all-products"
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
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="pos-products-grid">
              {filteredProducts.map((product: Product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow text-left group"
                  data-testid={`product-button-${product.id}`}
                >
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.categoryId)}`}>
                      {getCategoryName(product.categoryId)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                    {formatRupiah(parseFloat(product.price))}
                  </p>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500" data-testid="text-no-products">
                  Tidak ada produk dalam kategori ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="w-96 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center" data-testid="text-cart-title">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Keranjang ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm"
                  data-testid="button-clear-cart"
                >
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" data-testid="text-empty-cart">
                  Keranjang kosong
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="cart-items">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-gray-50 rounded-lg p-3" data-testid={`cart-item-${item.productId}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1" data-testid={`text-cart-item-name-${item.productId}`}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 p-1"
                        data-testid={`button-remove-item-${item.productId}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                          data-testid={`button-decrease-quantity-${item.productId}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                          data-testid={`button-increase-quantity-${item.productId}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatRupiah(item.price)} × {item.quantity}
                        </p>
                        <p className="font-semibold text-primary" data-testid={`text-item-total-${item.productId}`}>
                          {formatRupiah(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-primary" data-testid="text-cart-total">
                  {formatRupiah(cartTotal)}
                </span>
              </div>
              
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-primary hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                data-testid="button-checkout"
              >
                <Receipt className="w-5 h-5" />
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-checkout">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4" data-testid="text-checkout-title">
              Checkout
            </h2>
            
            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan:</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name} ({item.quantity}x)</span>
                    <span>{formatRupiah(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary" data-testid="text-checkout-total">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    data-testid="radio-payment-cash"
                  />
                  <Banknote className="w-4 h-4 ml-2 mr-2" />
                  <span className="text-sm">Tunai</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    data-testid="radio-payment-card"
                  />
                  <CreditCard className="w-4 h-4 ml-2 mr-2" />
                  <span className="text-sm">Kartu</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'transfer')}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    data-testid="radio-payment-transfer"
                  />
                  <Calculator className="w-4 h-4 ml-2 mr-2" />
                  <span className="text-sm">Transfer</span>
                </label>
              </div>
            </div>

            {/* Payment Amount (for cash) */}
            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Dibayar:
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  data-testid="input-payment-amount"
                />
                {paymentAmountNum > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{formatRupiah(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dibayar:</span>
                      <span>{formatRupiah(paymentAmountNum)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Kembali:</span>
                      <span className={changeAmount >= 0 ? 'text-green-600' : 'text-red-600'} data-testid="text-change-amount">
                        {formatRupiah(Math.max(0, changeAmount))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-cancel-checkout"
              >
                Batal
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || (paymentMethod === 'cash' && paymentAmountNum < cartTotal)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-process-payment"
              >
                {isProcessing ? 'Memproses...' : 'Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}