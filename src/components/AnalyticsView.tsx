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
  ShoppingBag
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const filteredSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    if (timeFilter === 'today') return d >= todayStart;
    if (timeFilter === 'week') return d >= weekStart;
    return true;
  });

  const revenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const cost = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const profit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

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

  // 3. Sales by Time of Day (Intervalos)
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
            <span>Finanças e Desempenho</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Acompanhe o lucro real do seu negócio de cookies, sabores mais vendidos e forma de pagamento.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F]">
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'week', label: '7 Dias' },
            { id: 'today', label: 'Hoje' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
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
          🕒 Desempenho por Horário de Recreio
        </h3>
        <p className="text-xs font-bold text-[#99582A] uppercase">
          Descubra qual intervalo escolar traz mais vendas para reforçar o estoque!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">1º Recreio (Manhã)</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {(timeOfDayMap.intervalo_1 || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">2º Recreio (Tarde)</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {(timeOfDayMap.intervalo_2 || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] text-center space-y-1">
            <span className="text-xs text-[#99582A] font-black uppercase block">Saída / Encomenda</span>
            <p className="text-2xl font-black text-[#3D2B1F]">
              R$ {((timeOfDayMap.saida || 0) + (timeOfDayMap.encomenda || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
