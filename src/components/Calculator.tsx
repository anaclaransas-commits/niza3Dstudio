/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Printer as PrinterIcon,
  Droplets,
  Zap,
  Clock,
  Weight,
  Percent,
  User,
  Package,
  TrendingUp,
  UserPlus,
  Box,
  Tag,
  CheckCircle2,
  X,
  Save,
  History,
  Layers,
  PieChart,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';
import { useStore } from '../store';
import {
  calculate3DPrintCost,
  formatCurrency,
  parseLocalizedNumber,
  roundCurrencyValue,
  isApprovedBudget,
} from '../lib/utils';
import { CalculationResult, CalculatorTemplate } from '../types';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const DEFAULT_CEMIG_ENERGY_PRICE_KWH = '0.85858';
const DEFAULT_MANUAL_POWER_CONSUMPTION_W = '200';

export function Calculator() {
  const {
    filaments,
    printers,
    clients,
    addBudget,
    addClient,
    addProduct,
    products,
    calculatorDefaults,
    updateCalculatorDefaults,
    calculatorTemplates,
    addCalculatorTemplate,
    removeCalculatorTemplate,
    budgets,
    addActivityLog,
  } = useStore();
  
  const [selectedFilamentId, setSelectedFilamentId] = useState(calculatorDefaults.selectedFilamentId);
  const [selectedPrinterId, setSelectedPrinterId] = useState(calculatorDefaults.selectedPrinterId);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [manualFilamentPrice, setManualFilamentPrice] = useState(calculatorDefaults.manualFilamentPrice || '120');
  const [manualPowerConsumptionW, setManualPowerConsumptionW] = useState(
    calculatorDefaults.manualPowerConsumptionW || DEFAULT_MANUAL_POWER_CONSUMPTION_W,
  );
  const [weightG, setWeightG] = useState('50');
  const [printTimeHours, setPrintTimeHours] = useState('5');
  const [energyPriceKWh, setEnergyPriceKWh] = useState(calculatorDefaults.energyPriceKWh || DEFAULT_CEMIG_ENERGY_PRICE_KWH);
  const [laborCostFixed, setLaborCostFixed] = useState(calculatorDefaults.laborCostFixed || '0');
  const [fixedCostPerPiece, setFixedCostPerPiece] = useState(calculatorDefaults.fixedCostPerPiece || '0');
  const [margin, setMargin] = useState(calculatorDefaults.margin || '30');
  const [quantity, setQuantity] = useState(calculatorDefaults.quantity || '1');

  const [result, setResult] = useState<CalculationResult | null>(null);

  // Product type modes
  const [productType, setProductType] = useState<'catalog' | 'custom' | 'generic'>('catalog');
  
  // Quick add client
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [quickClientForm, setQuickClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Custom product form
  const [customProductForm, setCustomProductForm] = useState({
    name: '',
    description: '',
    materialType: 'PLA',
    basePrice: '',
    defaultWeightG: '50',
    avgPrintTimeHours: '5'
  });
  
  // Generic sale form
  const [genericSaleForm, setGenericSaleForm] = useState({
    description: '',
    weightG: '50',
    printTimeHours: '5'
  });

  // Quick Templates
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Price History
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  
  // Bulk Calculator
  const [showBulkCalculator, setShowBulkCalculator] = useState(false);
  const [bulkItems, setBulkItems] = useState<Array<{ weightG: string; printTimeHours: string; quantity: string }>>([
    { weightG: '50', printTimeHours: '5', quantity: '1' }
  ]);
  
  // Cost Breakdown
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
  const selectedPrinter = printers.find(p => p.id === selectedPrinterId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-fill product weights
  useEffect(() => {
    if (selectedProduct && selectedProduct.defaultWeightG && productType === 'catalog') {
      setWeightG(selectedProduct.defaultWeightG.toString());
    }
  }, [selectedProduct, productType]);

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientForm.name.trim() || !quickClientForm.phone.trim()) {
      alert('Preencha pelo menos nome e telefone do cliente.');
      return;
    }
    
    const newClient = addClient({
      name: quickClientForm.name,
      email: quickClientForm.email,
      phone: quickClientForm.phone,
      address: quickClientForm.address
    });
    
    setSelectedClientId(newClient.id);
    setQuickClientForm({ name: '', email: '', phone: '', address: '' });
    setShowQuickAddClient(false);
  };

  useEffect(() => {
    updateCalculatorDefaults({
      selectedFilamentId,
      selectedPrinterId,
      manualFilamentPrice,
      manualPowerConsumptionW,
      energyPriceKWh,
      laborCostFixed,
      fixedCostPerPiece,
      margin,
      quantity,
    });
  }, [
    selectedFilamentId,
    selectedPrinterId,
    manualFilamentPrice,
    manualPowerConsumptionW,
    energyPriceKWh,
    laborCostFixed,
    fixedCostPerPiece,
    margin,
    quantity,
  ]);

  useEffect(() => {
    const calc = calculate3DPrintCost({
      pricePerKg: selectedFilament ? selectedFilament.pricePerKg : manualFilamentPrice,
      weightG,
      printTimeHours,
      powerConsumptionW: selectedPrinter ? selectedPrinter.powerConsumption : manualPowerConsumptionW,
      energyPriceKWh,
      laborCostFixed,
      fixedCostPerPiece,
      profitMarginPercent: margin,
      quantity,
    });

    setResult(calc);
  }, [
    manualFilamentPrice,
    manualPowerConsumptionW,
    weightG,
    printTimeHours,
    energyPriceKWh,
    laborCostFixed,
    fixedCostPerPiece,
    margin,
    quantity,
    selectedFilament,
    selectedPrinter,
  ]);

  const handleSaveBudget = (status: 'Pendente' | 'Aprovado' = 'Pendente') => {
    if (!result) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(parseLocalizedNumber(quantity, 1)));
    const safeWeight = parseLocalizedNumber(weightG, 0);
    const safePrintTime = parseLocalizedNumber(printTimeHours, 0);

    if (safeWeight <= 0 || safePrintTime <= 0) {
      alert('Preencha peso e tempo com valores maiores que zero antes de salvar.');
      return;
    }

    // Handle different product types
    let finalProductId = selectedProductId;
    let finalWeightG = safeWeight;
    let finalPrintTimeHours = safePrintTime;

    if (productType === 'custom') {
      // Create custom product
      const customProduct = addProduct({
        name: customProductForm.name,
        description: customProductForm.description,
        materialType: customProductForm.materialType,
        basePrice: result.batchFinalPrice / safeQuantity,
        defaultWeightG: parseLocalizedNumber(customProductForm.defaultWeightG, 50),
        avgPrintTimeHours: parseLocalizedNumber(customProductForm.avgPrintTimeHours, 5),
        isPublic: false
      });
      finalProductId = customProduct.id;
      finalWeightG = customProduct.defaultWeightG || safeWeight;
      finalPrintTimeHours = customProduct.avgPrintTimeHours || safePrintTime;
    } else if (productType === 'generic') {
      // Create generic product for tracking
      const genericProduct = addProduct({
        name: `Impressão Avulsa - ${genericSaleForm.description.substring(0, 30)}...`,
        description: genericSaleForm.description,
        materialType: 'PLA',
        basePrice: result.batchFinalPrice / safeQuantity,
        defaultWeightG: parseLocalizedNumber(genericSaleForm.weightG, 50),
        avgPrintTimeHours: parseLocalizedNumber(genericSaleForm.printTimeHours, 5),
        isPublic: false
      });
      finalProductId = genericProduct.id;
      finalWeightG = genericProduct.defaultWeightG || safeWeight;
      finalPrintTimeHours = genericProduct.avgPrintTimeHours || safePrintTime;
    }

    const newBudget = addBudget({
      clientId: selectedClientId,
      productId: finalProductId,
      printerId: selectedPrinterId,
      filamentId: selectedFilamentId,
      status: status,
      date: new Date().toISOString(),
      printTimeHours: finalPrintTimeHours,
      weightG: finalWeightG,
      quantity: safeQuantity,
      price: roundCurrencyValue(result.batchFinalPrice),
      profit: roundCurrencyValue(result.batchTotalProfit),
      calculation: result,
    });

    // Log activity
    addActivityLog({
      type: status === 'Aprovado' ? 'sale' : 'approval',
      description: `${status === 'Aprovado' ? 'Venda' : 'Orçamento'} criado: ${formatCurrency(result.batchFinalPrice)}`,
      entityId: newBudget.id,
      entityType: 'budget',
    });

    const message = status === 'Aprovado' 
      ? 'Venda registrada com sucesso!' 
      : 'Orçamento salvo com sucesso!';
    
    alert(message);
    
    // Reset form
    if (status === 'Aprovado') {
      handleResetDefaults();
    }
  };

  // Template functions
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Digite um nome para o template.');
      return;
    }

    addCalculatorTemplate({
      name: templateName,
      filamentId: selectedFilamentId,
      printerId: selectedPrinterId,
      weightG: parseLocalizedNumber(weightG, 50),
      printTimeHours: parseLocalizedNumber(printTimeHours, 5),
      margin: parseLocalizedNumber(margin, 30),
      laborCostFixed: parseLocalizedNumber(laborCostFixed, 0),
      fixedCostPerPiece: parseLocalizedNumber(fixedCostPerPiece, 0),
      quantity: parseLocalizedNumber(quantity, 1),
    });

    setTemplateName('');
    setShowTemplates(false);
    alert('Template salvo com sucesso!');
  };

  const handleLoadTemplate = (template: CalculatorTemplate) => {
    setSelectedFilamentId(template.filamentId);
    setSelectedPrinterId(template.printerId);
    setWeightG(template.weightG.toString());
    setPrintTimeHours(template.printTimeHours.toString());
    setMargin(template.margin.toString());
    setLaborCostFixed(template.laborCostFixed.toString());
    setFixedCostPerPiece(template.fixedCostPerPiece.toString());
    setQuantity(template.quantity.toString());
    setShowTemplates(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Deseja excluir este template?')) {
      removeCalculatorTemplate(templateId);
    }
  };

  // Price history for client/product
  const getPriceHistory = () => {
    const clientBudgets = selectedClientId 
      ? budgets.filter(b => b.clientId === selectedClientId && isApprovedBudget(b.status))
      : [];
    const productBudgets = selectedProductId
      ? budgets.filter(b => b.productId === selectedProductId && isApprovedBudget(b.status))
      : [];
    
    return [...clientBudgets, ...productBudgets].slice(0, 5);
  };

  // Bulk calculator functions
  const handleAddBulkItem = () => {
    setBulkItems([...bulkItems, { weightG: '50', printTimeHours: '5', quantity: '1' }]);
  };

  const handleRemoveBulkItem = (index: number) => {
    setBulkItems(bulkItems.filter((_, i) => i !== index));
  };

  const handleBulkItemChange = (index: number, field: string, value: string) => {
    const newItems = [...bulkItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBulkItems(newItems);
  };

  const calculateBulkTotal = () => {
    return bulkItems.reduce((total, item) => {
      const calc = calculate3DPrintCost({
        pricePerKg: selectedFilament ? selectedFilament.pricePerKg : manualFilamentPrice,
        weightG: item.weightG,
        printTimeHours: item.printTimeHours,
        powerConsumptionW: selectedPrinter ? selectedPrinter.powerConsumption : manualPowerConsumptionW,
        energyPriceKWh,
        laborCostFixed,
        fixedCostPerPiece,
        profitMarginPercent: margin,
        quantity: item.quantity,
      });
      return total + calc.batchFinalPrice;
    }, 0);
  };

  // Cost breakdown data
  const getCostBreakdownData = () => {
    if (!result) return [];
    
    return [
      { name: 'Material', value: result.unitMaterialCost * parseLocalizedNumber(quantity, 1), color: '#3b82f6' },
      { name: 'Energia', value: result.unitEnergyCost * parseLocalizedNumber(quantity, 1), color: '#f59e0b' },
      { name: 'Mão de obra', value: result.unitLaborCost * parseLocalizedNumber(quantity, 1), color: '#10b981' },
      { name: 'Custo fixo', value: result.unitFixedCost * parseLocalizedNumber(quantity, 1), color: '#8b5cf6' },
      { name: 'Lucro', value: result.batchTotalProfit, color: '#ec4899' },
    ];
  };

  const handleResetDefaults = () => {
    setSelectedFilamentId('');
    setSelectedPrinterId('');
    setSelectedClientId('');
    setSelectedProductId('');
    setManualFilamentPrice('120');
    setManualPowerConsumptionW(DEFAULT_MANUAL_POWER_CONSUMPTION_W);
    setWeightG('50');
    setPrintTimeHours('5');
    setEnergyPriceKWh(DEFAULT_CEMIG_ENERGY_PRICE_KWH);
    setLaborCostFixed('0');
    setFixedCostPerPiece('0');
    setMargin('30');
    setQuantity('1');
    setProductType('catalog');
    setCustomProductForm({ name: '', description: '', materialType: 'PLA', basePrice: '', defaultWeightG: '50', avgPrintTimeHours: '5' });
    setGenericSaleForm({ description: '', weightG: '50', printTimeHours: '5' });
  };

  const normalizedPowerConsumptionW = selectedPrinter
    ? selectedPrinter.powerConsumption
    : parseLocalizedNumber(manualPowerConsumptionW, 0);
  const derivedEnergyCostPerHour =
    normalizedPowerConsumptionW > 0
      ? (normalizedPowerConsumptionW / 1000) * parseLocalizedNumber(energyPriceKWh, 0)
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                <CalcIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-xl">Calculadora Inteligente</h3>
                <p className="text-slate-500 text-sm">Use cadastros existentes ou calcule manualmente, sem precisar cadastrar nada.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                Lembra material, impressora, margem e custos
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                Peso e tempo continuam livres para cada peça
              </span>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Templates
              </button>
              <button
                type="button"
                onClick={() => setShowPriceHistory(!showPriceHistory)}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                Histórico
              </button>
              <button
                type="button"
                onClick={() => setShowBulkCalculator(!showBulkCalculator)}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                Bulk
              </button>
              <button
                type="button"
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 flex items-center gap-1"
              >
                <PieChart className="w-3 h-3" />
                Custos
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Restaurar padrões
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Package className="w-3 h-3 mr-2" /> Tipo de Produto
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setProductType('catalog')}
                  className={`flex-1 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                    productType === 'catalog' 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('custom')}
                  className={`flex-1 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                    productType === 'custom' 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Personalizado
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('generic')}
                  className={`flex-1 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                    productType === 'generic' 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Avulso
                </button>
              </div>

              {productType === 'catalog' && (
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              {productType === 'custom' && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    Produto Personalizado
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nome do produto *"
                      value={customProductForm.name}
                      onChange={(e) => setCustomProductForm({...customProductForm, name: e.target.value})}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <textarea
                      placeholder="Descrição (opcional)"
                      value={customProductForm.description}
                      onChange={(e) => setCustomProductForm({...customProductForm, description: e.target.value})}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none h-16 resize-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={customProductForm.materialType}
                        onChange={(e) => setCustomProductForm({...customProductForm, materialType: e.target.value})}
                        className="p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="PLA">PLA</option>
                        <option value="ABS">ABS</option>
                        <option value="PETG">PETG</option>
                        <option value="TPU">TPU</option>
                        <option value="Resina">Resina</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Peso (g)"
                        value={customProductForm.defaultWeightG}
                        onChange={(e) => setCustomProductForm({...customProductForm, defaultWeightG: e.target.value})}
                        className="p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Tempo (h)"
                        value={customProductForm.avgPrintTimeHours}
                        onChange={(e) => setCustomProductForm({...customProductForm, avgPrintTimeHours: e.target.value})}
                        className="p-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {productType === 'generic' && (
                <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-bold text-cyan-800 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Impressão Avulsa
                  </h4>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Descrição do que será impresso *"
                      value={genericSaleForm.description}
                      onChange={(e) => setGenericSaleForm({...genericSaleForm, description: e.target.value})}
                      className="w-full p-2.5 bg-white border border-cyan-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none h-16 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Peso estimado (g)"
                        value={genericSaleForm.weightG}
                        onChange={(e) => setGenericSaleForm({...genericSaleForm, weightG: e.target.value})}
                        className="p-2.5 bg-white border border-cyan-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Tempo estimado (h)"
                        value={genericSaleForm.printTimeHours}
                        onChange={(e) => setGenericSaleForm({...genericSaleForm, printTimeHours: e.target.value})}
                        className="p-2.5 bg-white border border-cyan-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                    type="text"
                    inputMode="decimal"
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
                <option value="">Cálculo Rápido Manual</option>
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.powerConsumption}W)</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {selectedPrinter
                  ? 'Usando potência cadastrada da impressora selecionada.'
                  : 'Modo manual ativo: informe a potência da máquina para calcular sem cadastro.'}
              </p>
            </div>

            {!selectedPrinter && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consumo Médio da Impressora (W)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualPowerConsumptionW}
                  onChange={(e) => setManualPowerConsumptionW(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <User className="w-3 h-3 mr-2" /> Cliente do Orçamento
              </label>
              <div className="flex gap-2">
                <select 
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                >
                  <option value="">Cliente Avulso</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClient(!showQuickAddClient)}
                  className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all font-medium border border-indigo-200"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
              
              {showQuickAddClient && (
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Cadastro Rápido de Cliente
                  </h4>
                  <form onSubmit={handleQuickAddClient} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome *"
                        value={quickClientForm.name}
                        onChange={(e) => setQuickClientForm({...quickClientForm, name: e.target.value})}
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Telefone *"
                        value={quickClientForm.phone}
                        onChange={(e) => setQuickClientForm({...quickClientForm, phone: e.target.value})}
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="Email"
                        value={quickClientForm.email}
                        onChange={(e) => setQuickClientForm({...quickClientForm, email: e.target.value})}
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Endereço"
                        value={quickClientForm.address}
                        onChange={(e) => setQuickClientForm({...quickClientForm, address: e.target.value})}
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickAddClient(false)}
                        className="flex-1 px-4 py-2 bg-white text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all border border-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Horas
              </label>
              <input 
                type="text"
                inputMode="decimal"
                value={printTimeHours} 
                onChange={(e) => setPrintTimeHours(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Weight className="w-4 h-4 mr-2 text-emerald-500" /> Gramas
              </label>
              <input 
                type="text"
                inputMode="decimal"
                value={weightG} 
                onChange={(e) => setWeightG(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-500" /> Tarifa de Energia (R$/kWh)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={energyPriceKWh}
                onChange={(e) => setEnergyPriceKWh(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm font-bold"
              />
              <p className="text-xs text-slate-500">
                Valor editável. Use a tarifa da sua conta de energia ou mantenha a referência padrão para orçamentos rápidos.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-500" /> Energia por Hora
              </label>
              <div className="w-full p-3 border border-blue-100 bg-blue-50 rounded-2xl text-sm font-black text-blue-700">
                {formatCurrency(derivedEnergyCostPerHour)}
              </div>
              <p className="text-xs text-slate-500">
                Valor automático por hora com base na tarifa e em {selectedPrinter ? 'sua impressora cadastrada' : 'potência manual'}.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-500" /> Mão de Obra (R$ fixo/peça)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={laborCostFixed}
                  onChange={(e) => setLaborCostFixed(e.target.value)}
                  className="w-full p-3 pl-10 border border-slate-200 rounded-2xl text-sm font-bold"
                />
              </div>
              <p className="text-xs text-slate-500">Preparação, acabamento, etc.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Package className="w-4 h-4 mr-2 text-amber-500" /> Custos Fixos (R$ fixo/peça)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fixedCostPerPiece}
                  onChange={(e) => setFixedCostPerPiece(e.target.value)}
                  className="w-full p-3 pl-10 border border-slate-200 rounded-2xl text-sm font-bold"
                />
              </div>
              <p className="text-xs text-slate-500">Desgaste da impressora, acabamento, etc.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Percent className="w-4 h-4 mr-2 text-blue-500" /> Margem de Lucro %
              </label>
              <input 
                type="text"
                inputMode="decimal"
                value={margin} 
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
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Filamento ({weightG}g)</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitMaterialCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Energia ({printTimeHours}h)</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitEnergyCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Mão de Obra</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitLaborCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Custos Fixos</span>
                <span className="text-sm font-bold text-slate-300">{formatCurrency(result?.unitFixedCost || 0)}</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-300 text-sm font-black">Custo Total (Un)</span>
                <span className="text-lg font-black text-slate-200">{formatCurrency(result?.unitTotalCost || 0)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-500 text-xs font-medium group-hover:text-slate-300 transition-colors">Lucro ({margin}%)</span>
                <span className="text-sm font-bold text-emerald-400">{formatCurrency(result?.unitProfit || 0)}</span>
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

              <div className="space-y-3">
                <button 
                  id="save-budget-pending"
                  onClick={() => handleSaveBudget('Pendente')}
                  disabled={!result}
                  className="w-full py-4 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  Salvar como Orçamento
                </button>
                <button 
                  id="save-budget-approved"
                  onClick={() => handleSaveBudget('Aprovado')}
                  disabled={!result}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:from-emerald-600 hover:to-cyan-600 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  Aprovar e Registrar Venda
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Templates Rápidos</h3>
                <button onClick={() => setShowTemplates(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do template..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 p-3 border border-slate-200 rounded-xl"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {calculatorTemplates.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">Nenhum template salvo</p>
                  ) : (
                    calculatorTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{template.name}</p>
                          <p className="text-xs text-slate-500">
                            {template.weightG}g • {template.printTimeHours}h • {template.margin}% margem
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadTemplate(template)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price History Modal */}
        {showPriceHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Histórico de Preços</h3>
                <button onClick={() => setShowPriceHistory(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {getPriceHistory().length === 0 ? (
                  <p className="text-center text-slate-400 py-4">Nenhum histórico encontrado</p>
                ) : (
                  getPriceHistory().map((budget) => {
                    const client = clients.find(c => c.id === budget.clientId);
                    const product = products.find(p => p.id === budget.productId);
                    return (
                      <div key={budget.id} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800">{product?.name || 'Peça Customizada'}</p>
                            <p className="text-xs text-slate-500">{client?.name || 'Cliente'}</p>
                          </div>
                          <p className="font-bold text-emerald-600">{formatCurrency(budget.price)}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{new Date(budget.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Calculator Modal */}
        {showBulkCalculator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Calculadora em Massa</h3>
                <button onClick={() => setShowBulkCalculator(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {bulkItems.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Item #{index + 1}</span>
                      {bulkItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveBulkItem(index)}
                          className="p-1 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500">Peso (g)</label>
                        <input
                          type="text"
                          value={item.weightG}
                          onChange={(e) => handleBulkItemChange(index, 'weightG', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">Tempo (h)</label>
                        <input
                          type="text"
                          value={item.printTimeHours}
                          onChange={(e) => handleBulkItemChange(index, 'printTimeHours', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">Qtd</label>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleBulkItemChange(index, 'quantity', e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddBulkItem}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Item
                </button>

                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Estimado:</span>
                    <span className="text-2xl font-black">{formatCurrency(calculateBulkTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown Modal */}
        {showCostBreakdown && result && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Breakdown de Custos</h3>
                <button onClick={() => setShowCostBreakdown(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getCostBreakdownData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCostBreakdownData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {getCostBreakdownData().map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
