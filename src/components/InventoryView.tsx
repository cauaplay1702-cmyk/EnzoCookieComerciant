import React, { useState } from 'react';
import { CookieProduct } from '../types';
import {
  Package,
  Plus,
  Edit2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Check,
  X,
  Flame,
  Power
} from 'lucide-react';

interface InventoryViewProps {
  products: CookieProduct[];
  onAddBatchStock: (productId: string, qty: number) => void;
  onUpdateStock: (productId: string, newQty: number) => void;
  onSaveProduct: (product: Partial<CookieProduct> & { name: string }) => void;
  onToggleActive: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onAddBatchStock,
  onUpdateStock,
  onSaveProduct,
  onToggleActive
}) => {
  const [editingProduct, setEditingProduct] = useState<Partial<CookieProduct> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  // Stats
  const totalStockUnits = products.reduce((acc, p) => acc + (p.active ? p.stockQuantity : 0), 0);
  const lowStockCount = products.filter(p => p.active && p.stockQuantity <= p.minStockAlert).length;
  const totalStockValueCost = products.reduce((acc, p) => acc + (p.active ? p.costPrice * p.stockQuantity : 0), 0);
  const totalStockValueSale = products.reduce((acc, p) => acc + (p.active ? p.salePrice * p.stockQuantity : 0), 0);
  const expectedProfitInStock = totalStockValueSale - totalStockValueCost;

  const categories = ['Todos', 'Tradicional', 'Especial', 'Recheado', 'Mini'];

  const filteredProducts = products.filter(p => {
    if (filterCategory !== 'Todos' && p.category !== filterCategory) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      category: 'Tradicional',
      costPrice: 3.00,
      salePrice: 7.00,
      stockQuantity: 20,
      minStockAlert: 5,
      emoji: '🍪',
      description: '',
      color: '#8B4513',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product: CookieProduct) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      alert('Informe o nome do cookie!');
      return;
    }
    onSaveProduct(editingProduct as CookieProduct);
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <Package className="w-8 h-8 text-[#99582A]" />
            <span>Gestão de Estoque & Fornadas</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Acompanhe o estoque de cada sabor, adicione novas fornadas e controle os custos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-3 px-5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Novo Sabor</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFB703] p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Unidades em Estoque</span>
          <p className="text-4xl font-black tracking-tight text-[#3D2B1F]">{totalStockUnits} <span className="text-xs font-bold uppercase">cookies</span></p>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Alertas de Estoque</span>
          <p className={`text-4xl font-black tracking-tight ${lowStockCount > 0 ? 'text-red-600' : 'text-[#3D2B1F]'}`}>
            {lowStockCount} <span className="text-xs font-bold uppercase text-[#3D2B1F]">sabores</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Valor Total em Venda</span>
          <p className="text-4xl font-black tracking-tight text-[#3D2B1F]">R$ {totalStockValueSale.toFixed(0)}</p>
        </div>

        <div className="bg-[#99582A] text-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-white/80 font-black uppercase tracking-wider">Lucro Futuro</span>
          <p className="text-4xl font-black tracking-tight text-[#FFD700]">R$ {expectedProfitInStock.toFixed(0)}</p>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#3D2B1F] transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#99582A] text-white shadow-[3px_3px_0px_0px_#3D2B1F]'
                : 'bg-white hover:bg-[#FFB703] text-[#3D2B1F]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const unitProfit = product.salePrice - product.costPrice;
          const profitMargin = product.costPrice > 0 ? (unitProfit / product.salePrice) * 100 : 0;
          const isLow = product.stockQuantity <= product.minStockAlert;
          const isZero = product.stockQuantity === 0;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-[2rem] border-4 border-[#3D2B1F] p-5 shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4 flex flex-col justify-between transition-all ${
                !product.active
                  ? 'opacity-50 bg-[#F7EFE5]'
                  : isZero
                  ? 'bg-red-50'
                  : 'bg-white'
              }`}
            >
              {/* Top Details */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#F7EFE5] flex items-center justify-center text-3xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]">
                    {product.emoji || '🍪'}
                  </div>
                  <div>
                    <h3 className="font-black text-[#3D2B1F] text-lg uppercase tracking-tight leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] mt-1">
                      <span className="bg-[#99582A] text-white px-2 py-0.5 rounded-md font-black border border-[#3D2B1F] uppercase text-[10px]">
                        {product.category}
                      </span>
                      {!product.active && (
                        <span className="bg-stone-300 text-[#3D2B1F] px-2 py-0.5 rounded-md font-black uppercase text-[10px] border border-[#3D2B1F]">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 text-[#3D2B1F] bg-[#F7EFE5] hover:bg-[#FFB703] border-2 border-[#3D2B1F] rounded-xl cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#3D2B1F]"
                    title="Editar Sabor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleActive(product.id)}
                    className={`p-2 rounded-xl border-2 border-[#3D2B1F] cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#3D2B1F] ${
                      product.active ? 'bg-white text-[#3D2B1F] hover:bg-stone-200' : 'bg-emerald-400 text-[#3D2B1F]'
                    }`}
                    title={product.active ? 'Desativar Sabor' : 'Ativar Sabor'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price & Profit Info */}
              <div className="grid grid-cols-3 gap-2 bg-[#F7EFE5] p-3 rounded-2xl border-2 border-[#3D2B1F] text-xs text-center">
                <div>
                  <span className="text-[10px] text-[#99582A] block uppercase font-black">Custo</span>
                  <span className="font-black text-[#3D2B1F]">R$ {product.costPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#99582A] block uppercase font-black">Venda</span>
                  <span className="font-black text-[#3D2B1F]">R$ {product.salePrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#99582A] block uppercase font-black">Margem</span>
                  <span className="font-black text-[#3D2B1F]">{profitMargin.toFixed(0)}%</span>
                </div>
              </div>

              {/* Stock Status & Quick Batch Buttons */}
              <div className="space-y-2 pt-2 border-t-2 border-[#3D2B1F]">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span className="text-[#3D2B1F] flex items-center gap-1">
                    {isLow && <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />}
                    Estoque Atual:
                  </span>
                  <span
                    className={`text-base font-black ${
                      isZero
                        ? 'text-red-600'
                        : isLow
                        ? 'text-amber-600'
                        : 'text-[#3D2B1F]'
                    }`}
                  >
                    {product.stockQuantity} un
                  </span>
                </div>

                {/* Batch Increments */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#99582A] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#FFB703]" />
                    Registrar Nova Fornada:
                  </span>
                  <div className="flex items-center gap-2">
                    {[+5, +10, +20].map(qty => (
                      <button
                        key={qty}
                        onClick={() => onAddBatchStock(product.id, qty)}
                        className="flex-1 py-1.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] border-2 border-[#3D2B1F] font-black rounded-xl text-xs cursor-pointer transition-all uppercase shadow-[2px_2px_0px_0px_#3D2B1F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-lg w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F]">
            <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
              <h3 className="text-xl font-black uppercase text-[#3D2B1F]">
                {editingProduct.id ? 'Editar Sabor' : 'Cadastrar Novo Sabor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">Nome do Sabor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cookie Prestígio, Pistache com Choco"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Categoria</label>
                  <select
                    value={editingProduct.category || 'Tradicional'}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  >
                    <option value="Tradicional">Tradicional</option>
                    <option value="Especial">Especial</option>
                    <option value="Recheado">Recheado</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Emoji do Cookie</label>
                  <input
                    type="text"
                    value={editingProduct.emoji || '🍪'}
                    onChange={e => setEditingProduct({ ...editingProduct, emoji: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-center text-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={editingProduct.costPrice || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Venda (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={editingProduct.salePrice || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStockAlert || 5}
                    onChange={e => setEditingProduct({ ...editingProduct, minStockAlert: parseInt(e.target.value) || 5 })}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Ex: Recheado com doce de leite caseiro"
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-5 rounded-xl font-black uppercase bg-[#F7EFE5] border-2 border-[#3D2B1F] text-[#3D2B1F] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl font-black uppercase bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white cursor-pointer transition-colors"
                >
                  Salvar Cookie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
