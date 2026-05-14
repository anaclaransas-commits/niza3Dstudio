/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  ChevronRight, 
  Info,
  Save,
  Printer as PrinterIcon,
  Droplets,
  Zap,
  Clock,
  Weight,
  Percent,
  User,
  Package,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../store';
import { calculate3DPrintCost, formatCurrency, cn } from '../lib/utils';
import { CalculationResult } from '../types';

export function Calculator() {
  const { filaments, printers, clients, addBudget, products } = useStore();
  
  const [selectedFilamentId, setSelectedFilamentId] = useState('');
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const [manualFilamentPrice, setManualFilamentPrice] = useState('120');
  const [weightG, setWeightG] = useState('50');
  const [printTimeHours, setPrintTimeHours] = useState('5');
  const [energyPriceKWh, setEnergyPriceKWh] = useState('0.85');
  const [failureRate, setFailureRate] = useState('5');
  const [laborRate, setLaborRate] = useState('15');
  const [margin, setMargin] = useState('100');
  const [quantity, setQuantity] = useState('1');

  const [result, setResult] = useState<CalculationResult | null>(null);

  const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
  const selectedPrinter = printers.find(p => p.id === selectedPrinterId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const toPositiveNumber = (value: string, fallback: number) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
  };

  const toNonNegativeNumber = (value: string, fallback: number) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
  };

  // Auto-select first printer to avoid orphan budgets without machine reference
  useEffect(() => {
    if (!selectedPrinterId && printers.length > 0) {
      setSelectedPrinterId(printers[0].id);
    }
  }, [printers, selectedPrinterId]);

  // Auto-fill product weights
  useEffect(() => {
    if (selectedProduct && selectedProduct.defaultWeightG) {
      setWeightG(selectedProduct.defaultWeightG.toString());
    }
  }, [selectedProductId, selectedProduct]);

  useEffect(() => {
    const filamentPrice = selectedFilament
      ? selectedFilament.pricePerKg
      : toPositiveNumber(manualFilamentPrice, 120);

    const power = selectedPrinter ? selectedPrinter.powerConsumption : 250;
    const maint = selectedPrinter ? selectedPrinter.maintenanceCostPerHour : 0.5;

    const calc = calculate3DPrintCost({
      pricePerKg: filamentPrice,
      weightG: toPositiveNumber(weightG, 1),
      printTimeHours: toPositiveNumber(printTimeHours, 1),
      powerConsumptionW: power,
      energyPriceKWh: toPositiveNumber(energyPriceKWh, 0.85),
      failureRatePercent: toNonNegativeNumber(failureRate, 0),
      laborRatePerHour: toNonNegativeNumber(laborRate, 0),
      profitMarginPercent: toNonNegativeNumber(margin, 0),
      maintenanceCostPerHour: toNonNegativeNumber(String(maint), 0),
      quantity: Math.max(1, Math.floor(toPositiveNumber(quantity, 1))),
    });

    setResult(calc);
  }, [
    selectedFilamentId,
    selectedPrinterId,
    manualFilamentPrice,
    weightG,
    printTimeHours,
    energyPriceKWh,
    failureRate,
    laborRate,
    margin,
    quantity,
    selectedFilament,
    selectedPrinter,
  ]);

  const handleSaveBudget = () => {
    if (!result) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(toPositiveNumber(quantity, 1)));
    const safeWeight = toPositiveNumber(weightG, 0);
    const safePrintTime = toPositiveNumber(printTimeHours, 0);

    if (safeWeight <= 0 || safePrintTime <= 0) {
      alert('Preencha peso e tempo com valores maiores que zero antes de salvar.');
      return;
    }

    if (!selectedPrinterId) {
      alert('Selecione uma impressora para salvar o orçamento.');
      return;
    }

    addBudget({
      clientId: selectedClientId,
      productId: selectedProductId,
      printerId: selectedPrinterId,
      filamentId: selectedFilamentId,
      status: 'Pendente',
      date: new Date().toISOString(),
      printTimeHours: safePrintTime,
      weightG: safeWeight,
      quantity: safeQuantity,
      price: result.batchFinalPrice,
      profit: result.batchTotalProfit,
      calculation: result,
    });

    alert('Orçamento de lote salvo com sucesso!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
              <CalcIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl">Calculadora Inteligente</h3>
              <p className="text-slate-500 text-sm">Cálculos precisos baseados em seus insumos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Package className="w-3 h-3 mr-2" /> Produto Cadastrado
              </label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
              >
                <option value="">Peça Personalizada</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Droplets className="w-3 h-3 mr-2" /> Material / Filamento
              </label>
              <select 
                value={selectedFilamentId}
                onChange={(e) => setSelectedFilamentId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
              >
                <option value="">Cálculo Manual (R$ / Kg)</option>
                {filaments.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({formatCurrency(f.pricePerKg)}/Kg)</option>
                ))}
              </select>
            </div>

            {!selectedFilament && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preço Kg (Manual)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input 
                    type="number"
                    value={manualFilamentPrice}
                    onChange={(e) => setManualFilamentPrice(e.target.value)}
                    className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <PrinterIcon className="w-3 h-3 mr-2" /> Hardware / Máquina
              </label>
              <select 
                value={selectedPrinterId}
                onChange={(e) => setSelectedPrinterId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
              >
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.powerConsumption}W)</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <User className="w-3 h-3 mr-2" /> Cliente do Orçamento
              </label>
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
              >
                <option value="">Cliente Avulso</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantidade de Peças</label>
              <input 
                type="number" min="1" value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                className="w-full p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Parâmetros Técnicos da Peça</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Horas
              </label>
              <input 
                type="number" value={printTimeHours} 
                onChange={(e) => setPrintTimeHours(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Weight className="w-4 h-4 mr-2 text-emerald-500" /> Gramas
              </label>
              <input 
                type="number" value={weightG} 
                onChange={(e) => setWeightG(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Percent className="w-4 h-4 mr-2 text-rose-500" /> Falhas %
              </label>
              <input 
                type="number" value={failureRate} 
                onChange={(e) => setFailureRate(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Percent className="w-4 h-4 mr-2 text-blue-500" /> Margem %
              </label>
              <input 
                type="number" value={margin} 
                onChange={(e) => setMargin(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col h-full ring-1 ring-white/10">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Detalhamento Unitário</h3>
              {Number(quantity) > 1 && (
                <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-blue-900">
                  Lote x{quantity}
                </span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Material ({weightG}g)</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitMaterialCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Energia ({printTimeHours}h)</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitEnergyCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Manutenção</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitMaintCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Margem de Falha</span>
                <span className="text-sm font-bold text-rose-400/80">{formatCurrency(result?.unitFailureCost || 0)}</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-300 text-sm font-black">Custo Real (Un)</span>
                <span className="text-lg font-black text-slate-200">{formatCurrency(result?.unitTotalCost || 0)}</span>
              </div>
            </div>

            <div className="mt-auto space-y-6">
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] text-blue-100 uppercase font-black tracking-[0.2em]">Total Orçamentos</p>
                  <TrendingUp className="w-4 h-4 text-blue-200" />
                </div>
                <h2 className="text-4xl font-black text-white mb-1">
                  {formatCurrency(result?.batchFinalPrice || 0)}
                </h2>
                <div className="flex items-center text-blue-100 text-[10px] font-bold">
                  <span className="bg-white/20 px-2 py-0.5 rounded mr-2">Lucro: {formatCurrency(result?.batchTotalProfit || 0)}</span>
                </div>
              </div>

              <button 
                id="save-budget-final"
                onClick={handleSaveBudget}
                disabled={!result}
                className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                Salvar Orçamento
              </button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </div>
      </div>
    </div>
  );
}
