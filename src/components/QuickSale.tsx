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
  AlertCircle
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, roundCurrencyValue, parseLocalizedNumber } from '../lib/utils';
import { CalculationResult } from '../types';

export function QuickSale() {
  const { clients, products, addBudget, filaments, printers, calculatorDefaults } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [finalPrice, setFinalPrice] = useState('');
  const [customPrice, setCustomPrice] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-fill price when product is selected
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.basePrice && !customPrice) {
      setFinalPrice(selectedProduct.basePrice.toString());
    }
  }, [selectedProduct, customPrice]);

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

      // Calculate basic cost for profit tracking
      const weightG = selectedProduct?.defaultWeightG || 50;
      const printTimeHours = selectedProduct?.avgPrintTimeHours || 5;
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
        productId: selectedProductId,
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
      setCustomPrice(false);
      setNotes('');
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
          <div className="relative">
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
          {clients.length === 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Cadastre clientes primeiro na aba "Clientes"
            </p>
          )}
        </div>

        {/* Produto */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Package className="w-3 h-3 mr-2" /> Produto
          </label>
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
          {products.length === 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Cadastre produtos primeiro na aba "Produtos"
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
                  setCustomPrice(true);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all"
                placeholder="0.00"
                required
              />
              {selectedProduct && selectedProduct.basePrice && !customPrice && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">
                  Auto
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo */}
        {selectedProduct && finalPrice && (
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