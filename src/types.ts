export type PaymentMethod = 'pix' | 'dinheiro' | 'fiado' | 'cartao';

export type TimeOfDay = 'intervalo_1' | 'intervalo_2' | 'saida' | 'encomenda' | 'outro';

export interface CookieProduct {
  id: string;
  name: string;
  category: 'Tradicional' | 'Especial' | 'Recheado' | 'Mini';
  costPrice: number; // R$
  salePrice: number; // R$
  stockQuantity: number;
  minStockAlert: number;
  color: string; // Tailwind color or hex
  description?: string;
  emoji: string;
  active: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface Sale {
  id: string;
  timestamp: string; // ISO date
  items: SaleItem[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_fiado';
  customerName?: string;
  customerClass?: string;
  timeOfDay: TimeOfDay;
  notes?: string;
}

export type ConsumptionReason = 'proprio' | 'consumo_proprio' | 'degustacao' | 'cortesia' | 'perda';

export interface ConsumptionRecord {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: ConsumptionReason; // Eu comi / Degustação / Cortesia / Perda
  personName?: string;
  notes?: string;
}

export interface DebtRecord {
  id: string;
  saleId: string;
  customerName: string;
  customerClass: string;
  contactPhone?: string;
  originalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: 'pending' | 'partially_paid' | 'settled';
  createdAt: string;
  dueDate?: string;
  notes?: string;
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    method: PaymentMethod;
  }[];
}

export interface Ingredient {
  id: string;
  name: string;
  packagePrice: number; // R$ paid for package
  packageSize: number; // g, ml or units
  unitType: 'g' | 'ml' | 'unidade';
}

export interface RecipeItem {
  ingredientId: string;
  amountUsed: number; // in g/ml/units
}

export interface Recipe {
  id: string;
  name: string;
  category?: string;
  productId?: string;
  linkedProductId?: string;
  batchYield: number; // e.g. 20 cookies per batch
  otherCostsPerBatch?: number; // packaging, electricity, gas estimate
  extraCosts?: number;
  desiredMarginPercent?: number; // markup %
  marginPercent?: number;
  ingredients: RecipeItem[];
  instructions?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: 'Equipamento' | 'Estoque' | 'Pessoal' | 'Reserva';
  deadline?: string;
  icon?: string;
}

export interface ActionHistoryItem {
  id: string;
  type: 'sale' | 'debt_payment' | 'consumption' | 'stock_add' | 'product_delete' | 'recipe_delete' | 'ingredient_delete';
  description: string;
  timestamp: string;
  data: any;
}

export interface AppSettings {
  sellerName: string;
  schoolName: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'telefone' | 'aleatoria';
  customReceiptMessage: string;
}

