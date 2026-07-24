import React, { useState, useEffect } from 'react';
import { useCookieStore } from './hooks/useCookieStore';
import { Header } from './components/Header';
import { QuickSaleView } from './components/QuickSaleView';
import { InventoryView } from './components/InventoryView';
import { DebtView } from './components/DebtView';
import { AnalyticsView } from './components/AnalyticsView';
import { RecipeCalculatorView } from './components/RecipeCalculatorView';
import { GoalsView } from './components/GoalsView';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';
import { DigitalMenuModal } from './components/DigitalMenuModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cookie_app_auth') === 'true';
  });
  const [loggedInUser, setLoggedInUser] = useState<string>(() => {
    return localStorage.getItem('cookie_app_user') || 'Enzo Brandão';
  });

  const [activeTab, setActiveTab] = useState<string>('venda');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDigitalMenu, setShowDigitalMenu] = useState<boolean>(false);

  const store = useCookieStore();

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setLoggedInUser(username);
    localStorage.setItem('cookie_app_auth', 'true');
    localStorage.setItem('cookie_app_user', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cookie_app_auth');
    localStorage.removeItem('cookie_app_user');
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#3D2B1F] font-sans flex flex-col selection:bg-[#FFB703] selection:text-[#3D2B1F]">
      {/* Top Fixed Header with Quick Metrics */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayRevenue={store.todayRevenue}
        todaySalesCount={store.todaySalesCount}
        totalPendingDebts={store.totalPendingDebts}
        totalStockCount={store.totalStockCount}
        lowStockCount={store.lowStockCount}
        settings={store.settings}
        onOpenSettings={() => setShowSettings(true)}
        onOpenDigitalMenu={() => setShowDigitalMenu(true)}
        onLogout={handleLogout}
        loggedInUser={loggedInUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'venda' && (
          <QuickSaleView
            products={store.products}
            settings={store.settings}
            onRecordSale={store.recordSale}
            onNavigateToStock={() => setActiveTab('estoque')}
            onSaveProduct={store.saveProduct}
          />
        )}

        {activeTab === 'estoque' && (
          <InventoryView
            products={store.products}
            onAddBatchStock={store.addBatchStock}
            onUpdateStock={store.updateProductStock}
            onSaveProduct={store.saveProduct}
            onToggleActive={store.toggleProductActive}
          />
        )}

        {activeTab === 'fiado' && (
          <DebtView
            debts={store.debts}
            settings={store.settings}
            onPayDebt={store.payDebt}
          />
        )}

        {activeTab === 'relatorios' && (
          <AnalyticsView
            sales={store.sales}
            products={store.products}
            totalRevenue={store.totalRevenue}
            totalCost={store.totalCost}
            totalProfit={store.totalProfit}
          />
        )}

        {activeTab === 'receitas' && (
          <RecipeCalculatorView
            ingredients={store.ingredients}
            recipes={store.recipes}
            onSaveIngredient={store.saveIngredient}
            onSaveRecipe={store.saveRecipe}
          />
        )}

        {activeTab === 'metas' && (
          <GoalsView
            goals={store.goals}
            onSaveGoal={store.saveGoal}
            onAddFunds={store.addGoalFunds}
            onDeleteGoal={store.deleteGoal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#3D2B1F] text-[#FFFBF5] text-xs py-5 text-center border-t-4 border-[#3D2B1F] mt-auto font-black tracking-widest uppercase flex items-center justify-center gap-2">
        <p>
          🍪 COOKIE TRACKER • GESTÃO DE VENDAS NA ESCOLA • COOKIES.
        </p>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={store.settings}
          onClose={() => setShowSettings(false)}
          onUpdateSettings={store.updateSettings}
          onResetAllData={store.resetAllData}
        />
      )}

      {/* Digital Menu Modal */}
      <DigitalMenuModal
        products={store.products}
        settings={store.settings}
        isOpen={showDigitalMenu}
        onClose={() => setShowDigitalMenu(false)}
      />
    </div>
  );
}

