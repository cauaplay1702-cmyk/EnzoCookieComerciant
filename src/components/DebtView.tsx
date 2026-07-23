import React, { useState } from 'react';
import { DebtRecord, PaymentMethod, AppSettings } from '../types';
import {
  BookOpen,
  UserCheck,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  X,
  Smartphone
} from 'lucide-react';

interface DebtViewProps {
  debts: DebtRecord[];
  settings: AppSettings;
  onPayDebt: (debtId: string, amount: number, method: PaymentMethod) => void;
}

export const DebtView: React.FC<DebtViewProps> = ({ debts, settings, onPayDebt }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'settled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<DebtRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('pix');

  const totalPendingAmount = debts
    .filter(d => d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const totalSettledAmount = debts
    .filter(d => d.status === 'settled')
    .reduce((acc, d) => acc + d.originalAmount, 0);

  const filteredDebts = debts.filter(d => {
    if (filterStatus === 'pending' && d.status === 'settled') return false;
    if (filterStatus === 'settled' && d.status !== 'settled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.customerName.toLowerCase().includes(q);
      const matchClass = d.customerClass.toLowerCase().includes(q);
      return matchName || matchClass;
    }

    return true;
  });

  const handleOpenPay = (debt: DebtRecord) => {
    setSelectedDebtForPay(debt);
    setPayAmount(debt.remainingAmount.toString());
    setPayMethod('pix');
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPay) return;

    const amt = parseFloat(payAmount.replace(',', '.')) || 0;
    if (amt <= 0) {
      alert('Informe um valor de pagamento válido!');
      return;
    }

    if (amt > selectedDebtForPay.remainingAmount) {
      alert(`O valor de pagamento não pode ser maior que a dívida restante (R$ ${selectedDebtForPay.remainingAmount.toFixed(2)})!`);
      return;
    }

    onPayDebt(selectedDebtForPay.id, amt, payMethod);
    setSelectedDebtForPay(null);
  };

  const getWhatsAppMessage = (debt: DebtRecord) => {
    const text = `Oi ${debt.customerName}! Tudo bem? 🍪
Passando só pra lembrar do cookie (${debt.notes || 'escola'}) no valor de *R$ ${debt.remainingAmount.toFixed(2)}*.

${settings.pixKey ? `📲 Minha Chave Pix (${settings.pixKeyType.toUpperCase()}): *${settings.pixKey}*` : ''}

Qualquer dúvida me avisa no intervalo! Valeu! 👍`;

    return encodeURIComponent(text);
  };

  const handleOpenWhatsApp = (debt: DebtRecord) => {
    const textMsg = getWhatsAppMessage(debt);
    let url = `https://wa.me/?text=${textMsg}`;
    if (debt.contactPhone) {
      const cleanPhone = debt.contactPhone.replace(/\D/g, '');
      if (cleanPhone) {
        url = `https://wa.me/${cleanPhone}?text=${textMsg}`;
      }
    }
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#99582A]" />
            <span>Caderninho de Fiado</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Gerencie os pagamentos pendentes de amigos e alunos com lembretes automáticos para o WhatsApp.
          </p>
        </div>

        {/* Total Metric Badge */}
        <div className="bg-[#FFB703] text-[#3D2B1F] p-4 rounded-2xl flex items-center gap-5 border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F]">
          <div>
            <span className="text-[10px] text-[#3D2B1F] font-black uppercase tracking-wider block">Total a Receber</span>
            <span className="text-3xl font-black tracking-tight">R$ {totalPendingAmount.toFixed(2)}</span>
          </div>
          <div className="text-right border-l-2 border-[#3D2B1F] pl-4 text-xs font-bold">
            <span className="uppercase text-[10px] block text-[#99582A]">Já recebido</span>
            <p className="font-black text-[#3D2B1F]">R$ {totalSettledAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-[#3D2B1F] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="BUSCAR POR ALUNO OU TURMA..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-[#F7EFE5] border-2 border-[#3D2B1F] outline-none font-black text-[#3D2B1F] placeholder:text-[#99582A]/60"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'pending', label: 'Pendentes' },
            { id: 'settled', label: 'Quitados' },
            { id: 'all', label: 'Todos' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#3D2B1F] transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-[#99582A] text-white shadow-[3px_3px_0px_0px_#3D2B1F]'
                  : 'bg-[#F7EFE5] hover:bg-[#FFB703] text-[#3D2B1F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white border-4 border-[#3D2B1F] rounded-[2rem] p-12 text-center space-y-3 shadow-[6px_6px_0px_0px_#3D2B1F]">
          <div className="text-5xl">🎉</div>
          <p className="font-black text-[#3D2B1F] text-xl uppercase tracking-tight">Nenhum fiado encontrado!</p>
          <p className="text-xs font-bold text-[#99582A] uppercase">Todos os cookies foram pagos ou a busca não retornou resultados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDebts.map(debt => {
            const isSettled = debt.status === 'settled';
            const isPartial = debt.status === 'partially_paid';

            return (
              <div
                key={debt.id}
                className={`rounded-[2rem] border-4 border-[#3D2B1F] p-5 shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4 flex flex-col justify-between transition-all ${
                  isSettled
                    ? 'bg-[#F7EFE5] opacity-75'
                    : isPartial
                    ? 'bg-amber-50'
                    : 'bg-white'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-[#3D2B1F] text-lg uppercase tracking-tight">
                      {debt.customerName}
                    </h3>
                    <p className="text-xs font-bold text-[#99582A] uppercase mt-0.5">
                      Turma: <span className="text-[#3D2B1F] font-black">{debt.customerClass || 'Escola'}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase border-2 border-[#3D2B1F] ${
                      isSettled
                        ? 'bg-emerald-400 text-[#3D2B1F]'
                        : isPartial
                        ? 'bg-[#FFB703] text-[#3D2B1F]'
                        : 'bg-red-400 text-[#3D2B1F]'
                    }`}
                  >
                    {isSettled ? 'Quitado' : isPartial ? 'Parcial' : 'Pendente'}
                  </span>
                </div>

                {/* Amount Progress */}
                <div className="bg-[#F7EFE5] p-4 rounded-2xl border-2 border-[#3D2B1F] space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span className="text-[#99582A]">Valor Original:</span>
                    <span className="text-[#3D2B1F]">R$ {debt.originalAmount.toFixed(2)}</span>
                  </div>

                  {debt.amountPaid > 0 && (
                    <div className="flex justify-between text-xs font-black uppercase text-emerald-700">
                      <span>Já Pago:</span>
                      <span>+ R$ {debt.amountPaid.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-black uppercase text-[#3D2B1F] pt-2 border-t-2 border-[#3D2B1F]">
                    <span>Ainda Deve:</span>
                    <span className={`text-sm ${isSettled ? 'text-emerald-700' : 'text-red-600'}`}>
                      R$ {debt.remainingAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-white border-2 border-[#3D2B1F] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFB703] rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (debt.amountPaid / debt.originalAmount) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Dates & Notes */}
                <div className="text-[11px] font-bold text-[#99582A] space-y-1">
                  <p className="flex items-center gap-1 uppercase">
                    <Clock className="w-3.5 h-3.5 text-[#3D2B1F]" />
                    <span>Cadastrado: {new Date(debt.createdAt).toLocaleDateString()}</span>
                  </p>
                  {debt.notes && (
                    <p className="bg-white p-2 rounded-xl border-2 border-[#3D2B1F] text-[#3D2B1F] font-bold">
                      "{debt.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!isSettled && (
                  <div className="pt-2 border-t-2 border-[#3D2B1F] flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPay(debt)}
                      className="flex-1 py-2.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Baixar Valor</span>
                    </button>

                    <button
                      onClick={() => handleOpenWhatsApp(debt)}
                      className="py-2.5 px-3 bg-[#99582A] hover:bg-[#3D2B1F] text-white border-2 border-[#3D2B1F] font-black rounded-xl text-xs uppercase shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1 cursor-pointer transition-all"
                      title="Enviar Lembrete no WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Cobrar</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Receber Pagamento */}
      {selectedDebtForPay && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-sm w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F]">
            <div className="flex items-center justify-between pb-2 border-b-4 border-[#3D2B1F]">
              <h3 className="font-black text-[#3D2B1F] uppercase text-base">Receber Pagamento</h3>
              <button
                onClick={() => setSelectedDebtForPay(null)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-4 text-xs font-bold">
              <div className="bg-[#F7EFE5] p-3 rounded-xl border-2 border-[#3D2B1F]">
                <p className="font-black text-[#3D2B1F] text-sm uppercase">{selectedDebtForPay.customerName}</p>
                <p className="text-[#99582A] uppercase text-[11px]">Dívida Restante: <strong className="text-red-600 text-sm">R$ {selectedDebtForPay.remainingAmount.toFixed(2)}</strong></p>
              </div>

              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                  Valor a Pagamento (R$)
                </label>
                <input
                  type="text"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full text-lg font-black p-3 rounded-xl border-2 border-[#3D2B1F] bg-white text-[#3D2B1F] outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                  Forma de Recebimento
                </label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black uppercase outline-none"
                >
                  <option value="pix">Pix</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPay(null)}
                  className="py-2.5 px-4 rounded-xl font-black uppercase bg-[#F7EFE5] border-2 border-[#3D2B1F] text-[#3D2B1F] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-black uppercase bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white cursor-pointer transition-colors"
                >
                  Confirmar 💰
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
