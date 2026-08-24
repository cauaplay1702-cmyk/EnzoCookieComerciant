import React, { useState, useEffect } from 'react';
import { Ingredient, Recipe, CookieProduct } from '../types';
import {
  Calculator,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  Sparkles,
  Edit2,
  Copy,
  Save,
  Check,
  X,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RecipeCalculatorViewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  products?: CookieProduct[];
  onSaveIngredient: (ing: Partial<Ingredient> & { name: string; packagePrice: number; packageSize: number; unitType?: 'g' | 'ml' | 'unidade' }) => void;
  onDeleteIngredient?: (ingredientId: string) => void;
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
  onDuplicateRecipe?: (recipeId: string) => void;
  onApplyRecipeCostToProduct?: (productId: string, unitCost: number, unitSalePrice?: number) => void;
}

export const RecipeCalculatorView: React.FC<RecipeCalculatorViewProps> = ({
  ingredients,
  recipes,
  products = [],
  onSaveIngredient,
  onDeleteIngredient,
  onSaveRecipe,
  onDeleteRecipe,
  onDuplicateRecipe,
  onApplyRecipeCostToProduct
}) => {
  // Selected Recipe Tab
  const [activeRecipeId, setActiveRecipeId] = useState<string>(() => {
    return recipes[0]?.id || '';
  });

  // Current Recipe Working State
  const [recipeName, setRecipeName] = useState<string>('');
  const [batchYield, setBatchYield] = useState<number>(20);
  const [extraCosts, setExtraCosts] = useState<number>(5.0);
  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(100);
  const [selectedIngredients, setSelectedIngredients] = useState<{ ingredientId: string; amountUsed: number }[]>([]);
  const [linkedProductId, setLinkedProductId] = useState<string>('');

  // Ingredient Editor (Add / Edit Insumo)
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  const [showIngModal, setShowIngModal] = useState<boolean>(false);

  // New Recipe Modal / Name prompt
  const [showNewRecipeModal, setShowNewRecipeModal] = useState<boolean>(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState<string>('');

  // Sync confirmation feedback
  const [syncFeedback, setSyncFeedback] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  // Load active recipe into state whenever activeRecipeId changes
  useEffect(() => {
    if (recipes.length === 0) return;
    const current = recipes.find(r => r.id === activeRecipeId) || recipes[0];
    if (current) {
      if (activeRecipeId !== current.id) {
        setActiveRecipeId(current.id);
      }
      setRecipeName(current.name);
      setBatchYield(current.batchYield || 20);
      setExtraCosts(current.extraCosts ?? 5.0);
      setDesiredMarginPercent(current.marginPercent ?? 100);
      setSelectedIngredients(current.ingredients ? current.ingredients.map(i => ({ ...i })) : []);
      setLinkedProductId(current.linkedProductId || '');
    }
  }, [activeRecipeId, recipes]);

  // Helper to calculate cost per unit of raw ingredient
  const getIngredientCostPerUnit = (ing: Ingredient) => {
    if (!ing || ing.packageSize <= 0) return 0;
    return ing.packagePrice / ing.packageSize;
  };

  // Calculations
  const calculateTotalBatchCost = () => {
    let sum = extraCosts;
    selectedIngredients.forEach(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (ing) {
        const costPerUnit = getIngredientCostPerUnit(ing);
        sum += costPerUnit * item.amountUsed;
      }
    });
    return sum;
  };

  const totalBatchCost = calculateTotalBatchCost();
  const costPerCookie = batchYield > 0 ? totalBatchCost / batchYield : 0;
  const recommendedPricePerCookie = costPerCookie * (1 + desiredMarginPercent / 100);
  const totalBatchRevenue = recommendedPricePerCookie * batchYield;
  const batchNetProfit = totalBatchRevenue - totalBatchCost;

  // Recipe actions
  const handleSaveCurrentRecipe = () => {
    if (!recipeName.trim()) {
      alert('Informe o nome da receita!');
      return;
    }
    const current = recipes.find(r => r.id === activeRecipeId);
    const recipeToSave: Recipe = {
      id: current?.id || `recipe-${Date.now()}`,
      name: recipeName.trim(),
      batchYield: Math.max(1, batchYield),
      extraCosts: Math.max(0, extraCosts),
      marginPercent: desiredMarginPercent,
      linkedProductId: linkedProductId || undefined,
      ingredients: selectedIngredients.filter(i => i.amountUsed > 0)
    };

    onSaveRecipe(recipeToSave);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleCreateNewRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeTitle.trim()) return;

    const newId = `recipe-${Date.now()}`;
    const newRec: Recipe = {
      id: newId,
      name: newRecipeTitle.trim(),
      batchYield: 20,
      extraCosts: 5.0,
      marginPercent: 100,
      ingredients: ingredients.slice(0, 3).map(i => ({ ingredientId: i.id, amountUsed: 100 }))
    };

    onSaveRecipe(newRec);
    setActiveRecipeId(newId);
    setNewRecipeTitle('');
    setShowNewRecipeModal(false);
  };

  const handleDeleteCurrentRecipe = () => {
    if (!activeRecipeId) return;
    const confirmDel = window.confirm(`Tem certeza que deseja excluir a receita "${recipeName}"?`);
    if (confirmDel && onDeleteRecipe) {
      onDeleteRecipe(activeRecipeId);
      const remaining = recipes.filter(r => r.id !== activeRecipeId);
      if (remaining.length > 0) {
        setActiveRecipeId(remaining[0].id);
      }
    }
  };

  const handleDuplicateCurrentRecipe = () => {
    if (!activeRecipeId || !onDuplicateRecipe) return;
    onDuplicateRecipe(activeRecipeId);
  };

  const handleApplyCostToStock = () => {
    if (!linkedProductId || !onApplyRecipeCostToProduct) {
      alert('Selecione primeiro o sabor correspondente no Estoque no campo acima!');
      return;
    }
    onApplyRecipeCostToProduct(linkedProductId, costPerCookie, recommendedPricePerCookie);
    setSyncFeedback(true);
    setTimeout(() => setSyncFeedback(false), 2500);
  };

  // Recipe Ingredient Rows
  const handleAddRecipeIngredientRow = () => {
    if (ingredients.length === 0) {
      alert('Cadastre primeiro os insumos abaixo!');
      return;
    }
    setSelectedIngredients(prev => [
      ...prev,
      { ingredientId: ingredients[0].id, amountUsed: 100 }
    ]);
  };

  const handleRemoveRecipeIngredientRow = (idx: number) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRecipeRow = (idx: number, field: 'ingredientId' | 'amountUsed', val: any) => {
    setSelectedIngredients(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Raw Ingredient (Insumo) modal actions
  const handleOpenNewIngModal = () => {
    setEditingIngredient({
      name: '',
      packagePrice: 15.0,
      packageSize: 1000,
      unitType: 'g'
    });
    setShowIngModal(true);
  };

  const handleOpenEditIngModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setShowIngModal(true);
  };

  const handleSaveIngModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIngredient?.name?.trim()) {
      alert('Informe o nome do insumo!');
      return;
    }
    if (!editingIngredient.packagePrice || editingIngredient.packagePrice <= 0) {
      alert('Informe um preço de embalagem válido!');
      return;
    }
    if (!editingIngredient.packageSize || editingIngredient.packageSize <= 0) {
      alert('Informe uma quantidade de embalagem válida!');
      return;
    }

    onSaveIngredient({
      id: editingIngredient.id,
      name: editingIngredient.name.trim(),
      packagePrice: editingIngredient.packagePrice,
      packageSize: editingIngredient.packageSize,
      unitType: editingIngredient.unitType || 'g'
    });

    setShowIngModal(false);
    setEditingIngredient(null);
  };

  const handleDeleteIng = (ing: Ingredient) => {
    const confirmDel = window.confirm(`Deseja excluir o insumo "${ing.name}"?`);
    if (confirmDel && onDeleteIngredient) {
      onDeleteIngredient(ing.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#99582A]" />
            <span>Fichas Técnicas & Receitas</span>
          </h2>
          <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
            Calculadora de custo exato por cookie, precificação inteligente e gestão de insumos.
          </p>
        </div>

        <button
          onClick={() => setShowNewRecipeModal(true)}
          className="py-3 px-5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 border-4 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Receita / Sabor</span>
        </button>
      </div>

      {/* RECIPES TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {recipes.map(recipe => {
          const isActive = recipe.id === activeRecipeId;
          return (
            <button
              key={recipe.id}
              onClick={() => setActiveRecipeId(recipe.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-[#3D2B1F] flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-[#99582A] text-[#FFFBF5] shadow-[4px_4px_0px_0px_#3D2B1F]'
                  : 'bg-white hover:bg-[#FFB703] text-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]'
              }`}
            >
              <span>🍪</span>
              <span>{recipe.name}</span>
              <span className="text-[10px] opacity-75">({recipe.batchYield} un)</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowNewRecipeModal(true)}
          className="px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-dashed border-[#3D2B1F] bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Receita</span>
        </button>
      </div>

      {/* Main Grid: Recipe Editor (Left) and Results / Insumos (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recipe Configuration & Ingredients Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-6">
          {/* Recipe Name & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-4 border-[#3D2B1F]">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-[#99582A] mb-1">
                Nome da Receita
              </label>
              <input
                type="text"
                value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                className="w-full text-xl font-black uppercase text-[#3D2B1F] bg-[#F7EFE5] p-2.5 rounded-xl border-2 border-[#3D2B1F] outline-none"
                placeholder="Ex: Cookie Tradicional com Gotas"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleSaveCurrentRecipe}
                className="px-3.5 py-2.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black text-xs uppercase rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Salvar alterações na receita"
              >
                {savedFeedback ? <Check className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4" />}
                <span>{savedFeedback ? 'Salvo!' : 'Salvar'}</span>
              </button>

              {onDuplicateRecipe && (
                <button
                  onClick={handleDuplicateCurrentRecipe}
                  className="p-2.5 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F] cursor-pointer"
                  title="Duplicar esta receita como base para novo sabor"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}

              {onDeleteRecipe && recipes.length > 1 && (
                <button
                  onClick={handleDeleteCurrentRecipe}
                  className="p-2.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-800 border-2 border-[#3D2B1F] rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F] cursor-pointer"
                  title="Excluir esta receita"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Batch Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                Rendimento da Fornada (Qtd Cookies)
              </label>
              <input
                type="number"
                min="1"
                value={batchYield}
                onChange={e => setBatchYield(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                Gastos Extras da Fornada (Gás / Luz / Embalagem R$)
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={extraCosts}
                onChange={e => setExtraCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
              />
            </div>
          </div>

          {/* Ingredients in Recipe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#3D2B1F]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#99582A]" />
                Ingredientes Utilizados na Receita
              </span>
              <button
                onClick={handleAddRecipeIngredientRow}
                className="text-xs text-[#3D2B1F] bg-[#FFB703] border-2 border-[#3D2B1F] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer font-black shadow-[2px_2px_0px_0px_#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Linha</span>
              </button>
            </div>

            {selectedIngredients.length === 0 ? (
              <div className="text-center py-8 bg-[#F7EFE5] rounded-2xl border-2 border-dashed border-[#3D2B1F] p-4">
                <p className="text-xs font-black text-[#3D2B1F] uppercase">
                  Nenhum ingrediente adicionado a esta receita ainda.
                </p>
                <p className="text-[11px] font-bold text-[#99582A] uppercase mt-1">
                  Toque em "+ Adicionar Linha" para montar a ficha técnica.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedIngredients.map((row, idx) => {
                  const ing = ingredients.find(i => i.id === row.ingredientId);
                  const cost = ing ? getIngredientCostPerUnit(ing) * row.amountUsed : 0;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#F7EFE5] p-2.5 rounded-2xl border-2 border-[#3D2B1F] text-xs font-bold"
                    >
                      <select
                        value={row.ingredientId}
                        onChange={e => handleUpdateRecipeRow(idx, 'ingredientId', e.target.value)}
                        className="flex-1 p-2 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none truncate"
                      >
                        {ingredients.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} (R$ {i.packagePrice.toFixed(2)}/{i.packageSize}{i.unitType})
                          </option>
                        ))}
                      </select>

                      <div className="w-24 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={row.amountUsed}
                          onChange={e =>
                            handleUpdateRecipeRow(idx, 'amountUsed', parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-2 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-center outline-none"
                        />
                        <span className="text-[10px] font-black uppercase text-[#99582A]">{ing?.unitType || 'g'}</span>
                      </div>

                      <span className="w-20 text-right font-black text-[#3D2B1F] text-xs">
                        R$ {cost.toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemoveRecipeIngredientRow(idx)}
                        className="p-1.5 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
                        title="Remover linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Margin Slider */}
          <div className="bg-[#F7EFE5] p-5 rounded-2xl border-4 border-[#3D2B1F] space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#3D2B1F]">
              <span className="flex items-center gap-1">
                <Sliders className="w-4 h-4 text-[#99582A]" />
                Margem de Lucro Desejada
              </span>
              <span className="text-[#3D2B1F] bg-[#FFB703] px-3 py-1 rounded-xl border-2 border-[#3D2B1F] font-black">
                {desiredMarginPercent}% Lucro
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={desiredMarginPercent}
              onChange={e => setDesiredMarginPercent(parseInt(e.target.value))}
              className="w-full accent-[#3D2B1F] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#99582A] font-black uppercase">
              <span>20% (Mínimo)</span>
              <span>100% (Dobro / Padrão)</span>
              <span>200% (Triplo)</span>
              <span>300% (Alto)</span>
            </div>
          </div>

          {/* Link to Product in Stock / Inventory */}
          {products.length > 0 && onApplyRecipeCostToProduct && (
            <div className="bg-[#FFFBF5] border-3 border-[#3D2B1F] p-4 rounded-2xl space-y-3 shadow-[3px_3px_0px_0px_#3D2B1F]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#3D2B1F] flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-[#99582A]" />
                  Vincular ao Estoque
                </span>
                <span className="text-[10px] font-bold text-[#99582A] uppercase">
                  Atualiza custo no estoque
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={linkedProductId}
                  onChange={e => setLinkedProductId(e.target.value)}
                  className="w-full sm:flex-1 p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-xs uppercase outline-none"
                >
                  <option value="">-- Selecione o Sabor no Estoque --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.name} (Atual: Custo R$ {p.costPrice.toFixed(2)} / Venda R$ {p.salePrice.toFixed(2)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleApplyCostToStock}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#99582A] hover:bg-[#3D2B1F] text-white font-black text-xs uppercase rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                >
                  {syncFeedback ? <Check className="w-4 h-4 text-emerald-300" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{syncFeedback ? 'Atualizado no Estoque!' : 'Aplicar Custo ao Estoque'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results Card & Raw Ingredients Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price & Profit Simulator Card */}
          <div className="bg-[#FFB703] text-[#3D2B1F] p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] space-y-4">
            <h3 className="text-sm font-black text-[#3D2B1F] uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#3D2B1F]" />
              Resultado da Receita
            </h3>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border-4 border-[#3D2B1F]">
              <div>
                <span className="text-[10px] text-[#99582A] block uppercase font-black">
                  Custo / Cookie
                </span>
                <span className="text-2xl font-black text-red-600">
                  R$ {costPerCookie.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#99582A] block uppercase font-black">
                  Preço Sugerido
                </span>
                <span className="text-2xl font-black text-[#3D2B1F]">
                  R$ {recommendedPricePerCookie.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-black uppercase border-t-2 border-[#3D2B1F] pt-3 text-[#3D2B1F]">
              <div className="flex justify-between">
                <span>Custo da Fornada ({batchYield} un):</span>
                <span>R$ {totalBatchCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Faturamento Esperado:</span>
                <span>R$ {totalBatchRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#3D2B1F] pt-2 border-t-2 border-[#3D2B1F]">
                <span>Lucro Líquido Fornada:</span>
                <span>+ R$ {batchNetProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* RAW INGREDIENTS LIST & CRUD */}
          <div className="bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#3D2B1F]">
              <div>
                <h3 className="font-black text-[#3D2B1F] uppercase text-base flex items-center gap-2">
                  <span>📦</span>
                  <span>Insumos & Preços Pagos</span>
                </h3>
                <p className="text-[10px] font-bold text-[#99582A] uppercase">
                  Edite ou exclua insumos para atualizar todas as receitas
                </p>
              </div>

              <button
                onClick={handleOpenNewIngModal}
                className="px-3 py-1.5 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black text-xs uppercase rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Insumo</span>
              </button>
            </div>

            {/* Ingredients Items List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {ingredients.map(ing => {
                const costPer100 = getIngredientCostPerUnit(ing) * 100;
                return (
                  <div
                    key={ing.id}
                    className="p-3 bg-[#F7EFE5] rounded-2xl border-2 border-[#3D2B1F] flex items-center justify-between gap-2 hover:bg-[#FFFBF5] transition-all"
                  >
                    <div className="overflow-hidden">
                      <p className="font-black text-xs uppercase text-[#3D2B1F] truncate">
                        {ing.name}
                      </p>
                      <p className="text-[11px] font-bold text-[#99582A]">
                        R$ {ing.packagePrice.toFixed(2)} por {ing.packageSize}{ing.unitType}
                        <span className="text-[10px] opacity-80 block">
                          (R$ {costPer100.toFixed(2)} a cada 100{ing.unitType})
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditIngModal(ing)}
                        className="p-2 text-[#3D2B1F] bg-white hover:bg-[#FFB703] border-2 border-[#3D2B1F] rounded-xl cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#3D2B1F]"
                        title="Editar Insumo (Nome, Preço ou Tamanho)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteIngredient && (
                        <button
                          onClick={() => handleDeleteIng(ing)}
                          className="p-2 text-red-700 bg-white hover:bg-red-200 border-2 border-[#3D2B1F] rounded-xl cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#3D2B1F]"
                          title="Excluir Insumo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NEW RECIPE MODAL */}
      {showNewRecipeModal && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-md w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F]">
            <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                <h3 className="text-xl font-black uppercase text-[#3D2B1F]">Criar Nova Receita</h3>
              </div>
              <button
                onClick={() => setShowNewRecipeModal(false)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer font-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewRecipe} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Nome da Nova Receita / Sabor <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cookie Red Velvet com Brigadeiro"
                  value={newRecipeTitle}
                  onChange={e => setNewRecipeTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-sm outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3 border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setShowNewRecipeModal(false)}
                  className="flex-1 py-3 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] transition-colors"
                >
                  Criar Receita 🍪
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADD INGREDIENT MODAL */}
      {showIngModal && editingIngredient && (
        <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FFFBF5] rounded-[2rem] max-w-md w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] text-[#3D2B1F]">
            <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <h3 className="text-xl font-black uppercase text-[#3D2B1F]">
                  {editingIngredient.id ? 'Editar Insumo' : 'Cadastrar Insumo'}
                </h3>
              </div>
              <button
                onClick={() => setShowIngModal(false)}
                className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer font-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIngModal} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Nome do Insumo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gotas de Chocolate Nobre, Manteiga Sem Sal"
                  value={editingIngredient.name || ''}
                  onChange={e => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Preço Pago no Pacote (R$) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0.1"
                    required
                    placeholder="28,50"
                    value={editingIngredient.packagePrice || ''}
                    onChange={e =>
                      setEditingIngredient({
                        ...editingIngredient,
                        packagePrice: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                    Tamanho / Quantidade <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1000"
                    value={editingIngredient.packageSize || ''}
                    onChange={e =>
                      setEditingIngredient({
                        ...editingIngredient,
                        packageSize: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black uppercase text-[#3D2B1F] mb-1">
                  Unidade de Medida
                </label>
                <select
                  value={editingIngredient.unitType || 'g'}
                  onChange={e =>
                    setEditingIngredient({
                      ...editingIngredient,
                      unitType: e.target.value as any
                    })
                  }
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black uppercase outline-none"
                >
                  <option value="g">Grama (g) - Farinhas, Açúcares, Gotas</option>
                  <option value="ml">Mililitro (ml) - Leite, Essência, Óleo</option>
                  <option value="unidade">Unidade (un) - Ovos, Embalagens</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3 border-t-2 border-[#3D2B1F]">
                <button
                  type="button"
                  onClick={() => setShowIngModal(false)}
                  className="flex-1 py-3 bg-[#F7EFE5] hover:bg-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black rounded-xl text-xs uppercase cursor-pointer border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] transition-colors"
                >
                  Salvar Insumo 📦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
