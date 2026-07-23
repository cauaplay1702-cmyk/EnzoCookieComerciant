import React, { useState } from 'react';
import { Ingredient, Recipe } from '../types';
import {
  Calculator,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface RecipeCalculatorViewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onSaveIngredient: (ing: Partial<Ingredient> & { name: string; packagePrice: number; packageSize: number }) => void;
  onSaveRecipe: (recipe: Recipe) => void;
}

export const RecipeCalculatorView: React.FC<RecipeCalculatorViewProps> = ({
  ingredients,
  recipes,
  onSaveIngredient,
  onSaveRecipe
}) => {
  // Ingredient Form state
  const [ingName, setIngName] = useState('');
  const [ingPrice, setIngPrice] = useState('');
  const [ingSize, setIngSize] = useState('');
  const [ingUnit, setIngUnit] = useState<'g' | 'ml' | 'unidade'>('g');

  // Active Recipe State
  const [batchYield, setBatchYield] = useState<number>(20); // 20 cookies
  const [extraCosts, setExtraCosts] = useState<number>(5.00); // R$ 5 gas/packaging
  const [selectedIngredients, setSelectedIngredients] = useState<{ ingredientId: string; amountUsed: number }[]>([
    { ingredientId: 'ing-1', amountUsed: 350 }, // Farinha
    { ingredientId: 'ing-2', amountUsed: 180 }, // Manteiga
    { ingredientId: 'ing-3', amountUsed: 150 }, // Açúcar Mascavo
    { ingredientId: 'ing-5', amountUsed: 300 }  // Chocolate
  ]);
  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(100); // 100% markup

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    const price = parseFloat(ingPrice.replace(',', '.')) || 0;
    const size = parseFloat(ingSize.replace(',', '.')) || 0;

    if (price <= 0 || size <= 0) {
      alert('Informe o preço e o tamanho da embalagem válidos!');
      return;
    }

    onSaveIngredient({
      name: ingName.trim(),
      packagePrice: price,
      packageSize: size,
      unitType: ingUnit
    });

    setIngName('');
    setIngPrice('');
    setIngSize('');
  };

  // Recipe calculation helper
  const getIngredientCostPerUnit = (ing: Ingredient) => {
    if (ing.packageSize <= 0) return 0;
    return ing.packagePrice / ing.packageSize;
  };

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

  const handleAddRecipeIngredientRow = () => {
    if (ingredients.length === 0) return;
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="bg-[#F7EFE5] p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F]">
        <h2 className="text-3xl font-black tracking-tight text-[#3D2B1F] uppercase flex items-center gap-3">
          <Calculator className="w-8 h-8 text-[#99582A]" />
          <span>Calculadora de Custos da Receita</span>
        </h2>
        <p className="text-xs font-bold text-[#99582A] uppercase tracking-wider mt-1">
          Descubra exatamente quanto custa cada cookie produzido e calcule o preço de venda para ter o lucro desejado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recipe Builder & Cost Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
            <h3 className="font-black text-[#3D2B1F] text-lg uppercase flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FFB703]" />
              <span>Ficha Técnica da Fornada</span>
            </h3>
            <span className="text-xs font-black text-[#3D2B1F] bg-[#FFB703] border-2 border-[#3D2B1F] px-3 py-1 rounded-xl uppercase">
              {batchYield} cookies
            </span>
          </div>

          {/* Batch Parameters */}
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                Rendimento (Qtd Cookies)
              </label>
              <input
                type="number"
                min="1"
                value={batchYield}
                onChange={e => setBatchYield(parseInt(e.target.value) || 1)}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">
                Gastos Extras (Gás/Embalagem R$)
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={extraCosts}
                onChange={e => setExtraCosts(parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
              />
            </div>
          </div>

          {/* Recipe Ingredients Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#3D2B1F]">
              <span>Ingredientes Utilizados</span>
              <button
                onClick={handleAddRecipeIngredientRow}
                className="text-xs text-[#3D2B1F] bg-[#FFB703] border-2 border-[#3D2B1F] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer font-black shadow-[2px_2px_0px_0px_#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {selectedIngredients.length === 0 ? (
              <p className="text-xs font-bold text-[#99582A] uppercase py-4 text-center">
                Nenhum ingrediente adicionado à receita.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
                        className="flex-1 p-2 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
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

                      <span className="w-20 text-right font-black text-[#3D2B1F]">
                        R$ {cost.toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemoveRecipeIngredientRow(idx)}
                        className="p-1.5 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Margin Slider */}
          <div className="bg-[#F7EFE5] p-5 rounded-2xl border-4 border-[#3D2B1F] space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#3D2B1F]">
              <span className="flex items-center gap-1">
                <Sliders className="w-4 h-4 text-[#99582A]" />
                Margem de Lucro Desejada
              </span>
              <span className="text-[#3D2B1F] bg-[#FFB703] px-3 py-1 rounded-xl border-2 border-[#3D2B1F] font-black">
                {desiredMarginPercent}% Margem
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={desiredMarginPercent}
              onChange={e => setDesiredMarginPercent(parseInt(e.target.value))}
              className="w-full accent-[#3D2B1F] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#99582A] font-black uppercase">
              <span>20% (Baixo)</span>
              <span>100% (Padrão)</span>
              <span>200% (Alto)</span>
            </div>
          </div>
        </div>

        {/* Right: Price Suggestion Summary & Ingredient Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price Card Result */}
          <div className="bg-[#FFB703] text-[#3D2B1F] p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F] space-y-4">
            <h3 className="text-sm font-black text-[#3D2B1F] uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#3D2B1F]" />
              Resultado da Calculadora
            </h3>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border-4 border-[#3D2B1F]">
              <div>
                <span className="text-[10px] text-[#99582A] block uppercase font-black">
                  Custo/Cookie
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
                <span>Custo Total ({batchYield} cookies):</span>
                <span>R$ {totalBatchCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Faturamento Total:</span>
                <span>R$ {totalBatchRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#3D2B1F] pt-2 border-t-2 border-[#3D2B1F]">
                <span>Lucro Líquido na Fornada:</span>
                <span>+ R$ {batchNetProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Raw Ingredient Cadastre */}
          <div className="bg-white p-6 rounded-[2rem] border-4 border-[#3D2B1F] shadow-[6px_6px_0px_0px_#3D2B1F] space-y-4">
            <h3 className="font-black text-[#3D2B1F] uppercase text-base">
              📦 Cadastrar Preço dos Insumos
            </h3>

            <form onSubmit={handleAddIngredient} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block font-black text-[#3D2B1F] uppercase mb-1">Nome do Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gotas de Choc. 1kg"
                  value={ingName}
                  onChange={e => setIngName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Preço (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="28,00"
                    value={ingPrice}
                    onChange={e => setIngPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Qtd Emb.</label>
                  <input
                    type="text"
                    required
                    placeholder="1000"
                    value={ingSize}
                    onChange={e => setIngSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#3D2B1F] uppercase mb-1">Unidade</label>
                  <select
                    value={ingUnit}
                    onChange={e => setIngUnit(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-[#F7EFE5] font-black uppercase outline-none"
                  >
                    <option value="g">Grama (g)</option>
                    <option value="ml">Ml (ml)</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#99582A] hover:bg-[#3D2B1F] text-white font-black uppercase rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F]"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Insumo</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
