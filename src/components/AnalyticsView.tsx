import React, { useState } from 'react';
import { Sale, CookieProduct } from '../types';
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
  Printer
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
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sales,
  products,
  totalRevenue,
  totalCost,
  totalProfit
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

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

  const revenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const cost = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const profit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

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

  const handleCopyTextReport = () => {
    const periodStr = timeFilter === 'today' ? 'Hoje' : timeFilter === 'week' ? 'Últimos 7 dias' : 'Todo o Período';
    const totalItemsCount = filteredSales.reduce((acc, s) => acc + s.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0);

    const reportText = `📊 *RELATÓRIO DE VENDAS - COOKIES DA ESCOLA* 🍪
📅 Período: *${periodStr}*

💰 *RESUMO FINANCEIRO:*
• Vendas Totais: *R$ ${revenue.toFixed(2)}* (${filteredSales.length} vendas / ${totalItemsCount} cookies)
• Custo de Ingredientes: *R$ ${cost.toFixed(2)}*
• Lucro Líquido Real: *R$ ${profit.toFixed(2)}*
• Margem de Lucro: *${margin.toFixed(0)}%*

🛒 *ÚLTIMAS VENDAS REGISTRADAS:*
${filteredSales.slice(0, 10).map((s, idx) => {
  const itemsText = s.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
  const dateStr = new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const custStr = s.customerName ? ` (${s.customerName})` : '';
  return `${idx + 1}. [${dateStr}] ${itemsText} - R$ ${s.totalAmount.toFixed(2)} [${getPaymentLabel(s.paymentMethod)}]${custStr}`;
}).join('\n')}

✨ *Gerado pelo Sistema Cookies.*`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // 1. Chart Data: Sales per Product Flavor
  const productSalesMap: Record<string, { name: string; totalRevenue: number; totalQuantity: number; profit: number }> = {};

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = {
          name: item.productName,
          totalRevenue: 0,
          totalQuantity: 0,
          profit: 0
        };
      }
      productSalesMap[item.productName].totalRevenue += item.total;
      productSalesMap[item.productName].totalQuantity += item.quantity;
      productSalesMap[item.productName].profit += (item.unitPrice - item.unitCost) * item.quantity;
    });
  });

  const chartDataByProduct = Object.values(productSalesMap).sort((a, b) => b.totalQuantity - a.totalQuantity);

  // 2. Chart Data: Payment Methods Breakdown
  const paymentMethodMap: Record<string, number> = {
    pix: 0,
    dinheiro: 0,
    fiado: 0,
    cartao: 0
  };

  filteredSales.forEach(s => {
    paymentMethodMap[s.paymentMethod] = (paymentMethodMap[s.paymentMethod] || 0) + s.totalAmount;
  });

  const pieDataPayment = [
    { name: 'Pix', value: paymentMethodMap.pix, color: '#10B981' },
    { name: 'Dinheiro', value: paymentMethodMap.dinheiro, color: '#059669' },
    { name: 'Fiado 📝', value: paymentMethodMap.fiado, color: '#F59E0B' },
    { name: 'Cartão', value: paymentMethodMap.cartao, color: '#3B82F6' }
  ].filter(d => d.value > 0);

  // 3. Sales by Time of Day
  const timeOfDayMap: Record<string, number> = {
    intervalo_1: 0,
    intervalo_2: 0,
    saida: 0,
    encomenda: 0,
    outro: 0
  };

  filteredSales.forEach(s => {
    timeOfDayMap[s.timeOfDay] = (timeOfDayMap[s.timeOfDay] || 0) + s.totalAmount;
  });

  const topSeller = chartDataByProduct[0];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#99582A]" />
            <span>Relatório & Finanças</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Histórico completo de vendas, relatórios para cópia e análise de lucro real.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyTextReport}
            className="px-4 py-2.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#3D2B1F] flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {copiedReport ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
            <span>{copiedReport ? 'Copiado!' : 'Copiar Resumo WhatsApp'}</span>
          </button>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border-4 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]">
            {[
              { id: 'all', label: 'Tudo' },
              { id: 'week', label: '7 Dias' },
              { id: 'today', label: 'Hoje' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === tab.id
                    ? 'bg-[#99582A] text-white border-2 border-[#3D2B1F]'
                    : 'text-[#3D2B1F] hover:bg-[#FFB703]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs font-black uppercase text-[#99582A] tracking-wider">Faturamento Bruto</span>
          <p className="text-3xl font-black tracking-tight text-[#3D2B1F]">R$ {revenue.toFixed(0)}</p>
          <span className="text-[10px] font-bold uppercase text-[#3D2B1F]">{filteredSales.length} vendas</span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs font-black uppercase text-[#99582A] tracking-wider">Custo Total</span>
          <p className="text-3xl font-black tracking-tight text-red-600">R$ {cost.toFixed(0)}</p>
          <span className="text-[10px] font-bold uppercase text-[#3D2B1F]">Ingredientes & Embalagem</span>
        </div>

        <div className="bg-[#FFB703] p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs font-black uppercase text-[#3D2B1F] tracking-wider">Lucro Líquido</span>
          <p className="text-3xl font-black tracking-tight text-[#3D2B1F]">R$ {profit.toFixed(0)}</p>
          <span className="text-[10px] font-bold uppercase text-[#3D2B1F]">
            Margem: <strong className="text-[#3D2B1F] font-black">{margin.toFixed(0)}%</strong>
          </span>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-1">
          <span className="text-xs font-black uppercase text-[#99582A] tracking-wider">Top Sabor</span>
          <p className="text-lg font-black uppercase text-[#3D2B1F] truncate">
            {topSeller ? topSeller.name : 'Nenhum'}
          </p>
          <span className="text-[10px] font-bold uppercase text-[#3D2B1F]">
            {topSeller ? `${topSeller.totalQuantity} un vendidas` : '-'}
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Revenue & Quantity Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#3D2B1F] uppercase text-lg flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#99582A]" />
              <span>Vendas por Sabor de Cookie</span>
            </h3>
            <span className="text-xs text-[#99582A] font-black uppercase">Unidades</span>
          </div>

          {chartDataByProduct.length === 0 ? (
            <div className="py-12 text-center text-[#99582A] font-bold text-xs uppercase">
              Nenhuma venda registrada neste período.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByProduct} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#3D2B1F', fontWeight: 'bold' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#3D2B1F', fontWeight: 'bold' }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === 'totalQuantity' ? `${val} unidades` : `R$ ${val.toFixed(2)}`,
                      name === 'totalQuantity' ? 'Qtd Vendida' : 'Lucro'
                    ]}
                    contentStyle={{ backgroundColor: '#FFFBF5', borderRadius: '16px', border: '3px solid #3D2B1F', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="totalQuantity" fill="#99582A" radius={[6, 6, 0, 0]} name="Qtd Vendida" />
                  <Bar dataKey="profit" fill="#FFB703" radius={[6, 6, 0, 0]} name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Payment Methods Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
          <h3 className="font-black text-[#3D2B1F] uppercase text-lg flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-[#99582A]" />
            <span>Formas de Pagamento</span>
          </h3>

          {pieDataPayment.length === 0 ? (
            <div className="py-12 text-center text-[#99582A] font-bold text-xs uppercase">
              Sem dados suficientes.
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataPayment}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieDataPayment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#3D2B1F" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Total']}
                    contentStyle={{ backgroundColor: '#FFFBF5', borderRadius: '16px', border: '3px solid #3D2B1F', fontWeight: 'bold' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Sales by School Shifts */}
      <div className="bg-[#F7EFE5] rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] p-6 space-y-4">
        <h3 className="font-black text-[#3D2B1F] uppercase text-lg">
          🕒 Desempenho por Horário da Escola
        </h3>
        <p className="text-xs font-bold text-[#99582A] uppercase">
          Descubra qual momento traz mais vendas para reforçar o estoque!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">3 Primeiras Aulas</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {(timeOfDayMap.intervalo_1 || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">3 Aulas Finais</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {(timeOfDayMap.intervalo_2 || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">Saída</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {((timeOfDayMap.saida || 0) + (timeOfDayMap.encomenda || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* RELATÓRIO DETALHADO DE VENDAS (LIST & SEARCH) */}
      <div className="bg-white rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-[#3D2B1F] pb-4">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#3D2B1F] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#99582A]" />
              <span>Relatório Detalhado de Vendas</span>
            </h3>
            <p className="text-xs font-bold text-[#99582A] uppercase mt-0.5">
              Lista de todas as vendas finalizadas com detalhes do pedido, cliente e pagamento
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#99582A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, cookie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F7EFE5] border-2 border-[#3D2B1F] rounded-xl text-xs font-black text-[#3D2B1F] placeholder-[#99582A]/60 outline-none focus:ring-2 focus:ring-[#FFB703]"
            />
          </div>
        </div>

        {/* Sales Records List */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-[#F7EFE5] rounded-2xl border-2 border-dashed border-[#3D2B1F] p-6">
            <ShoppingBag className="w-12 h-12 text-[#99582A] mx-auto opacity-50" />
            <p className="font-black text-base text-[#3D2B1F] uppercase">
              {searchTerm ? 'Nenhuma venda encontrada para esta busca' : 'Nenhuma venda registrada neste período'}
            </p>
            <p className="text-xs font-bold text-[#99582A] uppercase">
              {searchTerm ? 'Tente pesquisar com outro nome ou palavra' : 'Realize novas vendas na aba "Vender" para aparecerem no relatório'}
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
                    {/* Top Row Badges */}
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

                  {/* Right Price & Profit Box */}
                  <div className="text-right shrink-0 bg-white border-2 border-[#3D2B1F] p-3 rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F] min-w-[120px] self-end md:self-center">
                    <span className="text-[10px] font-black uppercase text-[#99582A] block">Total Venda</span>
                    <span className="text-xl font-black text-[#3D2B1F] block">R$ {sale.totalAmount.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                      + R$ {sale.profit.toFixed(2)} lucro
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

