import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CookieProduct,
  Sale,
  DebtRecord,
  Ingredient,
  Recipe,
  Goal,
  AppSettings,
  PaymentMethod,
  TimeOfDay,
  ConsumptionRecord,
  ActionHistoryItem
} from '../types';
import {
  initialProducts,
  initialSales,
  initialDebts,
  initialIngredients,
  initialRecipes,
  initialGoals,
  initialSettings
} from '../data/mockData';

const STORAGE_KEY = 'cookie_tracker_app_data_v4';

interface StoreData {
  products: CookieProduct[];
  sales: Sale[];
  debts: DebtRecord[];
  consumptions: ConsumptionRecord[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  goals: Goal[];
  settings: AppSettings;
  actionHistory: ActionHistoryItem[];
}

export function useCookieStore() {
  const [data, setData] = useState<StoreData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          products: parsed.products && parsed.products.length > 0 ? parsed.products : initialProducts,
          sales: parsed.sales || initialSales,
          debts: parsed.debts || initialDebts,
          consumptions: parsed.consumptions || [],
          ingredients: parsed.ingredients && parsed.ingredients.length > 0 ? parsed.ingredients : initialIngredients,
          recipes: parsed.recipes && parsed.recipes.length > 0 ? parsed.recipes : initialRecipes,
          goals: parsed.goals || initialGoals,
          settings: parsed.settings || initialSettings,
          actionHistory: parsed.actionHistory || []
        };
      }
    } catch (e) {
      console.error('Erro ao carregar dados do LocalStorage:', e);
    }
    return {
      products: initialProducts,
      sales: initialSales,
      debts: initialDebts,
      consumptions: [],
      ingredients: initialIngredients,
      recipes: initialRecipes,
      goals: initialGoals,
      settings: initialSettings,
      actionHistory: []
    };
  });

  // Floating Toast with Undo
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    message: string;
    actionId: string;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
  }, [data]);

  // Helper to trigger toast with undo
  const triggerUndoToast = (message: string, actionId: string) => {
    setToastNotification({
      id: `toast-${Date.now()}`,
      message,
      actionId
    });
  };

  const dismissToast = () => setToastNotification(null);

  // --- REGISTRAR VENDA ---
  const recordSale = (params: {
    items: { product: CookieProduct; quantity: number }[];
    paymentMethod: PaymentMethod;
    customerName?: string;
    customerClass?: string;
    contactPhone?: string;
    timeOfDay: TimeOfDay;
    discount?: number;
    notes?: string;
  }) => {
    const {
      items,
      paymentMethod,
      customerName = '',
      customerClass = '',
      contactPhone = '',
      timeOfDay,
      discount = 0,
      notes = ''
    } = params;

    if (items.length === 0) return null;

    let totalAmount = 0;
    let totalCost = 0;

    const saleItems = items.map(({ product, quantity }) => {
      const itemTotal = product.salePrice * quantity;
      const itemCost = product.costPrice * quantity;
      totalAmount += itemTotal;
      totalCost += itemCost;

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.salePrice,
        unitCost: product.costPrice,
        total: itemTotal
      };
    });

    const finalAmount = Math.max(0, totalAmount - discount);
    const profit = finalAmount - totalCost;
    const isFiado = paymentMethod === 'fiado';
    const saleId = `sale-${Date.now()}`;
    const actionId = `action-${Date.now()}`;

    const newSale: Sale = {
      id: saleId,
      timestamp: new Date().toISOString(),
      items: saleItems,
      totalAmount: finalAmount,
      totalCost,
      profit,
      discount,
      paymentMethod,
      paymentStatus: isFiado ? 'pending_fiado' : 'paid',
      customerName,
      customerClass,
      timeOfDay,
      notes
    };

    // Update Stock
    const updatedProducts = data.products.map(p => {
      const found = items.find(i => i.product.id === p.id);
      if (found) {
        return {
          ...p,
          stockQuantity: Math.max(0, p.stockQuantity - found.quantity)
        };
      }
      return p;
    });

    // Handle Fiado/Debt creation if needed
    let updatedDebts = [...data.debts];
    let createdDebtId: string | undefined = undefined;
    if (isFiado && finalAmount > 0) {
      createdDebtId = `debt-${Date.now()}`;
      const newDebt: DebtRecord = {
        id: createdDebtId,
        saleId,
        customerName: customerName || 'Cliente Anônimo',
        customerClass: customerClass || 'Não informada',
        contactPhone,
        originalAmount: finalAmount,
        amountPaid: 0,
        remainingAmount: finalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes,
        paymentHistory: []
      };
      updatedDebts = [newDebt, ...updatedDebts];
    }

    const actionItem: ActionHistoryItem = {
      id: actionId,
      type: 'sale',
      description: `Venda de ${items.reduce((s, i) => s + i.quantity, 0)} cookie(s) - R$ ${finalAmount.toFixed(2)}`,
      timestamp: new Date().toISOString(),
      data: {
        saleId,
        itemsToRestore: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        debtId: createdDebtId
      }
    };

    setData(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales],
      products: updatedProducts,
      debts: updatedDebts,
      actionHistory: [actionItem, ...prev.actionHistory.slice(0, 49)]
    }));

    triggerUndoToast(`Venda de R$ ${finalAmount.toFixed(2)} registrada!`, actionId);

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {
      // ignore
    }

    return newSale;
  };

  // --- CANCELAR / ESTORNAR VENDA ---
  const deleteSale = (saleId: string) => {
    const saleToDelete = data.sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // Restore stock
    const updatedProducts = data.products.map(p => {
      const soldItem = saleToDelete.items.find(i => i.productId === p.id);
      if (soldItem) {
        return { ...p, stockQuantity: p.stockQuantity + soldItem.quantity };
      }
      return p;
    });

    // Remove associated fiado
    const updatedDebts = data.debts.filter(d => d.saleId !== saleId);

    setData(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.id !== saleId),
      products: updatedProducts,
      debts: updatedDebts,
      actionHistory: prev.actionHistory.filter(a => a.data?.saleId !== saleId)
    }));
  };

  // --- REGISTRAR CONSUMO PRÓPRIO / DEGUSTAÇÃO / PERDA ---
  const recordConsumption = (params: {
    productId: string;
    quantity: number;
    reason: 'proprio' | 'degustacao' | 'cortesia' | 'perda';
    personName?: string;
    notes?: string;
  }) => {
    const { productId, quantity, reason, personName = '', notes = '' } = params;
    const product = data.products.find(p => p.id === productId);
    if (!product || quantity <= 0) return null;

    const unitCost = product.costPrice;
    const totalCost = unitCost * quantity;
    const consumptionId = `cons-${Date.now()}`;
    const actionId = `action-${Date.now()}`;

    const newConsumption: ConsumptionRecord = {
      id: consumptionId,
      timestamp: new Date().toISOString(),
      productId,
      productName: product.name,
      quantity,
      unitCost,
      totalCost,
      reason,
      personName: personName.trim() || undefined,
      notes: notes.trim() || undefined
    };

    const updatedProducts = data.products.map(p =>
      p.id === productId
        ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - quantity) }
        : p
    );

    const reasonNames: Record<string, string> = {
      proprio: 'Consumo Próprio',
      degustacao: 'Degustação',
      cortesia: 'Cortesia',
      perda: 'Perda/Descarte'
    };

    const actionItem: ActionHistoryItem = {
      id: actionId,
      type: 'consumption',
      description: `${reasonNames[reason] || 'Consumo'}: ${quantity}x ${product.name}`,
      timestamp: new Date().toISOString(),
      data: {
        consumptionId,
        productId,
        quantity
      }
    };

    setData(prev => ({
      ...prev,
      consumptions: [newConsumption, ...prev.consumptions],
      products: updatedProducts,
      actionHistory: [actionItem, ...prev.actionHistory.slice(0, 49)]
    }));

    triggerUndoToast(`${quantity}x ${product.name} registrado como ${reasonNames[reason]}!`, actionId);

    return newConsumption;
  };

  // --- CANCELAR CONSUMO / DEVOLVER AO ESTOQUE ---
  const deleteConsumption = (consumptionId: string) => {
    const cons = data.consumptions.find(c => c.id === consumptionId);
    if (!cons) return;

    const updatedProducts = data.products.map(p =>
      p.id === cons.productId ? { ...p, stockQuantity: p.stockQuantity + cons.quantity } : p
    );

    setData(prev => ({
      ...prev,
      consumptions: prev.consumptions.filter(c => c.id !== consumptionId),
      products: updatedProducts,
      actionHistory: prev.actionHistory.filter(a => a.data?.consumptionId !== consumptionId)
    }));
  };

  // --- DEBTS / FIADO ---
  const payDebt = (debtId: string, amountToPay: number, method: PaymentMethod) => {
    const debtToPay = data.debts.find(d => d.id === debtId);
    if (!debtToPay) return;

    const actionId = `action-${Date.now()}`;
    const paymentId = `pay-${Date.now()}`;

    const updatedDebts = data.debts.map(debt => {
      if (debt.id !== debtId) return debt;

      const newPaid = debt.amountPaid + amountToPay;
      const newRemaining = Math.max(0, debt.originalAmount - newPaid);
      const isSettled = newRemaining === 0;

      const paymentRecord = {
        id: paymentId,
        date: new Date().toISOString(),
        amount: amountToPay,
        method
      };

      return {
        ...debt,
        amountPaid: newPaid,
        remainingAmount: newRemaining,
        status: isSettled ? ('settled' as const) : ('partially_paid' as const),
        paymentHistory: [paymentRecord, ...debt.paymentHistory]
      };
    });

    const actionItem: ActionHistoryItem = {
      id: actionId,
      type: 'debt_payment',
      description: `Pagamento Fiado: R$ ${amountToPay.toFixed(2)} de ${debtToPay.customerName}`,
      timestamp: new Date().toISOString(),
      data: {
        debtId,
        paymentId,
        amountPaid: amountToPay
      }
    };

    setData(prev => ({
      ...prev,
      debts: updatedDebts,
      actionHistory: [actionItem, ...prev.actionHistory.slice(0, 49)]
    }));

    triggerUndoToast(`Pagamento de R$ ${amountToPay.toFixed(2)} recebido de ${debtToPay.customerName}!`, actionId);

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // --- UNDO SYSTEM ---
  const undoAction = (actionId: string) => {
    const action = data.actionHistory.find(a => a.id === actionId);
    if (!action) return false;

    if (action.type === 'sale') {
      const { saleId, itemsToRestore, debtId } = action.data;
      setData(prev => {
        const updatedProducts = prev.products.map(p => {
          const toRestore = itemsToRestore?.find((i: any) => i.productId === p.id);
          if (toRestore) {
            return { ...p, stockQuantity: p.stockQuantity + toRestore.quantity };
          }
          return p;
        });

        return {
          ...prev,
          sales: prev.sales.filter(s => s.id !== saleId),
          debts: debtId ? prev.debts.filter(d => d.id !== debtId) : prev.debts,
          products: updatedProducts,
          actionHistory: prev.actionHistory.filter(a => a.id !== actionId)
        };
      });
      dismissToast();
      return true;
    }

    if (action.type === 'consumption') {
      const { consumptionId, productId, quantity } = action.data;
      setData(prev => ({
        ...prev,
        consumptions: prev.consumptions.filter(c => c.id !== consumptionId),
        products: prev.products.map(p =>
          p.id === productId ? { ...p, stockQuantity: p.stockQuantity + quantity } : p
        ),
        actionHistory: prev.actionHistory.filter(a => a.id !== actionId)
      }));
      dismissToast();
      return true;
    }

    if (action.type === 'debt_payment') {
      const { debtId, paymentId, amountPaid } = action.data;
      setData(prev => ({
        ...prev,
        debts: prev.debts.map(d => {
          if (d.id !== debtId) return d;
          const newPaid = Math.max(0, d.amountPaid - amountPaid);
          const newRemaining = d.originalAmount - newPaid;
          return {
            ...d,
            amountPaid: newPaid,
            remainingAmount: newRemaining,
            status: newPaid === 0 ? 'pending' : 'partially_paid',
            paymentHistory: d.paymentHistory.filter(p => p.id !== paymentId)
          };
        }),
        actionHistory: prev.actionHistory.filter(a => a.id !== actionId)
      }));
      dismissToast();
      return true;
    }

    if (action.type === 'stock_add') {
      const { productId, quantityAdded } = action.data;
      setData(prev => ({
        ...prev,
        products: prev.products.map(p =>
          p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - quantityAdded) } : p
        ),
        actionHistory: prev.actionHistory.filter(a => a.id !== actionId)
      }));
      dismissToast();
      return true;
    }

    return false;
  };

  const undoLastAction = () => {
    if (data.actionHistory.length === 0) return false;
    const lastAction = data.actionHistory[0];
    return undoAction(lastAction.id);
  };

  // --- PRODUCTS & STOCK ---
  const addBatchStock = (productId: string, quantityToAdd: number) => {
    const product = data.products.find(p => p.id === productId);
    const actionId = `action-${Date.now()}`;

    const actionItem: ActionHistoryItem = {
      id: actionId,
      type: 'stock_add',
      description: `Fornada: +${quantityToAdd} un no sabor ${product?.name || ''}`,
      timestamp: new Date().toISOString(),
      data: { productId, quantityAdded: quantityToAdd }
    };

    setData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId
          ? { ...p, stockQuantity: p.stockQuantity + quantityToAdd }
          : p
      ),
      actionHistory: [actionItem, ...prev.actionHistory.slice(0, 49)]
    }));

    triggerUndoToast(`+${quantityToAdd} adicionado ao estoque de ${product?.name || 'cookie'}!`, actionId);
  };

  const updateProductStock = (productId: string, newQuantity: number) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId ? { ...p, stockQuantity: Math.max(0, newQuantity) } : p
      )
    }));
  };

  const saveProduct = (product: Partial<CookieProduct> & { name: string }) => {
    if (product.id) {
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => (p.id === product.id ? ({ ...p, ...product } as CookieProduct) : p))
      }));
    } else {
      const newP: CookieProduct = {
        id: `prod-${Date.now()}`,
        name: product.name,
        category: product.category || 'Tradicional',
        costPrice: product.costPrice || 3.00,
        salePrice: product.salePrice || 7.00,
        stockQuantity: product.stockQuantity ?? 20,
        minStockAlert: product.minStockAlert ?? 5,
        color: product.color || '#8B4513',
        description: product.description || '',
        emoji: product.emoji || '🍪',
        active: true
      };
      setData(prev => ({ ...prev, products: [...prev.products, newP] }));
    }
  };

  const deleteProduct = (productId: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const toggleProductActive = (productId: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId ? { ...p, active: !p.active } : p
      )
    }));
  };

  // --- GOALS / METAS ---
  const saveGoal = (goal: Partial<Goal> & { title: string; targetAmount: number }) => {
    if (goal.id) {
      setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => (g.id === goal.id ? ({ ...g, ...goal } as Goal) : g))
      }));
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0,
        category: goal.category || 'Equipamento',
        icon: goal.icon || '🎯',
        deadline: goal.deadline
      };
      setData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    }
  };

  const addGoalFunds = (goalId: string, amount: number) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const newAmount = g.currentAmount + amount;
        if (newAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
          try {
            confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
          } catch {
            // ignore
          }
        }
        return { ...g, currentAmount: newAmount };
      })
    }));
  };

  const deleteGoal = (goalId: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  // --- INGREDIENTS (CRUD) ---
  const saveIngredient = (ing: Partial<Ingredient> & { name: string; packagePrice: number; packageSize: number }) => {
    if (ing.id) {
      setData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(i => (i.id === ing.id ? ({ ...i, ...ing } as Ingredient) : i))
      }));
    } else {
      const newIng: Ingredient = {
        id: `ing-${Date.now()}`,
        name: ing.name,
        packagePrice: ing.packagePrice,
        packageSize: ing.packageSize,
        unitType: ing.unitType || 'g'
      };
      setData(prev => ({ ...prev, ingredients: [...prev.ingredients, newIng] }));
    }
  };

  const deleteIngredient = (ingredientId: string) => {
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== ingredientId),
      recipes: prev.recipes.map(r => ({
        ...r,
        ingredients: r.ingredients.filter(item => item.ingredientId !== ingredientId)
      }))
    }));
  };

  // --- RECIPES (CRUD & PRESETS) ---
  const saveRecipe = (recipe: Recipe) => {
    setData(prev => {
      const exists = prev.recipes.some(r => r.id === recipe.id);
      if (exists) {
        return {
          ...prev,
          recipes: prev.recipes.map(r => (r.id === recipe.id ? recipe : r))
        };
      }
      return { ...prev, recipes: [...prev.recipes, recipe] };
    });
  };

  const deleteRecipe = (recipeId: string) => {
    setData(prev => ({
      ...prev,
      recipes: prev.recipes.filter(r => r.id !== recipeId)
    }));
  };

  const duplicateRecipe = (recipeId: string) => {
    const source = data.recipes.find(r => r.id === recipeId);
    if (!source) return;

    const newRecipe: Recipe = {
      ...source,
      id: `recipe-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      ingredients: source.ingredients.map(i => ({ ...i }))
    };

    setData(prev => ({
      ...prev,
      recipes: [...prev.recipes, newRecipe]
    }));
  };

  // Link recipe calculated cost directly to product in inventory
  const applyRecipeCostToProduct = (productId: string, unitCost: number, unitSalePrice?: number) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            costPrice: parseFloat(unitCost.toFixed(2)),
            salePrice: unitSalePrice ? parseFloat(unitSalePrice.toFixed(2)) : p.salePrice
          };
        }
        return p;
      })
    }));
  };

  // --- SETTINGS & RESET ---
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetAllData = () => {
    const fresh = {
      products: initialProducts,
      sales: initialSales,
      debts: initialDebts,
      consumptions: [],
      ingredients: initialIngredients,
      recipes: initialRecipes,
      goals: initialGoals,
      settings: initialSettings,
      actionHistory: []
    };
    setData(fresh);
    localStorage.removeItem(STORAGE_KEY);
  };

  // --- COMPUTED METRICS ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySales = data.sales.filter(s => new Date(s.timestamp) >= todayStart);
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todayProfit = todaySales.reduce((acc, s) => acc + s.profit, 0);
  const todayItemsCount = todaySales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const totalRevenue = data.sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCost = data.sales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = data.sales.reduce((acc, s) => acc + s.profit, 0);

  const totalPendingDebts = data.debts
    .filter(d => d.status !== 'settled')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const totalStockCount = data.products.reduce((acc, p) => acc + (p.active ? p.stockQuantity : 0), 0);
  const lowStockCount = data.products.filter(
    p => p.active && p.stockQuantity <= p.minStockAlert
  ).length;

  const totalCookiesEaten = data.consumptions.reduce((acc, c) => acc + c.quantity, 0);
  const totalCostOfEaten = data.consumptions.reduce((acc, c) => acc + c.totalCost, 0);

  return {
    ...data,
    todayRevenue,
    todayProfit,
    todayItemsCount,
    todaySalesCount: todaySales.length,
    totalRevenue,
    totalCost,
    totalProfit,
    totalPendingDebts,
    totalStockCount,
    lowStockCount,
    totalCookiesEaten,
    totalCostOfEaten,
    toastNotification,
    dismissToast,
    // Actions
    recordSale,
    deleteSale,
    recordConsumption,
    deleteConsumption,
    payDebt,
    undoAction,
    undoLastAction,
    addBatchStock,
    updateProductStock,
    saveProduct,
    deleteProduct,
    toggleProductActive,
    saveGoal,
    addGoalFunds,
    deleteGoal,
    saveIngredient,
    deleteIngredient,
    saveRecipe,
    deleteRecipe,
    duplicateRecipe,
    applyRecipeCostToProduct,
    updateSettings,
    resetAllData
  };
}

