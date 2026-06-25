/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  AlertCircle,
  UserPlus,
  Box,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, roundCurrencyValue, parseLocalizedNumber } from '../lib/utils';
import { CalculationResult } from '../types';

export function QuickSale() {
  const { clients, products, addBudget, addClient, addProduct, filaments, printers, calculatorDefaults } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [finalPrice, setFinalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  
  // Quick add states
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [productType, setProductType] = useState<'catalog' | 'custom' | 'generic'>('catalog');
  
  // Quick add client form
  const [quickClientForm, setQuickClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Quick add product form
  const [quickProductForm, setQuickProductForm] = useState({
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

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-fill price when product is selected
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.basePrice && productType === 'catalog') {
      setFinalPrice(selectedProduct.basePrice.toString());
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

  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProductForm.name.trim() || !quickProductForm.basePrice) {
      alert('Preencha nome e preço do produto.');
      return;
    }
    
    const newProduct = addProduct({
      name: quickProductForm.name,
      description: quickProductForm.description,
      materialType: quickProductForm.materialType,
      basePrice: parseLocalizedNumber(quickProductForm.basePrice, 0),
      defaultWeightG: parseLocalizedNumber(quickProductForm.defaultWeightG, 50),
      avgPrintTimeHours: parseLocalizedNumber(quickProductForm.avgPrintTimeHours, 5),
      isPublic: false // Custom products are not public by default
    });
    
    setSelectedProductId(newProduct.id);
    setQuickProductForm({ name: '', description: '', materialType: 'PLA', basePrice: '', defaultWeightG: '50', avgPrintTimeHours: '5' });
    setShowQuickAddProduct(false);
    setProductType('catalog');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const safeQuantity = Math.max(1, Math.floor(parseLocalizedNumber(quantity, 1)));
      const safePrice = parseLocalizedNumber(finalPrice, 0);

      if (safePrice <= 0) {
        alert('Informe um preço válido maior que zero.');
        setIsSubmitting(false);
        return;
      }

      if (!selectedClientId) {
        alert('Selecione um cliente para a venda.');
        setIsSubmitting(false);
        return;
      }

      if (productType === 'catalog' && !selectedProductId) {
        alert('Selecione um produto para a venda.');
        setIsSubmitting(false);
        return;
      }

      if (productType === 'custom' && !quickProductForm.name.trim()) {
        alert('Preencha o nome do produto personalizado.');
        setIsSubmitting(false);
        return;
      }

      if (productType === 'generic' && !genericSaleForm.description.trim()) {
        alert('Preencha a descrição da venda avulsa.');
        setIsSubmitting(false);
        return;
      }

      // Handle different product types
      let finalProductId = selectedProductId;
      let weightG = 50;
      let printTimeHours = 5;

      if (productType === 'custom') {
        // Create custom product
        const customProduct = addProduct({
          name: quickProductForm.name,
          description: quickProductForm.description,
          materialType: quickProductForm.materialType,
          basePrice: safePrice / safeQuantity,
          defaultWeightG: parseLocalizedNumber(quickProductForm.defaultWeightG, 50),
          avgPrintTimeHours: parseLocalizedNumber(quickProductForm.avgPrintTimeHours, 5),
          isPublic: false
        });
        finalProductId = customProduct.id;
        weightG = customProduct.defaultWeightG || 50;
        printTimeHours = customProduct.avgPrintTimeHours || 5;
      } else if (productType === 'generic') {
        // Create generic product for tracking
        const genericProduct = addProduct({
          name: `Venda Avulsa - ${genericSaleForm.description.substring(0, 30)}...`,
          description: genericSaleForm.description,
          materialType: 'PLA',
          basePrice: safePrice / safeQuantity,
          defaultWeightG: parseLocalizedNumber(genericSaleForm.weightG, 50),
          avgPrintTimeHours: parseLocalizedNumber(genericSaleForm.printTimeHours, 5),
          isPublic: false
        });
        finalProductId = genericProduct.id;
        weightG = genericProduct.defaultWeightG || 50;
        printTimeHours = genericProduct.avgPrintTimeHours || 5;
      } else {
        // Catalog product
        weightG = selectedProduct?.defaultWeightG || 50;
        printTimeHours = selectedProduct?.avgPrintTimeHours || 5;
      }

      // Calculate basic cost for profit tracking
      const selectedFilament = filaments[0]; // Use first filament as default
      const selectedPrinter = printers[0]; // Use first printer as default

      const calculation: CalculationResult = {
        unitMaterialCost: selectedFilament ? (selectedFilament.pricePerKg * weightG) / 1000 : 0,
        unitEnergyCost: selectedPrinter ? (selectedPrinter.powerConsumption / 1000) * printTimeHours * 0.86 : 0,
        unitLaborCost: 0,
        unitFixedCost: 0,
        unitTotalCost: selectedFilament ? (selectedFilament.pricePerKg * weightG) / 1000 : 0,
        unitFinalPrice: safePrice / safeQuantity,
        unitProfit: (safePrice / safeQuantity) - (selectedFilament ? (selectedFilament.pricePerKg * weightG) / 1000 : 0),
        batchTotalCost: safeQuantity * (selectedFilament ? (selectedFilament.pricePerKg * weightG) / 1000 : 0),
        batchFinalPrice: safePrice,
        batchTotalProfit: safePrice - (safeQuantity * (selectedFilament ? (selectedFilament.pricePerKg * weightG) / 1000 : 0)),
      };

      addBudget({
        clientId: selectedClientId,
        productId: finalProductId,
        printerId: selectedPrinter?.id || '',
        filamentId: selectedFilament?.id || '',
        status: 'Aprovado', // Direct to approved
        date: new Date().toISOString(),
        printTimeHours,
        weightG,
        quantity: safeQuantity,
        price: roundCurrencyValue(safePrice),
        profit: roundCurrencyValue(calculation.batchTotalProfit),
        calculation,
      });

      // Reset form
      setSelectedClientId('');
      setSelectedProductId('');
      setQuantity('1');
      setFinalPrice('');
      setNotes('');
      setProductType('catalog');
      setQuickProductForm({ name: '', description: '', materialType: 'PLA', basePrice: '', defaultWeightG: '50', avgPrintTimeHours: '5' });
      setGenericSaleForm({ description: '', weightG: '50', printTimeHours: '5' });
      setShowForm(false);
      setSuccessMessage(true);

      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('Erro ao registrar venda. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300">
        <CheckCircle2 className="w-6 h-6" />
        <div>
          <p className="font-bold">Venda registrada com sucesso!</p>
          <p className="text-sm opacity-90">Orçamento aprovado automaticamente.</p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 font-bold"
      >
        <Sparkles className="w-5 h-5" />
        <span>Venda Rápida</span>
        <Plus className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-xl">Venda Rápida</h3>
            <p className="text-sm text-slate-500">Registre a venda em segundos</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cliente */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <User className="w-3 h-3 mr-2" /> Cliente
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.email ? `(${client.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickAddClient(!showQuickAddClient)}
              className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all font-medium flex items-center gap-2 border border-indigo-200"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>
          
          {/* Quick Add Client Form */}
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
                    Salvar Cliente
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {clients.length === 0 && !showQuickAddClient && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Nenhum cliente cadastrado. Adicione um novo cliente acima.
            </p>
          )}
        </div>

        {/* Produto */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Package className="w-3 h-3 mr-2" /> Produto
          </label>
          
          {/* Product Type Selection */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setProductType('catalog')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                productType === 'catalog' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => setProductType('custom')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                productType === 'custom' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Personalizado
            </button>
            <button
              type="button"
              onClick={() => setProductType('generic')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                productType === 'generic' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Avulso
            </button>
          </div>

          {/* Catalog Product Selection */}
          {productType === 'catalog' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Selecione um produto...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.basePrice ? `- R$ ${product.basePrice}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Product Form */}
          {productType === 'custom' && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Produto Personalizado
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome do produto *"
                  value={quickProductForm.name}
                  onChange={(e) => setQuickProductForm({...quickProductForm, name: e.target.value})}
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={quickProductForm.description}
                  onChange={(e) => setQuickProductForm({...quickProductForm, description: e.target.value})}
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none h-20 resize-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={quickProductForm.materialType}
                    onChange={(e) => setQuickProductForm({...quickProductForm, materialType: e.target.value})}
                    className="p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
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
                    value={quickProductForm.defaultWeightG}
                    onChange={(e) => setQuickProductForm({...quickProductForm, defaultWeightG: e.target.value})}
                    className="p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tempo (h)"
                    value={quickProductForm.avgPrintTimeHours}
                    onChange={(e) => setQuickProductForm({...quickProductForm, avgPrintTimeHours: e.target.value})}
                    className="p-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generic Sale Form */}
          {productType === 'generic' && (
            <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-bold text-cyan-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Venda Avulsa
              </h4>
              <div className="space-y-3">
                <textarea
                  placeholder="Descrição do que foi vendido *"
                  value={genericSaleForm.description}
                  onChange={(e) => setGenericSaleForm({...genericSaleForm, description: e.target.value})}
                  className="w-full p-2.5 bg-white border border-cyan-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none h-20 resize-none"
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
          
          {productType === 'catalog' && products.length === 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Nenhum produto no catálogo. Use "Personalizado" ou "Avulso".
            </p>
          )}
        </div>

        {/* Quantidade e Preço */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Package className="w-3 h-3 mr-2" /> Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <DollarSign className="w-3 h-3 mr-2" /> Preço Final
            </label>
            <div className="relative">
              <input
                type="text"
                value={finalPrice}
                onChange={(e) => {
                  setFinalPrice(e.target.value);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all"
                placeholder="0.00"
                required
              />
              {selectedProduct && selectedProduct.basePrice && productType === 'catalog' && finalPrice === selectedProduct.basePrice.toString() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">
                  Auto
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo */}
        {finalPrice && (
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total da Venda:</span>
              <span className="text-lg font-black text-emerald-600">
                {formatCurrency(parseLocalizedNumber(finalPrice, 0) * Math.max(1, Math.floor(parseLocalizedNumber(quantity, 1))))}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Package className="w-3 h-3" />
              <span>
                {productType === 'catalog' && selectedProduct?.name}
                {productType === 'custom' && quickProductForm.name || 'Produto personalizado'}
                {productType === 'generic' && 'Venda avulsa'}
              </span>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Registrar Venda
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}