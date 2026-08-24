import React from 'react';
import { ActionHistoryItem } from '../types';
import { RotateCcw, X, Clock, ShoppingBag, Utensils, DollarSign, Package, AlertCircle } from 'lucide-react';

interface ActionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionHistory: ActionHistoryItem[];
  onUndoAction: (actionId: string) => void;
}

export const ActionHistoryModal: React.FC<ActionHistoryModalProps> = ({
  isOpen,
  onClose,
  actionHistory,
  onUndoAction
}) => {
  if (!isOpen) return null;

  const getActionIcon = (type: ActionHistoryItem['type']) => {
    switch (type) {
      case 'sale': return <ShoppingBag className="w-4 h-4 text-[#99582A]" />;
      case 'consumption': return <Utensils className="w-4 h-4 text-[#99582A]" />;
      case 'debt_payment': return <DollarSign className="w-4 h-4 text-emerald-700" />;
      case 'stock_add': return <Package className="w-4 h-4 text-[#3D2B1F]" />;
      default: return <Clock className="w-4 h-4 text-[#99582A]" />;
    }
  };

  const getActionTypeLabel = (type: ActionHistoryItem['type']) => {
    switch (type) {
      case 'sale': return 'Venda';
      case 'consumption': return 'Consumo / Comeu';
      case 'debt_payment': return 'Pagamento Fiado';
      case 'stock_add': return 'Reposição Estoque';
      default: return 'Ação';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#FFFBF5] rounded-[2rem] max-w-xl w-full p-6 space-y-5 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFB703] border-2 border-[#3D2B1F] flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-[#3D2B1F]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#3D2B1F]">
                Histórico de Ações & Desfazer
              </h3>
              <p className="text-[11px] font-bold text-[#99582A] uppercase">
                Cancele ou desfaça vendas, consumos e adições erradas sem perder dados
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

        {/* History List */}
        {actionHistory.length === 0 ? (
          <div className="text-center py-10 bg-[#F7EFE5] rounded-2xl border-2 border-dashed border-[#3D2B1F] p-6 space-y-2">
            <Clock className="w-8 h-8 text-[#99582A] mx-auto opacity-60" />
            <p className="font-black text-sm uppercase text-[#3D2B1F]">
              Nenhuma ação recente no histórico
            </p>
            <p className="text-xs font-bold text-[#99582A] uppercase">
              As ações registradas (vendas, consumos, reposições) aparecerão aqui para poderem ser desfeitas a qualquer momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {actionHistory.map(item => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border-2 border-[#3D2B1F] flex items-center justify-between gap-3 transition-all ${
                    item.undone
                      ? 'bg-stone-200 opacity-60 border-dashed'
                      : 'bg-white shadow-[2px_2px_0px_0px_#3D2B1F] hover:bg-[#F7EFE5]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7EFE5] border border-[#3D2B1F] flex items-center justify-center shrink-0 mt-0.5">
                      {getActionIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-[#FFB703] text-[#3D2B1F] px-1.5 py-0.5 rounded border border-[#3D2B1F]">
                          {getActionTypeLabel(item.type)}
                        </span>
                        <span className="text-[10px] font-bold text-[#99582A]">
                          {dateStr}
                        </span>
                        {item.undone && (
                          <span className="text-[9px] font-black uppercase bg-red-200 text-red-800 px-1.5 py-0.5 rounded">
                            Desfeita
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-black uppercase text-[#3D2B1F] mt-1 ${item.undone ? 'line-through' : ''}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {!item.undone && (
                    <button
                      onClick={() => onUndoAction(item.id)}
                      className="px-3 py-1.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] text-xs font-black uppercase rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Desfazer</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#99582A] hover:bg-[#3D2B1F] text-white font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
