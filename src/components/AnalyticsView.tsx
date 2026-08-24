import React, { useState } from 'react';
import { Sale, CookieProduct, ConsumptionRecord } from '../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Calendar,
  Award,
  ArrowUpRight,
  ShoppingBag,
  FileText,
  Search,
  Copy,
  Check,
  Clock,
  CreditCard,
  User,
  Utensils,
  Undo2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface AnalyticsViewProps {
  sales: Sale[];
  products: CookieProduct[];
  consumptions?: ConsumptionRecord[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  onDeleteSale?: (saleId: string) => void;
  onDeleteConsumption?: (consumptionId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sales,
  products,
  consumptions = [],
  totalRevenue,
  totalCost,
  totalProfit,
  onDeleteSale,
  onDeleteConsumption
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [activeReportTab, setActiveReportTab] = useState<'vendas' | 'consumo'>('vendas');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // Filter Sales
  const filteredSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    if (timeFilter === 'today' && d < todayStart) return false;
    if (timeFilter === 'week' && d < weekStart) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const customerMatch = s.customerName?.toLowerCase().includes(term) || s.customerClass?.toLowerCase().includes(term);
      const itemMatch = s.items.some(i => i.productName.toLowerCase().includes(term));
      const methodMatch = s.paymentMethod.toLowerCase().includes(term);
      return customerMatch || itemMatch || methodMatch;
    }

    return true;
  });

  // Filter Consumptions
  const filteredConsumptions = consumptions.filter(c => {
    const d = new Date(c.timestamp);
    if (timeFilter === 'today' && d < todayStart) return false;
    if (timeFilter === 'week' && d < weekStart) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const productMatch = c.productName.toLowerCase().includes(term);
      const personMatch = c.personName?.toLowerCase().includes(term);
      const reasonMatch = c.reason.toLowerCase().includes(term);
      return productMatch || personMatch || reasonMatch;
    }

    return true;
  });

  const revenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const cost = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const profit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const totalCookiesEaten = filteredConsumptions.reduce((acc, c) => acc + c.quantity, 0);
  const totalCostOfEaten = filteredConsumptions.reduce((acc, c) => acc + c.totalCost, 0);

  // Helper Labels
  const getTimeLabel = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'intervalo_1': return '3 Primeiras Aulas';
      case 'intervalo_2': return '3 Aulas Finais';
      case 'saida': return 'Saída';
      case 'encomenda': return 'Encomenda';
      default: return 'Outro Horário';
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix 📲';
      case 'dinheiro': return 'Dinheiro 💵';
      case 'fiado': return 'Fiado 📝';
      case 'cartao': return 'Cartão 💳';
      default: return method.toUpperCase();
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'proprio': return '😋 Consumo Próprio';
      case 'degustacao': return '🎁 Degustação';
      case 'cortesia': return '✨ Cortesia';
      case 'perda': return '⚠️ Perda / Quebra';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'proprio': return 'bg-amber-100 text-amber-900 border-amber-400';
      case 'degustacao': return 'bg-blue-100 text-blue-900 border-blue-400';
      case 'cortesia': return 'bg-purple-100 text-purple-900 border-purple-400';
      case 'perda': return 'bg-red-100 text-red-900 border-red-400';
      default: return 'bg-stone-100 text-stone-900 border-stone-400';
    }
  };

  const handleCopyTextReport = () => {
    const periodStr = timeFilter === 'today' ? 'Hoje' : timeFilter === 'week' ? 'Últimos 7 dias' : 'Todo o Período';
    const totalItemsCount = filteredSales.reduce((acc, s) => acc + s.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0);

    const reportText = `📊 *RELATÓRIO FINANCEIRO - COOKIES DA ESCOLA* 🍪
📅 Período: *${periodStr}*

💰 *RESUMO DE VENDAS:*
• Faturamento: *R$ ${revenue.toFixed(2)}* (${filteredSales.length} vendas / ${totalItemsCount} cookies)
• Custo de Produção: *R$ ${cost.toFixed(2)}*
• Lucro Líquido Real: *R$ ${profit.toFixed(2)}*
• Margem de Lucro: *${margin.toFixed(0)}%*

😋 *COOKIES CONSUMIDOS / DEGUSTAÇÃO:*
• Quantidade: *${totalCookiesEaten} cookies*
• Custo Total Absorvido: *R$ ${totalCostOfEaten.toFixed(2)}*

🛒 *ÚLTIMAS VENDAS:*
${filteredSales.slice(-5).reverse().map((s, idx) => {
  const itemsText = s.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
  const dateStr = new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const custStr = s.customerName ? ` (${s.customerName})` : '';
  return `${idx + 1}. [${dateStr}] ${itemsText} - R$ ${s.totalAmount.toFixed(2)} [${getPaymentLabel(s.paymentMethod)}]${custStr}`;
}).join('\n')}`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Product sales breakdown
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
  filteredSales.forEach(s => {
    s.items.forEach(i => {
      if (!productSalesMap[i.productId]) {
        productSalesMap[i.productId] = { name: i.productName, quantity: 0, revenue: 0, profit: 0 };
      }
      productSalesMap[i.productId].quantity += i.quantity;
      productSalesMap[i.productId].revenue += i.total;
      productSalesMap[i.productId].profit += (i.unitPrice - i.unitCost) * i.quantity;
    });
  });

  const productRanking = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

  // Time of Day distribution
  const timeOfDayCounts: Record<string, number> = {
    intervalo_1: 0,
    intervalo_2: 0,
    saida: 0,
    encomenda: 0
  };

  filteredSales.forEach(s => {
    const t = s.timeOfDay || 'intervalo_1';
    if (timeOfDayCounts[t] !== undefined) {
      timeOfDayCounts[t] += s.items.reduce((acc, i) => acc + i.quantity, 0);
    }
  });

  const timeOfDayData = [
    { name: '3 Primeiras Aulas', cookies: timeOfDayCounts.intervalo_1, fill: '#FFB703' },
    { name: '3 Aulas Finais', cookies: timeOfDayCounts.intervalo_2, fill: '#99582A' },
    { name: 'Saída', cookies: timeOfDayCounts.saida, fill: '#6F1D1B' },
    { name: 'Encomenda', cookies: timeOfDayCounts.encomenda, fill: '#DDA15E' }
  ];

  // Payment method distribution
  const paymentCounts: Record<string, number> = { pix: 0, dinheiro: 0, fiado: 0, cartao: 0 };
  filteredSales.forEach(s => {
    if (paymentCounts[s.paymentMethod] !== undefined) {
      paymentCounts[s.paymentMethod] += s.totalAmount;
    }
  });

  const paymentData = [
    { name: 'Pix', value: paymentCounts.pix, color: '#FFB703' },
    { name: 'Dinheiro', value: paymentCounts.dinheiro, color: '#99582A' },
    { name: 'Fiado', value: paymentCounts.fiado, color: '#E76F51' },
    { name: 'Cartão', value: paymentCounts.cartao, color: '#2A9D8F' }
  ].filter(p => p.value > 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#99582A]" />
            <span>Relatórios & Desempenho</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Análise detalhada de faturamento, margem de lucro, horários de pico e consumo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Time Filter Tabs */}
          <div className="bg-white p-1 rounded-2xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                  : 'text-[#3D2B1F] hover:bg-[#F7EFE5]'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                  : 'text-[#3D2B1F] hover:bg-[#F7EFE5]'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-[#99582A] text-white shadow-[2px_2px_0px_0px_#3D2B1F]'
                  : 'text-[#3D2B1F] hover:bg-[#F7EFE5]'
              }`}
            >
              Tudo
            </button>
          </div>

          {/* Copy Report Button */}
          <button
            onClick={handleCopyTextReport}
            className="py-2.5 px-4 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Copiar relatório formatado para WhatsApp"
          >
            {copiedReport ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
            <span>{copiedReport ? 'Copiado p/ Zap!' : 'Copiar Relatório'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFB703] p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Vendas Brutas</span>
          <p className="text-4xl font-black tracking-tight text-[#3D2B1F]">R$ {revenue.toFixed(2)}</p>
          <span className="text-[10px] font-bold text-[#3D2B1F]/80 uppercase block">
            {filteredSales.length} pedidos finalizados
          </span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Custo dos Cookies</span>
          <p className="text-4xl font-black tracking-tight text-[#3D2B1F]">R$ {cost.toFixed(2)}</p>
          <span className="text-[10px] font-bold text-[#99582A] uppercase block">
            Gastos com insumos
          </span>
        </div>

        <div className="bg-[#99582A] text-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-white/80 font-black uppercase tracking-wider">Lucro Líquido</span>
          <p className="text-4xl font-black tracking-tight text-[#FFD700]">R$ {profit.toFixed(2)}</p>
          <span className="text-[10px] font-bold text-white/90 uppercase block">
            Margem real: {margin.toFixed(0)}%
          </span>
        </div>

        <div className="bg-[#F7EFE5] p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs text-[#3D2B1F] font-black uppercase tracking-wider">Consumo & Degustação</span>
          <p className="text-4xl font-black tracking-tight text-[#3D2B1F]">{totalCookiesEaten} <span className="text-xs font-bold uppercase">un</span></p>
          <span className="text-[10px] font-bold text-[#99582A] uppercase block">
            Custo: R$ {totalCostOfEaten.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horários de Pico (Bar Chart) - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#3D2B1F] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#99582A]" />
            <span>Cookies Vendidos por Horário / Recreio</span>
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeOfDayData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#3D2B1F' }} />
                <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#3D2B1F' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '2px solid #3D2B1F',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    color: '#3D2B1F'
                  }}
                />
                <Bar dataKey="cookies" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formas de Pagamento (Pie Chart) - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-[#3D2B1F] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#99582A]" />
            <span>Formas de Pagamento</span>
          </h3>

          {paymentData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs font-bold text-[#99582A] uppercase">
              Sem dados de pagamento no período
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#3D2B1F" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `R$ ${Number(val).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: '#FFFBF5',
                      border: '2px solid #3D2B1F',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      color: '#3D2B1F'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Sabor Mais Vendido Ranking */}
      <div className="bg-[#FFFBF5] rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] p-6 space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#3D2B1F] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFB703]" />
          <span>Ranking dos Sabores Mais Vendidos</span>
        </h3>

        {productRanking.length === 0 ? (
          <p className="text-xs font-bold text-[#99582A] uppercase">Nenhum cookie vendido no período.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {productRanking.map((p, idx) => (
              <div
                key={p.name}
                className="bg-white p-4 rounded-2xl border-3 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#FFB703] border-2 border-[#3D2B1F] font-black text-xs flex items-center justify-center text-[#3D2B1F]">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-black text-sm uppercase text-[#3D2B1F]">{p.name}</h4>
                    <p className="text-[11px] font-bold text-[#99582A] uppercase">
                      {p.quantity} unidades vendidas
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs text-[#3D2B1F] block">
                    R$ {p.revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700">
                    +R$ {p.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABS: VENDAS DETALHADAS VS CONSUMO & PERDAS */}
      <div className="bg-white rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[#3D2B1F] pb-4">
          {/* Tab buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReportTab('vendas')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-2 border-[#3D2B1F] transition-all ${
                activeReportTab === 'vendas'
                  ? 'bg-[#99582A] text-white shadow-[3px_3px_0px_0px_#3D2B1F]'
                  : 'bg-[#F7EFE5] hover:bg-[#FFB703] text-[#3D2B1F]'
              }`}
            >
              🛒 Histórico de Vendas ({filteredSales.length})
            </button>

            <button
              onClick={() => setActiveReportTab('consumo')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-2 border-[#3D2B1F] transition-all ${
                activeReportTab === 'consumo'
                  ? 'bg-[#99582A] text-white shadow-[3px_3px_0px_0px_#3D2B1F]'
                  : 'bg-[#F7EFE5] hover:bg-[#FFB703] text-[#3D2B1F]'
              }`}
            >
              😋 Consumo / Comeu ({filteredConsumptions.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#99582A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no relatório..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F7EFE5] border-2 border-[#3D2B1F] rounded-xl text-xs font-black text-[#3D2B1F] placeholder-[#99582A]/60 outline-none focus:ring-2 focus:ring-[#FFB703]"
            />
          </div>
        </div>

        {/* TAB 1: SALES LIST */}
        {activeReportTab === 'vendas' && (
          <div>
            {filteredSales.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F7EFE5] rounded-2xl border-2 border-dashed border-[#3D2B1F] p-6">
                <ShoppingBag className="w-12 h-12 text-[#99582A] mx-auto opacity-50" />
                <p className="font-black text-base text-[#3D2B1F] uppercase">
                  {searchTerm ? 'Nenhuma venda encontrada para esta busca' : 'Nenhuma venda registrada neste período'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredSales.slice().reverse().map(sale => {
                  const dateObj = new Date(sale.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={sale.id}
                      className="bg-[#FFFBF5] border-3 border-[#3D2B1F] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#3D2B1F] hover:bg-[#F7EFE5] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase">
                          <span className="bg-[#FFB703] text-[#3D2B1F] px-2.5 py-0.5 rounded-lg border border-[#3D2B1F] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate} às {formattedTime}
                          </span>

                          <span className="bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-lg border border-[#3D2B1F]">
                            {getPaymentLabel(sale.paymentMethod)}
                          </span>

                          <span className="bg-[#99582A] text-white px-2.5 py-0.5 rounded-lg border border-[#3D2B1F]">
                            {getTimeLabel(sale.timeOfDay)}
                          </span>

                          {sale.customerName && (
                            <span className="bg-blue-100 text-blue-950 px-2.5 py-0.5 rounded-lg border border-[#3D2B1F] flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {sale.customerName} {sale.customerClass ? `(${sale.customerClass})` : ''}
                            </span>
                          )}
                        </div>

                        {/* Items Sold */}
                        <div className="text-xs font-bold text-[#3D2B1F]">
                          <span className="font-black uppercase text-[#99582A] block text-[10px]">Itens do Pedido:</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                            {sale.items.map((item, idx) => (
                              <span key={idx} className="bg-white px-2 py-1 rounded-md border border-[#3D2B1F]/40 text-xs font-black">
                                {item.quantity}x {item.productName} <span className="text-[#99582A] font-bold">(R$ {item.total.toFixed(2)})</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {sale.notes && (
                          <p className="text-[11px] font-semibold text-[#99582A] italic">
                            Obs: {sale.notes}
                          </p>
                        )}
                      </div>

                      {/* Right Price & Undo Action */}
                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right shrink-0 bg-white border-2 border-[#3D2B1F] p-3 rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F] min-w-[120px]">
                          <span className="text-[10px] font-black uppercase text-[#99582A] block">Total Venda</span>
                          <span className="text-xl font-black text-[#3D2B1F] block">R$ {sale.totalAmount.toFixed(2)}</span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                            + R$ {sale.profit.toFixed(2)} lucro
                          </span>
                        </div>

                        {onDeleteSale && (
                          <button
                            onClick={() => {
                              if (window.confirm('Deseja estornar esta venda? Os cookies serão devolvidos ao estoque.')) {
                                onDeleteSale(sale.id);
                              }
                            }}
                            className="p-2.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-800 border-2 border-[#3D2B1F] rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#3D2B1F] transition-all"
                            title="Estornar / Cancelar esta venda"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONSUMPTION / COMEU LIST */}
        {activeReportTab === 'consumo' && (
          <div>
            {filteredConsumptions.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F7EFE5] rounded-2xl border-2 border-dashed border-[#3D2B1F] p-6">
                <Utensils className="w-12 h-12 text-[#99582A] mx-auto opacity-50" />
                <p className="font-black text-base text-[#3D2B1F] uppercase">
                  Nenhum consumo ou degustação registrada neste período.
                </p>
                <p className="text-xs font-bold text-[#99582A] uppercase">
                  Quando você ou outra pessoa comer um cookie, registre pelo botão "Comeu / Consumo".
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredConsumptions.slice().reverse().map(cons => {
                  const dateObj = new Date(cons.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={cons.id}
                      className="bg-[#FFFBF5] border-3 border-[#3D2B1F] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#3D2B1F] hover:bg-[#F7EFE5] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase">
                          <span className="bg-[#FFB703] text-[#3D2B1F] px-2.5 py-0.5 rounded-lg border border-[#3D2B1F] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate} às {formattedTime}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-lg border font-black ${getReasonColor(cons.reason)}`}>
                            {getReasonLabel(cons.reason)}
                          </span>

                          {cons.personName && (
                            <span className="bg-blue-100 text-blue-950 px-2.5 py-0.5 rounded-lg border border-[#3D2B1F] flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Quem comeu: {cons.personName}
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="font-black text-sm uppercase text-[#3D2B1F]">
                            {cons.quantity}x {cons.productName}
                          </p>
                          {cons.notes && (
                            <p className="text-[11px] font-semibold text-[#99582A] italic mt-0.5">
                              Obs: {cons.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right shrink-0 bg-white border-2 border-[#3D2B1F] p-3 rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F] min-w-[120px]">
                          <span className="text-[10px] font-black uppercase text-[#99582A] block">Custo Absorvido</span>
                          <span className="text-lg font-black text-red-600 block">
                            R$ {cons.totalCost.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-[#99582A]">
                            (R$ {cons.unitCost.toFixed(2)}/un)
                          </span>
                        </div>

                        {onDeleteConsumption && (
                          <button
                            onClick={() => {
                              if (window.confirm('Deseja excluir este registro e devolver os cookies ao estoque?')) {
                                onDeleteConsumption(cons.id);
                              }
                            }}
                            className="p-2.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-800 border-2 border-[#3D2B1F] rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#3D2B1F] transition-all"
                            title="Desfazer e devolver cookies ao estoque"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
