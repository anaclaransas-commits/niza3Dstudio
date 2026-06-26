/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  Tag as TagIcon,
  Palette,
  Search,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

const CATEGORY_COLORS = [
  { name: 'Azul', value: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'Verde', value: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { name: 'Amarelo', value: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
  { name: 'Vermelho', value: '#ef4444', bg: 'bg-rose-100', text: 'text-rose-700' },
  { name: 'Roxo', value: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700' },
  { name: 'Ciano', value: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { name: 'Laranja', value: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'Cinza', value: '#6b7280', bg: 'bg-slate-100', text: 'text-slate-700' },
];

export function ExpenseCategories() {
  const { expenseCategories, addExpenseCategory, updateExpenseCategory, removeExpenseCategory, financeEntries } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    budget: 0,
  });

  const filteredCategories = expenseCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateExpenseCategory(editingId, formData);
    } else {
      addExpenseCategory(formData);
    }
    
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      color: '#3b82f6',
      budget: 0,
    });
  };

  const handleEdit = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    if (category) {
      setEditingId(categoryId);
      setFormData({
        name: category.name,
        color: category.color,
        budget: category.budget || 0,
      });
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    const hasEntries = financeEntries.some(entry => entry.category === expenseCategories.find(c => c.id === id)?.name);
    if (hasEntries) {
      alert('Esta categoria possui lançamentos financeiros associados e não pode ser excluída.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      removeExpenseCategory(id);
    }
  };

  const getCategoryUsage = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    if (!category) return { count: 0, total: 0 };
    
    const entries = financeEntries.filter(entry => entry.category === category.name);
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    
    return { count: entries.length, total };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Categorias de Despesas</h2>
          <p className="text-slate-500 text-sm">Organize seus gastos por categorias</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              color: '#3b82f6',
              budget: 0,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Material, Manutenção"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all',
                        formData.color === color.value
                          ? 'border-slate-900 ring-2 ring-slate-900/20'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Orçamento Mensal (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0.00"
                />
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
                  {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(category => {
          const usage = getCategoryUsage(category.id);
          const colorInfo = CATEGORY_COLORS.find(c => c.value === category.color) || CATEGORY_COLORS[0];
          
          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{category.name}</h3>
                    <span className={cn('text-xs font-bold px-2 py-1 rounded-full', colorInfo.bg, colorInfo.text)}>
                      {usage.count} lançamento(s)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total gasto</span>
                  <span className="font-bold text-slate-900">
                    R$ {usage.total.toFixed(2)}
                  </span>
                </div>

                {category.budget && category.budget > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Orçamento</span>
                      <span className="font-medium text-slate-900">
                        R$ {category.budget.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((usage.total / category.budget) * 100, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Utilizado</span>
                      <span className={cn(
                        'font-bold',
                        usage.total > category.budget ? 'text-rose-600' : 'text-emerald-600'
                      )}>
                        {((usage.total / category.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma categoria</h3>
          <p className="text-slate-500">Crie sua primeira categoria para organizar suas despesas</p>
        </div>
      )}
    </div>
  );
}