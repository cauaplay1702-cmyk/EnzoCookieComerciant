import React, { useState } from 'react';
import { CookieProduct, ConsumptionReason } from '../types';
import { Utensils, X, Check, AlertCircle, Sparkles, HeartHandshake, Gift, Trash2 } from 'lucide-react';

interface ConsumptionModalProps {
  products: CookieProduct[];
  isOpen: boolean;
  onClose: () => void;
  onRecordConsumption: (params: {
    productId: string;
    quantity: number;
    reason: ConsumptionReason;
    personName?: string;
    notes?: string;
  }) => void;
  initialProductId?: string;
}

export const ConsumptionModal: React.FC<ConsumptionModalProps> = ({
  products,
  isOpen,
  onClose,
  onRecordConsumption,
  initialProductId
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return initialProductId || products[0]?.id || '';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<ConsumptionReason>('consumo_proprio');
  const [personName, setPersonName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const activeProducts = products.filter(p => p.active);
  const currentProduct = products.find(p => p.id === selectedProductId) || activeProducts[0];

  const costImpact = currentProduct ? currentProduct.costPrice * quantity : 0;
  const saleLost = currentProduct ? currentProduct.salePrice * quantity : 0;

  const reasonsList: { id: ConsumptionReason; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'consumo_proprio',
      title: '😋 Consumo Próprio',
      desc: 'Eu mesmo comi ou levei para comer no lanche',
      icon: Utensils,
      color: 'bg-amber-100 border-amber-500 text-amber-950'
    },
    {
      id: 'degustacao',
      title: '🥄 Degustação / Amostra',
      desc: 'Pedaço/unidade dada para potencial cliente provar',
      icon: Sparkles,
      color: 'bg-yellow-100 border-yellow-500 text-yellow-950'
    },
    {
      id: 'cortesia',
      title: '🎁 Cortesia / Presente',
      desc: 'Brinde para professor, amigo ou parceiro',
      icon: Gift,
      color: 'bg-emerald-100 border-emerald-500 text-emerald-950'
    },
    {
      id: 'perda',
      title: '💔 Quebra / Perda',
      desc: 'Cookie quebrou, caiu ou estragou',
      icon: Trash2,
      color: 'bg-rose-100 border-rose-500 text-rose-950'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      alert('Selecione um sabor de cookie válido.');
      return;
    }
    if (quantity <= 0) {
      alert('A quantidade deve ser de pelo menos 1 unidade.');
      return;
    }
    if (currentProduct.stockQuantity < quantity) {
      const confirmProceed = window.confirm(
        `Atenção: O estoque atual é de ${currentProduct.stockQuantity} un e você indicou ${quantity} un consumidas. Deseja continuar mesmo assim?`
      );
      if (!confirmProceed) return;
    }

    onRecordConsumption({
      productId: currentProduct.id,
      quantity,
      reason,
      personName: personName.trim() || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#FFFBF5] rounded-[2rem] max-w-lg w-full p-6 space-y-5 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😋</span>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#3D2B1F]">
                Registrar Consumo / "Comeu"
              </h3>
              <p className="text-[11px] font-bold text-[#99582A] uppercase">
                Subtrai do estoque e calcula o custo real sem afetar o caixa de vendas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer font-black text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {/* Flavor Selection */}
          <div>
            <label className="block font-black uppercase text-[#3D2B1F] mb-1">
              Qual sabor foi consumido? <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeProducts.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`p-2.5 rounded-xl border-2 border-[#3D2B1F] flex items-center gap-2 text-left cursor-pointer transition-all ${
                    selectedProductId === prod.id
                      ? 'bg-[#FFB703] text-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] font-black'
                      : 'bg-white hover:bg-[#F7EFE5] text-[#3D2B1F]'
                  }`}
                >
                  <span className="text-xl">{prod.emoji}</span>
                  <div className="overflow-hidden">
                    <p className="font-black uppercase truncate text-xs">{prod.name}</p>
                    <p className="text-[10px] text-[#99582A] font-bold">
                      Estoque: {prod.stockQuantity} un
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block font-black uppercase text-[#3D2B1F] mb-1">
              Quantidade consumida <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#3D2B1F] cursor-pointer transition-all ${
                    quantity === q
                      ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                      : 'bg-white hover:bg-[#FFB703] text-[#3D2B1F]'
                  }`}
                >
                  {q} {q === 1 ? 'un' : 'uns'}
                </button>
              ))}
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 p-2 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-center text-xs outline-none"
              />
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block font-black uppercase text-[#3D2B1F] mb-1.5">
              Motivo / Destino <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reasonsList.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`p-3 rounded-xl border-2 border-[#3D2B1F] text-left cursor-pointer transition-all ${
                    reason === r.id
                      ? 'bg-[#FFB703] text-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]'
                      : 'bg-white hover:bg-[#F7EFE5]'
                  }`}
                >
                  <p className="font-black text-xs uppercase">{r.title}</p>
                  <p className="text-[10px] text-[#99582A] font-bold mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Person Name and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                Quem comeu / recebeu? (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Eu mesmo, Profe Amanda, Lucas"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-xs text-[#3D2B1F] outline-none"
              />
            </div>
            <div>
              <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                Observação (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Amostra para fechar encomenda"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-bold text-xs text-[#3D2B1F] outline-none"
              />
            </div>
          </div>

          {/* Impact Calculation Preview Box */}
          <div className="bg-[#F7EFE5] border-2 border-[#3D2B1F] p-3.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#99582A] uppercase">Custo dos ingredientes consumidos:</span>
              <span className="font-black text-red-600">R$ {costImpact.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#99582A]">
              <span>Valor que seria de venda:</span>
              <span>R$ {saleLost.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-[#99582A] font-semibold italic pt-1 border-t border-[#3D2B1F]/20">
              💡 Dica: Registrar o que foi comido mantém seu estoque 100% preciso para você saber exatamente quantos cookies ainda tem para vender!
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center gap-3 border-t-2 border-[#3D2B1F]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] transition-colors"
            >
              Confirmar Consumo 🍪
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
