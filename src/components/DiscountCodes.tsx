/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Package,
  Percent,
  Copy,
  Search,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/utils';

export function DiscountCodes() {
  const { discountCodes, addDiscountCode, updateDiscountCode, removeDiscountCode, clients, products } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 10,
    minOrderValue: 0,
    maxUses: 100,
    validUntil: '',
    applicableClients: [] as string[],
    applicableProducts: [] as string[],
    isActive: true,
  });

  const filteredCodes = discountCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateDiscountCode(editingId, formData);
    } else {
      addDiscountCode(formData);
    }
    
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      discountPercent: 10,
      minOrderValue: 0,
      maxUses: 100,
      validUntil: '',
      applicableClients: [],
      applicableProducts: [],
      isActive: true,
    });
  };

  const handleEdit = (codeId: string) => {
    const code = discountCodes.find(c => c.id === codeId);
    if (code) {
      setEditingId(codeId);
      setFormData({
        code: code.code,
        discountPercent: code.discountPercent,
        minOrderValue: code.minOrderValue || 0,
        maxUses: code.maxUses || 100,
        validUntil: code.validUntil || '',
        applicableClients: code.applicableClients || [],
        applicableProducts: code.applicableProducts || [],
        isActive: code.isActive,
      });
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este código de desconto?')) {
      removeDiscountCode(id);
    }
  };

  const handleToggleActive = (id: string) => {
    const code = discountCodes.find(c => c.id === id);
    if (code) {
      updateDiscountCode(id, { isActive: !code.isActive });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Códigos de Desconto</h2>
          <p className="text-slate-500 text-sm">Gerencie cupons de desconto para seus clientes</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              code: '',
              discountPercent: 10,
              minOrderValue: 0,
              maxUses: 100,
              validUntil: '',
              applicableClients: [],
              applicableProducts: [],
              isActive: true,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Código
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar códigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar Código de Desconto' : 'Novo Código de Desconto'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="PROMO10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Desconto (%) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Máximo de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Válido até</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={cn(
                      'w-full p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                      formData.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    )}
                  >
                    {formData.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {formData.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Users className="w-3 h-3" /> Clientes Aplicáveis
                </label>
                <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  {clients.map(client => (
                    <label key={client.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableClients.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableClients: [...formData.applicableClients, client.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableClients: formData.applicableClients.filter(id => id !== client.id),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{client.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Package className="w-3 h-3" /> Produtos Aplicáveis
                </label>
                <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableProducts: [...formData.applicableProducts, product.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableProducts: formData.applicableProducts.filter(id => id !== product.id),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Código'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.map(code => (
          <div
            key={code.id}
            className={cn(
              'bg-white rounded-2xl border p-6 transition-all',
              code.isActive ? 'border-slate-200 shadow-sm hover:shadow-lg' : 'border-slate-200 opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  code.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                )}>
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{code.code}</h3>
                  <span className={cn(
                    'text-xs font-bold px-2 py-1 rounded-full',
                    code.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {code.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(code.code)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copiar código"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleEdit(code.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Desconto</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {code.discountPercent}%
                </span>
              </div>

              {code.minOrderValue && code.minOrderValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Valor mínimo</span>
                  <span className="font-medium text-slate-900">{formatCurrency(code.minOrderValue)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Usos</span>
                <span className="font-medium text-slate-900">
                  {code.currentUses || 0} / {code.maxUses || '∞'}
                </span>
              </div>

              {code.validUntil && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Válido até</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(code.validUntil).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {(code.applicableClients && code.applicableClients.length > 0) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Clientes</span>
                  <span className="font-medium text-slate-900">{code.applicableClients.length}</span>
                </div>
              )}

              {(code.applicableProducts && code.applicableProducts.length > 0) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Produtos</span>
                  <span className="font-medium text-slate-900">{code.applicableProducts.length}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleToggleActive(code.id)}
              className={cn(
                'w-full mt-4 py-2 rounded-xl font-bold transition-all',
                code.isActive
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              )}
            >
              {code.isActive ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum código de desconto</h3>
          <p className="text-slate-500">Crie seu primeiro código de desconto para começar</p>
        </div>
      )}
    </div>
  );
}