import React, { useState } from 'react';
import { Goal } from '../types';
import {
  Target,
  Plus,
  Trash2,
  DollarSign,
  Trophy,
  CheckCircle2,
  X
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  onSaveGoal: (goal: Partial<Goal> & { title: string; targetAmount: number }) => void;
  onAddFunds: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onSaveGoal,
  onAddFunds,
  onDeleteGoal
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [category, setCategory] = useState<'Equipamento' | 'Estoque' | 'Pessoal' | 'Reserva'>('Equipamento');
  const [icon, setIcon] = useState('🎯');

  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const target = parseFloat(targetAmount.replace(',', '.')) || 0;
    const initial = parseFloat(initialAmount.replace(',', '.')) || 0;

    if (target <= 0) {
      alert('Informe um valor de meta válido!');
      return;
    }

    onSaveGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      category,
      icon
    });

    setShowAddModal(false);
    setGoalTitle('');
    setTargetAmount('');
    setInitialAmount('');
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;

    const amt = parseFloat(depositAmount.replace(',', '.')) || 0;
    if (amt <= 0) {
      alert('Informe um valor válido para guardar!');
      return;
    }

    onAddFunds(selectedGoalForDeposit.id, amt);
    setSelectedGoalForDeposit(null);
    setDepositAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <Target className="w-8 h-8 text-[#99582A]" />
            <span>Metas e Objetivos</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Junte o dinheiro do seu lucro de vendas de cookies para comprar equipamentos ou realizar seus sonhos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white border-4 border-[#3D2B1F] rounded-[2rem] p-12 text-center space-y-3 shadow-[6px_6px_0px_0px_#3D2B1F]">
          <div className="text-5xl">🎯</div>
          <p className="font-black text-[#3D2B1F] text-xl uppercase tracking-tight">Nenhuma meta criada ainda!</p>
          <p className="text-xs font-bold text-[#99582A] uppercase">Crie uma meta como comprar uma batedeira ou juntar R$ 200,00.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const progressPercent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-[2rem] border-4 border-[#3D2B1F] p-6 shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4 flex flex-col justify-between transition-all ${
                  isCompleted ? 'bg-amber-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F7EFE5] flex items-center justify-center text-3xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]">
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-black text-[#3D2B1F] text-lg uppercase tracking-tight leading-tight">
                        {goal.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase bg-[#99582A] text-white px-2.5 py-0.5 rounded-md border border-[#3D2B1F] inline-block mt-1">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
                    title="Excluir Meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Box */}
                <div className="bg-[#F7EFE5] p-4 rounded-2xl border-2 border-[#3D2B1F] space-y-2 text-xs font-black uppercase">
                  <div className="flex justify-between text-[#3D2B1F]">
                    <span>Guardado: R$ {goal.currentAmount.toFixed(2)}</span>
                    <span className="text-[#99582A]">Meta: R$ {goal.targetAmount.toFixed(2)}</span>
                  </div>

                  {/* Bar */}
                  <div className="w-full h-4 bg-white border-2 border-[#3D2B1F] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isCompleted ? 'bg-emerald-400' : 'bg-[#FFB703]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-black text-[#99582A]">
                    <span>{progressPercent.toFixed(0)}% concluído</span>
                    <span>
                      {isCompleted ? (
                        <strong className="text-emerald-700 flex items-center gap-1 font-black">
                          <CheckCircle2 className="w-4 h-4" /> Concluída!
                        </strong>
                      ) : (
                        `Faltam R$ ${remaining.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Deposit Button */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedGoalForDeposit(goal);
                      setDepositAmount('');
                    }}
                    className="w-full py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black uppercase rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Guardar Dinheiro do Lucro</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Goal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-sm w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F]">
            <div className="flex items-center justify-between pb-2 border-b-4 border-[#3D2B1F]">
              <h3 className="font-black text-[#3D2B1F] uppercase text-base">Criar Nova Meta</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">Título da Meta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Batedeira Planetária"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Valor Alvo (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="350,00"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Valor Inicial (R$)</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black uppercase outline-none"
                  >
                    <option value="Equipamento">Equipamento</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Reserva">Reserva</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-center text-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl font-black uppercase bg-[#F7EFE5] border-2 border-[#3D2B1F] text-[#3D2B1F] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-black uppercase bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white cursor-pointer transition-colors"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit Funds */}
      {selectedGoalForDeposit && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-sm w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F]">
            <div className="flex items-center justify-between pb-2 border-b-4 border-[#3D2B1F]">
              <h3 className="font-black text-[#3D2B1F] uppercase text-base">Guardar Dinheiro</h3>
              <button
                onClick={() => setSelectedGoalForDeposit(null)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4 text-xs font-bold">
              <div className="bg-[#F7EFE5] p-3 rounded-xl border-2 border-[#3D2B1F]">
                <p className="font-black text-[#3D2B1F] text-sm uppercase">{selectedGoalForDeposit.title}</p>
                <p className="text-[#99582A] uppercase text-[11px]">Faltam: <strong>R$ {(selectedGoalForDeposit.targetAmount - selectedGoalForDeposit.currentAmount).toFixed(2)}</strong></p>
              </div>

              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                  Valor a depositar agora (R$)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 20,00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full text-lg font-black p-3 rounded-xl border-2 border-[#3D2B1F] bg-white text-[#3D2B1F] outline-none"
                />
              </div>

              <div className="flex gap-2">
                {[10, 20, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="flex-1 py-2 bg-[#F7EFE5] hover:bg-[#FFB703] text-[#3D2B1F] font-black rounded-xl border-2 border-[#3D2B1F] uppercase cursor-pointer"
                  >
                    + R$ {amt}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForDeposit(null)}
                  className="py-2.5 px-4 rounded-xl font-black uppercase bg-[#F7EFE5] border-2 border-[#3D2B1F] text-[#3D2B1F] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-black uppercase bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white cursor-pointer transition-colors"
                >
                  Depositar 🎯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
