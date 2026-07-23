import React, { useState } from 'react';
import {
  Cookie,
  ShoppingBag,
  Package,
  BookOpen,
  BarChart3,
  Calculator,
  Target,
  QrCode,
  Settings,
  Check,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { AppSettings } from '../types';
import { CookieLogo } from './CookieLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  todayRevenue: number;
  todaySalesCount: number;
  totalPendingDebts: number;
  totalStockCount: number;
  lowStockCount: number;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  todayRevenue,
  todaySalesCount,
  totalPendingDebts,
  totalStockCount,
  lowStockCount,
  settings,
  onOpenSettings
}) => {
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = () => {
    if (!settings.pixKey) return;
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const navItems = [
    { id: 'venda', label: 'Vender', icon: ShoppingBag, badge: todaySalesCount > 0 ? `${todaySalesCount}` : undefined },
    { id: 'estoque', label: 'Estoque', icon: Package, alert: lowStockCount > 0 },
    { id: 'fiado', label: 'Fiado', icon: BookOpen, badge: totalPendingDebts > 0 ? `R$ ${totalPendingDebts.toFixed(0)}` : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'relatorios', label: 'Finanças', icon: BarChart3 },
    { id: 'receitas', label: 'Receitas', icon: Calculator },
    { id: 'metas', label: 'Metas', icon: Target },
  ];

  return (
    <header className="bg-[#F7EFE5] text-[#3D2B1F] border-b-4 border-[#3D2B1F] sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <CookieLogo size={46} />
          <div>
            <h1 className="font-black text-2xl tracking-tighter uppercase text-[#3D2B1F] flex items-center gap-2">
              COOKIES.
              <span className="text-[10px] bg-[#99582A] text-[#FFFBF5] border border-[#3D2B1F] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                Escola
              </span>
            </h1>
            <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider">
              {settings.sellerName || 'Meu Negócio'} • {settings.schoolName || 'Escola'}
            </p>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 text-xs">
          {/* Today's Sales */}
          <div className="bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] px-3 py-1.5 rounded-xl flex items-center gap-2 font-black text-[#3D2B1F]">
            <span className="uppercase tracking-wider">Hoje:</span>
            <span className="text-sm">R$ {todayRevenue.toFixed(2)}</span>
            <span className="opacity-80 text-[11px]">({todaySalesCount} vds)</span>
          </div>

          {/* Pending Debts */}
          {totalPendingDebts > 0 && (
            <button
              onClick={() => setActiveTab('fiado')}
              className="bg-[#99582A] text-[#FFFBF5] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black hover:bg-[#80461e] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3D2B1F]"
              title="Ver Fiados a Receber"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse border border-[#3D2B1F]"></span>
              <span className="uppercase tracking-wider">Fiado:</span>
              <span className="text-sm">R$ {totalPendingDebts.toFixed(2)}</span>
            </button>
          )}

          {/* Stock Badge */}
          <button
            onClick={() => setActiveTab('estoque')}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] flex items-center gap-1.5 transition-all cursor-pointer font-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3D2B1F] ${
              lowStockCount > 0
                ? 'bg-red-400 text-[#3D2B1F]'
                : 'bg-white text-[#3D2B1F] hover:bg-[#F7EFE5]'
            }`}
          >
            {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-[#3D2B1F] animate-bounce" />}
            <span className="uppercase tracking-wider">Estoque:</span>
            <span className="text-sm">{totalStockCount} un</span>
          </button>

          {/* Pix Quick Copy */}
          {settings.pixKey && (
            <button
              onClick={handleCopyPix}
              className="bg-[#FFB703] hover:bg-yellow-400 text-[#3D2B1F] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3D2B1F]"
              title={`Copiar Chave Pix: ${settings.pixKey}`}
            >
              <QrCode className="w-4 h-4" />
              <span className="uppercase tracking-wider">Pix</span>
              {copiedPix ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-3.5 h-3.5 opacity-80" />}
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-white hover:bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] rounded-xl cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3D2B1F]"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#EAD7C3] border-t-2 border-[#3D2B1F] px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#99582A] text-[#FFFBF5] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]'
                    : 'bg-white/80 hover:bg-white text-[#3D2B1F] border-2 border-[#3D2B1F]/30 hover:border-[#3D2B1F]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD700]' : 'text-[#99582A]'}`} />
                <span>{item.label}</span>

                {item.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-[#3D2B1F] animate-ping absolute -top-1 -right-1" />
                )}

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black border border-[#3D2B1F] ${
                      item.badgeColor || (isActive ? 'bg-[#FFB703] text-[#3D2B1F]' : 'bg-[#99582A] text-white')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
