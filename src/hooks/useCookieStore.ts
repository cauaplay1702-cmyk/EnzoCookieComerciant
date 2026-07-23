import { useState, useEffect } from 'react';
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
  TimeOfDay
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

const STORAGE_KEY = 'cookie_tracker_app_data_v3';

interface StoreData {
  products: CookieProduct[];
  sales: Sale[];
  debts: DebtRecord[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  goals: Goal[];
  settings: AppSettings;
}

export function useCookieStore() {
  const [data, setData] = useState<StoreData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar dados do LocalStorage:', e);
    }
    return {
      products: initialProducts,
      sales: initialSales,
      debts: initialDebts,
      ingredients: initialIngredients,
      recipes: initialRecipes,
      goals: initialGoals,
      settings: initialSettings
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
  }, [data]);

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
    if (isFiado && finalAmount > 0) {
      const newDebt: DebtRecord = {
        id: `debt-${Date.now()}`,
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

    setData(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales],
      products: updatedProducts,
      debts: updatedDebts
    }));

    // Trigger celebration confetti for sale!
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }

    return newSale;
  };

  // --- DEBTS / FIADO ---
  const payDebt = (debtId: string, amountToPay: number, method: PaymentMethod) => {
    const updatedDebts = data.debts.map(debt => {
      if (debt.id !== debtId) return debt;

      const newPaid = debt.amountPaid + amountToPay;
      const newRemaining = Math.max(0, debt.originalAmount - newPaid);
      const isSettled = newRemaining === 0;

      const paymentRecord = {
        id: `pay-${Date.now()}`,
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

    setData(prev => ({ ...prev, debts: updatedDebts }));

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // --- PRODUCTS & STOCK ---
  const addBatchStock = (productId: string, quantityToAdd: number) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId
          ? { ...p, stockQuantity: p.stockQuantity + quantityToAdd }
          : p
      )
    }));
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
      // Edit
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => (p.id === product.id ? { ...p, ...product } as CookieProduct : p))
      }));
    } else {
      // Create new
      const newP: CookieProduct = {
        id: `prod-${Date.now()}`,
        name: product.name,
        category: product.category || 'Tradicional',
        costPrice: product.costPrice || 3.00,
        salePrice: product.salePrice || 7.00,
        stockQuantity: product.stockQuantity || 20,
        minStockAlert: product.minStockAlert || 5,
        color: product.color || '#8B4513',
        description: product.description || '',
        emoji: product.emoji || '🍪',
        active: true
      };
      setData(prev => ({ ...prev, products: [...prev.products, newP] }));
    }
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
        goals: prev.goals.map(g => (g.id === goal.id ? { ...g, ...goal } as Goal : g))
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

  // --- RECIPES & INGREDIENTS ---
  const saveIngredient = (ing: Partial<Ingredient> & { name: string; packagePrice: number; packageSize: number }) => {
    if (ing.id) {
      setData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(i => (i.id === ing.id ? { ...i, ...ing } as Ingredient : i))
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
      ingredients: initialIngredients,
      recipes: initialRecipes,
      goals: initialGoals,
      settings: initialSettings
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
    // Actions
    recordSale,
    payDebt,
    addBatchStock,
    updateProductStock,
    saveProduct,
    toggleProductActive,
    saveGoal,
    addGoalFunds,
    deleteGoal,
    saveIngredient,
    saveRecipe,
    updateSettings,
    resetAllData
  };
}
