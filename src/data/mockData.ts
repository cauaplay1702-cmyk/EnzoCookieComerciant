import { CookieProduct, Sale, DebtRecord, Ingredient, Recipe, Goal, AppSettings } from '../types';

export const initialProducts: CookieProduct[] = [];

export const initialSettings: AppSettings = {
  sellerName: '',
  schoolName: '',
  pixKey: '',
  pixKeyType: 'email',
  customReceiptMessage: 'Obrigado pelo apoio! Bom apetite 🍪'
};

export const initialSales: Sale[] = [];

export const initialDebts: DebtRecord[] = [];

export const initialIngredients: Ingredient[] = [];

export const initialRecipes: Recipe[] = [];

export const initialGoals: Goal[] = [];
