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
import { ToastUndoBanner } from './components/ToastUndoBanner';
import { ActionHistoryModal } from './components/ActionHistoryModal';

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
  const [showActionHistory, setShowActionHistory] = useState<boolean>(false);

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
        actionHistoryCount={store.actionHistory.length}
        settings={store.settings}
        onOpenSettings={() => setShowSettings(true)}
        onOpenDigitalMenu={() => setShowDigitalMenu(true)}
        onOpenActionHistory={() => setShowActionHistory(true)}
        onUndoLastAction={store.undoLastAction}
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
            onRecordConsumption={store.recordConsumption}
          />
        )}

        {activeTab === 'estoque' && (
          <InventoryView
            products={store.products}
            onAddBatchStock={store.addBatchStock}
            onUpdateStock={store.updateProductStock}
            onSaveProduct={store.saveProduct}
            onToggleActive={store.toggleProductActive}
            onDeleteProduct={store.deleteProduct}
            onRecordConsumption={store.recordConsumption}
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
            consumptions={store.consumptions}
            totalRevenue={store.totalRevenue}
            totalCost={store.totalCost}
            totalProfit={store.totalProfit}
            onDeleteSale={store.deleteSale}
            onDeleteConsumption={store.deleteConsumption}
          />
        )}

        {activeTab === 'receitas' && (
          <RecipeCalculatorView
            ingredients={store.ingredients}
            recipes={store.recipes}
            products={store.products}
            onSaveIngredient={store.saveIngredient}
            onDeleteIngredient={store.deleteIngredient}
            onSaveRecipe={store.saveRecipe}
            onDeleteRecipe={store.deleteRecipe}
            onDuplicateRecipe={store.duplicateRecipe}
            onApplyRecipeCostToProduct={store.applyRecipeCostToProduct}
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

      {/* Undo Toast Notification (Floating at bottom-left) */}
      <ToastUndoBanner
        toast={store.toastNotification}
        onUndo={store.undoAction}
        onDismiss={store.dismissToast}
      />

      {/* Action History / Desfazer Modal */}
      <ActionHistoryModal
        isOpen={showActionHistory}
        onClose={() => setShowActionHistory(false)}
        actionHistory={store.actionHistory}
        onUndoAction={store.undoAction}
      />

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
