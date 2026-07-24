import React, { useState } from 'react';
import {
  CookieProduct,
  PaymentMethod,
  TimeOfDay,
  AppSettings,
  Sale
} from '../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  Banknote,
  Clock,
  User,
  MessageSquare,
  Sparkles,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Menu
} from 'lucide-react';
import { DigitalMenuModal } from './DigitalMenuModal';

interface QuickSaleViewProps {
  products: CookieProduct[];
  settings: AppSettings;
  onRecordSale: (params: {
    items: { product: CookieProduct; quantity: number }[];
    paymentMethod: PaymentMethod;
    customerName?: string;
    customerClass?: string;
    contactPhone?: string;
    timeOfDay: TimeOfDay;
    discount?: number;
    notes?: string;
  }) => Sale | null;
  onNavigateToStock: () => void;
  onSaveProduct?: (product: Partial<CookieProduct> & { name: string }) => void;
}

export const QuickSaleView: React.FC<QuickSaleViewProps> = ({
  products,
  settings,
  onRecordSale,
  onNavigateToStock,
  onSaveProduct
}) => {
  // Cart state: map of productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('intervalo_1');
  const [customerName, setCustomerName] = useState('');
  const [customerClass, setCustomerClass] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Success Modal state
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDigitalMenu, setShowDigitalMenu] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Tradicional');
  const [newProdSalePrice, setNewProdSalePrice] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdEmoji, setNewProdEmoji] = useState('🍪');
  const [newProdDescription, setNewProdDescription] = useState('');

  const activeProducts = products.filter(p => p.active);
  const categories = ['Todos', ...Array.from(new Set(activeProducts.map(p => p.category)))];

  const filteredProducts = activeProducts.filter(p => {
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    return true;
  });

  const getItemQuantity = (productId: string) => cart[productId] || 0;

  const handleUpdateQuantity = (product: CookieProduct, delta: number) => {
    setCart(prev => {
      const current = prev[product.id] || 0;
      const next = current + delta;

      if (next <= 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }

      // Check max available stock
      if (next > product.stockQuantity) {
        alert(`Atenção: Apenas ${product.stockQuantity} unidades de "${product.name}" em estoque!`);
        return prev;
      }

      return { ...prev, [product.id]: next };
    });
  };

  const handleClearCart = () => setCart({});

  // Calculations
  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean) as { product: CookieProduct; quantity: number }[];

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const totalCost = cartItems.reduce((acc, item) => acc + item.product.costPrice * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discount);
  const estimatedProfit = finalTotal - totalCost;

  // Cash change
  const cashNum = parseFloat(cashGiven.replace(',', '.')) || 0;
  const change = paymentMethod === 'dinheiro' ? Math.max(0, cashNum - finalTotal) : 0;

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Selecione pelo menos um cookie para vender!');
      return;
    }

    if (paymentMethod === 'fiado' && !customerName.trim()) {
      alert('Por favor, informe o Nome do Aluno para registrar no Caderninho de Fiado!');
      return;
    }

    const recordedSale = onRecordSale({
      items: cartItems,
      paymentMethod,
      customerName: customerName.trim(),
      customerClass: customerClass.trim(),
      contactPhone: contactPhone.trim(),
      timeOfDay,
      discount,
      notes: notes.trim()
    });

    if (recordedSale) {
      setLastSale(recordedSale);
      // Reset cart and form
      setCart({});
      setCustomerName('');
      setCustomerClass('');
      setContactPhone('');
      setDiscount(0);
      setCashGiven('');
      setNotes('');
    }
  };

  // Quick Preset Discounts
  const applyPresetDiscount = (amount: number) => {
    setDiscount(amount);
  };

  // Generate Receipt Text
  const getReceiptText = (sale: Sale) => {
    const itemsText = sale.items
      .map(i => `• ${i.quantity}x ${i.productName} (R$ ${i.unitPrice.toFixed(2)})`)
      .join('\n');

    return `🍪 *COMPROVANTE DE COMPRA - COOKIES* 🍪
${settings.schoolName ? `📍 ${settings.schoolName}\n` : ''}
${sale.customerName ? `👤 Cliente: ${sale.customerName} (${sale.customerClass || 'Escola'})\n` : ''}
${itemsText}

💰 *Total: R$ ${sale.totalAmount.toFixed(2)}*
💳 Pagamento: ${sale.paymentMethod.toUpperCase()} ${sale.paymentStatus === 'pending_fiado' ? '(Pendente)' : ''}
${settings.pixKey ? `\n📲 Chave Pix: ${settings.pixKey}` : ''}

${settings.customReceiptMessage || 'Obrigado e bom apetite!'}`;
  };

  const handleCopyReceiptText = () => {
    if (!lastSale) return;
    navigator.clipboard.writeText(getReceiptText(lastSale));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const handleSendWhatsAppReceipt = () => {
    if (!lastSale) return;
    const text = encodeURIComponent(getReceiptText(lastSale));
    let url = `https://wa.me/?text=${text}`;
    if (lastSale.customerName && contactPhone) {
      const cleanPhone = contactPhone.replace(/\D/g, '');
      if (cleanPhone) {
        url = `https://wa.me/${cleanPhone}?text=${text}`;
      }
    }
    window.open(url, '_blank');
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Por favor, informe o nome do sabor.');
      return;
    }
    const salePrice = parseFloat(newProdSalePrice.replace(',', '.')) || 0;
    const costPrice = parseFloat(newProdCostPrice.replace(',', '.')) || 0;
    const stockQuantity = parseInt(newProdStock) || 0;

    if (salePrice <= 0) {
      alert('Informe um preço de venda válido.');
      return;
    }

    if (onSaveProduct) {
      onSaveProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        salePrice,
        costPrice,
        stockQuantity,
        emoji: newProdEmoji || '🍪',
        description: newProdDescription.trim(),
        active: true,
        minStockAlert: 5
      });
    }

    // Reset modal state
    setNewProdName('');
    setNewProdSalePrice('');
    setNewProdCostPrice('');
    setNewProdStock('20');
    setNewProdEmoji('🍪');
    setNewProdDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Category Pills & Info Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <span>Caixa do Intervalo</span>
            <span className="text-xs bg-[#FFB703] text-[#3D2B1F] font-black px-3 py-1 rounded-full border-2 border-[#3D2B1F] uppercase tracking-wider">
              Venda Rápida ⚡
            </span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">Toque no cookie para adicionar ao carrinho</p>
        </div>

        {/* Categories & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowDigitalMenu(true)}
            className="px-4 py-2 bg-[#99582A] hover:bg-[#3D2B1F] text-white border-2 border-[#3D2B1F] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Abrir Cardápio Digital / Vitrine para Alunos"
          >
            <Menu className="w-4 h-4 text-[#FFD700]" />
            <span>Cardápio do Dia 📋</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Sabor</span>
          </button>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-[#3D2B1F] ${
                  selectedCategory === cat
                    ? 'bg-[#99582A] text-[#FFFBF5] shadow-[3px_3px_0px_0px_#3D2B1F]'
                    : 'bg-white hover:bg-[#FFB703] text-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Products on Left, Basket/Checkout on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Product Selection Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-[#3D2B1F] rounded-[2rem] p-10 md:p-12 text-center shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
              <CookieProductEmptyIcon />
              <p className="text-[#3D2B1F] font-black text-xl uppercase tracking-tight">
                {selectedCategory !== 'Todos'
                  ? `Nenhum cookie na categoria "${selectedCategory}"`
                  : 'Nenhum cookie cadastrado ainda!'}
              </p>
              <p className="text-xs font-bold text-[#99582A] uppercase max-w-md mx-auto">
                Adicione os sabores de cookies que você faz para começar a vender na escola e registrar seu lucro.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] border-4 border-[#3D2B1F] rounded-2xl text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#3D2B1F] cursor-pointer transition-all flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Sabor de Cookie</span>
                </button>
                <button
                  onClick={onNavigateToStock}
                  className="px-5 py-3 bg-[#F7EFE5] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Ir para Estoque
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(product => {
                const qtyInCart = getItemQuantity(product.id);
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity <= product.minStockAlert;

                return (
                  <div
                    key={product.id}
                    className={`relative rounded-[2rem] p-5 border-4 border-[#3D2B1F] transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-[#F7EFE5] opacity-60'
                        : qtyInCart > 0
                        ? 'bg-[#FFB703] shadow-[8px_8px_0px_0px_#3D2B1F]'
                        : 'bg-white shadow-[6px_6px_0px_0px_#3D2B1F] hover:shadow-[8px_8px_0px_0px_#3D2B1F]'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-black text-[#3D2B1F] bg-[#F7EFE5] border-2 border-[#3D2B1F] px-2.5 py-0.5 rounded-lg uppercase tracking-wider text-[10px]">
                        {product.category}
                      </span>
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase border-2 border-[#3D2B1F] ${
                          isOutOfStock
                            ? 'bg-red-400 text-[#3D2B1F]'
                            : isLowStock
                            ? 'bg-[#FFB703] text-[#3D2B1F] animate-pulse'
                            : 'bg-emerald-300 text-[#3D2B1F]'
                        }`}
                      >
                        {isOutOfStock ? 'Esgotado' : `${product.stockQuantity} em estoque`}
                      </span>
                    </div>

                    {/* Emoji + Title */}
                    <div className="text-center my-2 space-y-1">
                      <div className="text-5xl select-none transform hover:scale-110 transition-transform">
                        {product.emoji || '🍪'}
                      </div>
                      <h3 className="font-black text-[#3D2B1F] text-lg uppercase tracking-tight line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs font-bold text-[#99582A] line-clamp-2 min-h-[2rem]">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price Tag & Action */}
                    <div className="mt-3 pt-3 border-t-2 border-[#3D2B1F] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#99582A] block">Preço</span>
                        <span className="font-black text-[#3D2B1F] text-2xl tracking-tight">
                          R$ {product.salePrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      {isOutOfStock ? (
                        <span className="text-xs font-black uppercase text-red-600">Sem Estoque</span>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-[#3D2B1F]">
                          {qtyInCart > 0 && (
                            <button
                              onClick={() => handleUpdateQuantity(product, -1)}
                              className="w-8 h-8 rounded-lg bg-[#F7EFE5] text-[#3D2B1F] border-2 border-[#3D2B1F] font-black flex items-center justify-center hover:bg-red-300 cursor-pointer active:scale-95 transition-all"
                              title="Remover 1"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}

                          {qtyInCart > 0 ? (
                            <span className="w-6 text-center font-black text-[#3D2B1F] text-sm">
                              {qtyInCart}
                            </span>
                          ) : null}

                          <button
                            onClick={() => handleUpdateQuantity(product, 1)}
                            className={`w-8 h-8 rounded-lg font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all border-2 border-[#3D2B1F] ${
                              qtyInCart > 0
                                ? 'bg-[#99582A] text-white hover:bg-[#3D2B1F]'
                                : 'bg-[#FFB703] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white w-full px-3 text-xs gap-1 uppercase'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            {qtyInCart === 0 && <span className="font-black">ADD</span>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Cart Summary & Checkout Panel (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[2rem] border-4 border-[#3D2B1F] p-6 shadow-[8px_8px_0px_0px_#3D2B1F] space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#99582A]" />
              <h3 className="font-black text-[#3D2B1F] text-xl uppercase tracking-tight">Carrinho de Vendas</h3>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs font-black uppercase text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-[#3D2B1F] space-y-2">
              <div className="text-5xl">🛒</div>
              <p className="text-sm font-black uppercase tracking-tight">Carrinho vazio.</p>
              <p className="text-xs font-bold text-[#99582A]">Toque nos cookies ao lado para vender!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-xs p-3 bg-[#F7EFE5] rounded-xl border-2 border-[#3D2B1F]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{product.emoji}</span>
                    <div>
                      <p className="font-black text-[#3D2B1F] uppercase">{product.name}</p>
                      <p className="text-[11px] font-bold text-[#99582A]">
                        {quantity}x R$ {product.salePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#3D2B1F] text-sm">
                      R$ {(product.salePrice * quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(product, -1)}
                      className="text-[#3D2B1F] hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Discount Presets */}
          {cartItems.length > 0 && (
            <div className="space-y-2 pt-3 border-t-2 border-[#3D2B1F]">
              <span className="text-xs font-black uppercase text-[#99582A] flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#FFB703]" />
                Desconto Rápido (Combo Escolar)
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => applyPresetDiscount(amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 border-[#3D2B1F] transition-all cursor-pointer uppercase ${
                      discount === amt
                        ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                        : 'bg-[#F7EFE5] text-[#3D2B1F] hover:bg-[#FFB703]'
                    }`}
                  >
                    {amt === 0 ? 'Sem desc.' : `- R$ ${amt}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Details Form */}
          <form onSubmit={handleSubmitSale} className="space-y-4 pt-3 border-t-2 border-[#3D2B1F]">
            {/* Time of Day */}
            <div>
              <label className="block text-xs font-black uppercase text-[#3D2B1F] mb-1.5 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#99582A]" />
                Momento da Venda
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'intervalo_1', label: '3 PRIMEIRAS AULAS' },
                  { id: 'intervalo_2', label: '3 AULAS FINAIS' },
                  { id: 'saida', label: 'SAÍDA' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeOfDay(item.id as TimeOfDay)}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-black border-2 border-[#3D2B1F] cursor-pointer uppercase transition-all ${
                      timeOfDay === item.id
                        ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                        : 'bg-[#F7EFE5] text-[#3D2B1F] hover:bg-[#FFB703]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-black uppercase text-[#3D2B1F] mb-1.5 flex items-center gap-1">
                <Banknote className="w-4 h-4 text-[#99582A]" />
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'pix', label: 'PIX', icon: QrCode },
                  { id: 'dinheiro', label: 'DINHEIRO', icon: Banknote },
                  { id: 'fiado', label: 'FIADO 📝', icon: User },
                  { id: 'cartao', label: 'CARTÃO', icon: CheckCircle2 }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border-2 border-[#3D2B1F] flex flex-col items-center gap-1 text-xs font-black uppercase cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'bg-[#FFB703] text-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]'
                        : 'bg-[#F7EFE5] text-[#3D2B1F] hover:bg-white'
                    }`}
                  >
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* IF FIADO -> Customer Details */}
            {paymentMethod === 'fiado' && (
              <div className="bg-[#FFB703] border-4 border-[#3D2B1F] p-4 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_#3D2B1F]">
                <div className="flex items-center gap-1.5 text-[#3D2B1F] font-black text-xs uppercase">
                  <AlertCircle className="w-5 h-5 text-[#3D2B1F]" />
                  <span>Caderninho de Fiado</span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#3D2B1F] mb-1">
                    Nome do Aluno / Amigo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas, Gabriel, Profe Amanda"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-[#3D2B1F] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-black uppercase text-[#3D2B1F] mb-1">
                      Turma / Sala
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 3º B, 2º A"
                      value={customerClass}
                      onChange={e => setCustomerClass(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-[#3D2B1F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-[#3D2B1F] mb-1">
                      WhatsApp (Opção)
                    </label>
                    <input
                      type="text"
                      placeholder="DDD + Número"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-[#3D2B1F] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* IF DINHEIRO -> Change Calculator with Quick Note Buttons */}
            {paymentMethod === 'dinheiro' && (
              <div className="bg-[#F7EFE5] border-4 border-[#3D2B1F] p-4 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_#3D2B1F]">
                <label className="block text-xs font-black uppercase text-[#3D2B1F]">
                  Calculadora de Troco
                </label>

                {/* Quick Cash Note Buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#99582A]">Toque na nota recebida:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 20, 50].map(note => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setCashGiven(note.toString())}
                        className="py-1.5 bg-white hover:bg-[#FFB703] border-2 border-[#3D2B1F] rounded-lg text-xs font-black text-[#3D2B1F] cursor-pointer transition-all active:scale-95"
                      >
                        R$ {note}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase text-[#99582A]">Valor Recebido:</span>
                    <input
                      type="text"
                      placeholder="Ex: 20,00"
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value)}
                      className="w-full text-xs font-black p-2 rounded-xl border-2 border-[#3D2B1F] bg-white text-[#3D2B1F] outline-none"
                    />
                  </div>
                  <div className="flex-1 bg-[#FFB703] p-2 rounded-xl border-2 border-[#3D2B1F] text-center">
                    <span className="text-[10px] text-[#3D2B1F] block uppercase font-black">
                      Troco a dar:
                    </span>
                    <span className="text-lg font-black text-[#3D2B1F]">
                      R$ {change.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Totals Summary */}
            <div className="bg-[#F7EFE5] p-4 rounded-2xl border-2 border-[#3D2B1F] space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-[#3D2B1F]">
                <span>Subtotal ({totalItemsCount} itens):</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Desconto:</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#3D2B1F] font-black text-xl pt-2 border-t-2 border-[#3D2B1F]">
                <span>TOTAL:</span>
                <span className="text-[#3D2B1F]">R$ {finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-[#99582A] uppercase">
                <span>Lucro Estimado nesta Venda:</span>
                <span>+ R$ {estimatedProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Submit Button */}
            <button
              type="submit"
              disabled={cartItems.length === 0}
              className={`w-full py-4 px-4 rounded-2xl font-black text-base uppercase flex items-center justify-center gap-2 border-4 border-[#3D2B1F] transition-all cursor-pointer shadow-[4px_4px_0px_0px_#3D2B1F] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                cartItems.length === 0
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed shadow-none border-stone-400'
                  : paymentMethod === 'fiado'
                  ? 'bg-[#99582A] hover:bg-[#3D2B1F] text-white'
                  : 'bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F]'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>
                {paymentMethod === 'fiado'
                  ? 'Registrar no Caderninho'
                  : `Finalizar Venda (R$ ${finalTotal.toFixed(2)}) 🍪`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Sale Receipt Success Modal */}
      {lastSale && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-md w-full p-6 space-y-5 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F]">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#FFB703] rounded-full flex items-center justify-center mx-auto text-3xl border-4 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]">
                🎉
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-[#3D2B1F]">Venda Registrada!</h3>
              <p className="text-xs font-bold uppercase text-[#99582A]">
                {lastSale.paymentMethod === 'fiado'
                  ? 'Salvo no Caderninho de Fiado com sucesso!'
                  : 'Estoque atualizado e caixa registrado.'}
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-white border-4 border-[#3D2B1F] rounded-2xl p-4 space-y-2 text-xs font-mono shadow-[3px_3px_0px_0px_#3D2B1F]">
              <div className="flex justify-between font-bold border-b-2 border-[#3D2B1F] pb-2">
                <span>Comprovante #{lastSale.id.slice(-4)}</span>
                <span>{new Date(lastSale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {lastSale.customerName && (
                <p className="font-sans font-black text-[#3D2B1F] uppercase">
                  👤 Cliente: {lastSale.customerName} {lastSale.customerClass ? `(${lastSale.customerClass})` : ''}
                </p>
              )}

              <div className="space-y-1 py-2 font-bold">
                {lastSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-[#3D2B1F] flex justify-between font-sans font-black text-base text-[#3D2B1F]">
                <span>Total Pago:</span>
                <span>R$ {lastSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-sans text-xs text-[#99582A]">
                <span>Pagamento:</span>
                <span className="font-black uppercase">{lastSale.paymentMethod}</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleSendWhatsAppReceipt}
                className="w-full py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Enviar Comprovante via WhatsApp
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReceiptText}
                  className="flex-1 py-2.5 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]"
                >
                  {copiedReceipt ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReceipt ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={() => setLastSale(null)}
                  className="flex-1 py-2.5 bg-[#99582A] hover:bg-[#3D2B1F] text-white font-black rounded-xl text-xs uppercase flex items-center justify-center cursor-pointer transition-colors border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]"
                >
                  Próxima Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add New Flavor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-lg w-full p-6 space-y-5 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F]">
            <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#3D2B1F]">Cadastrar Novo Sabor</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewProduct} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Nome do Sabor <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nutella Supreme, Gotas de Choc, Red Velvet"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-[#3D2B1F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Preço de Venda (R$) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7,00"
                    value={newProdSalePrice}
                    onChange={e => setNewProdSalePrice(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#FFB703] font-black text-[#3D2B1F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 3,00"
                    value={newProdCostPrice}
                    onChange={e => setNewProdCostPrice(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-[#3D2B1F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Estoque Inicial (Qtd)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    value={newProdStock}
                    onChange={e => setNewProdStock(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-[#3D2B1F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Categoria
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black uppercase text-[#3D2B1F] outline-none"
                  >
                    <option value="Tradicional">Tradicional</option>
                    <option value="Recheado">Recheado</option>
                    <option value="Especial">Especial</option>
                    <option value="Fit / Vegano">Fit / Vegano</option>
                  </select>
                </div>
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Emoji Representativo
                </label>
                <div className="flex items-center gap-1.5 flex-wrap bg-[#F7EFE5] p-2.5 rounded-xl border-2 border-[#3D2B1F]">
                  {['🍪', '🍫', '🔴', '🖤', '⚪', '🥜', '🍋', '🍓', '🍦', '🍯', '🍩'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewProdEmoji(e)}
                      className={`w-9 h-9 text-xl rounded-lg border-2 border-[#3D2B1F] transition-all cursor-pointer flex items-center justify-center ${
                        newProdEmoji === e ? 'bg-[#FFB703] scale-110 shadow-[2px_2px_0px_0px_#3D2B1F]' : 'bg-white hover:bg-[#FFB703]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                  <input
                    type="text"
                    maxLength={2}
                    value={newProdEmoji}
                    onChange={e => setNewProdEmoji(e.target.value)}
                    className="w-10 h-9 text-center text-lg font-black bg-white rounded-lg border-2 border-[#3D2B1F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Descrição / Ingredientes Especiais
                </label>
                <input
                  type="text"
                  placeholder="Ex: Recheado com Nutella pura e pedaços de avelã"
                  value={newProdDescription}
                  onChange={e => setNewProdDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-[#3D2B1F] outline-none"
                />
              </div>

              <div className="pt-3 flex items-center gap-3 border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] transition-colors"
                >
                  Salvar e Vender 🍪
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Digital Menu Modal */}
      <DigitalMenuModal
        products={products}
        settings={settings}
        isOpen={showDigitalMenu}
        onClose={() => setShowDigitalMenu(false)}
      />
    </div>
  );
};

function CookieProductEmptyIcon() {
  return (
    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
      🍪
    </div>
  );
}
