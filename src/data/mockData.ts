import { CookieProduct, Sale, DebtRecord, Ingredient, Recipe, Goal, AppSettings } from '../types';

export const initialProducts: CookieProduct[] = [
  {
    id: 'prod-1',
    name: 'Cookie Tradicional Gotas',
    category: 'Tradicional',
    costPrice: 2.80,
    salePrice: 7.00,
    stockQuantity: 25,
    minStockAlert: 5,
    color: '#D97706',
    emoji: '🍪',
    description: 'Massa amanteigada com baunilha e gotas de chocolate nobre ao leite.',
    active: true
  },
  {
    id: 'prod-2',
    name: 'Cookie Duplo Chocolate',
    category: 'Especial',
    costPrice: 3.20,
    salePrice: 8.00,
    stockQuantity: 18,
    minStockAlert: 5,
    color: '#78350F',
    emoji: '🍫',
    description: 'Massa 100% cacau black com generosas gotas de chocolate meio amargo.',
    active: true
  },
  {
    id: 'prod-3',
    name: 'Cookie Recheado Nutella',
    category: 'Recheado',
    costPrice: 4.10,
    salePrice: 10.00,
    stockQuantity: 15,
    minStockAlert: 4,
    color: '#92400E',
    emoji: '🌰',
    description: 'Crocante por fora e com recheio cremoso e vulcânico de Nutella pura.',
    active: true
  },
  {
    id: 'prod-4',
    name: 'Cookie Red Velvet c/ Ninho',
    category: 'Especial',
    costPrice: 3.90,
    salePrice: 9.00,
    stockQuantity: 12,
    minStockAlert: 3,
    color: '#B91C1C',
    emoji: '🍓',
    description: 'Massa aveludada vermelha recheada com brigadeiro de Leite Ninho.',
    active: true
  }
];

export const initialSettings: AppSettings = {
  sellerName: 'Bake & School Cookies',
  schoolName: 'Colégio',
  pixKey: '',
  pixKeyType: 'telefone',
  customReceiptMessage: 'Obrigado pelo apoio! Bom apetite 🍪'
};

export const initialSales: Sale[] = [];

export const initialDebts: DebtRecord[] = [];

export const initialIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Farinha de Trigo', packagePrice: 6.50, packageSize: 1000, unitType: 'g' },
  { id: 'ing-2', name: 'Manteiga sem Sal', packagePrice: 13.90, packageSize: 200, unitType: 'g' },
  { id: 'ing-3', name: 'Açúcar Mascavo', packagePrice: 8.50, packageSize: 500, unitType: 'g' },
  { id: 'ing-4', name: 'Açúcar Cristal / Refinado', packagePrice: 5.20, packageSize: 1000, unitType: 'g' },
  { id: 'ing-5', name: 'Gotas de Chocolate Nobre', packagePrice: 32.00, packageSize: 1000, unitType: 'g' },
  { id: 'ing-6', name: 'Cacau em Pó 100%', packagePrice: 18.00, packageSize: 500, unitType: 'g' },
  { id: 'ing-7', name: 'Nutella Pote 650g', packagePrice: 38.00, packageSize: 650, unitType: 'g' },
  { id: 'ing-8', name: 'Leite Ninho em Pó', packagePrice: 22.00, packageSize: 400, unitType: 'g' },
  { id: 'ing-9', name: 'Ovos (Cartela 30 un)', packagePrice: 24.00, packageSize: 30, unitType: 'unidade' },
  { id: 'ing-10', name: 'Essência de Baunilha', packagePrice: 6.00, packageSize: 30, unitType: 'ml' }
];

export const initialRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Cookie Tradicional Gotas',
    category: 'Tradicional',
    productId: 'prod-1',
    batchYield: 20,
    otherCostsPerBatch: 5.00,
    desiredMarginPercent: 120,
    ingredients: [
      { ingredientId: 'ing-1', amountUsed: 320 },
      { ingredientId: 'ing-2', amountUsed: 160 },
      { ingredientId: 'ing-3', amountUsed: 140 },
      { ingredientId: 'ing-4', amountUsed: 100 },
      { ingredientId: 'ing-5', amountUsed: 250 },
      { ingredientId: 'ing-9', amountUsed: 2 },
      { ingredientId: 'ing-10', amountUsed: 5 }
    ]
  },
  {
    id: 'recipe-2',
    name: 'Cookie Duplo Chocolate',
    category: 'Especial',
    productId: 'prod-2',
    batchYield: 18,
    otherCostsPerBatch: 5.00,
    desiredMarginPercent: 120,
    ingredients: [
      { ingredientId: 'ing-1', amountUsed: 280 },
      { ingredientId: 'ing-6', amountUsed: 60 },
      { ingredientId: 'ing-2', amountUsed: 170 },
      { ingredientId: 'ing-3', amountUsed: 150 },
      { ingredientId: 'ing-5', amountUsed: 260 },
      { ingredientId: 'ing-9', amountUsed: 2 }
    ]
  },
  {
    id: 'recipe-3',
    name: 'Cookie Recheado Nutella',
    category: 'Recheado',
    productId: 'prod-3',
    batchYield: 16,
    otherCostsPerBatch: 6.00,
    desiredMarginPercent: 130,
    ingredients: [
      { ingredientId: 'ing-1', amountUsed: 300 },
      { ingredientId: 'ing-2', amountUsed: 150 },
      { ingredientId: 'ing-3', amountUsed: 130 },
      { ingredientId: 'ing-5', amountUsed: 180 },
      { ingredientId: 'ing-7', amountUsed: 240 },
      { ingredientId: 'ing-9', amountUsed: 2 }
    ]
  }
];

export const initialGoals: Goal[] = [];

