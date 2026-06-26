/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Users, Package, FileText, DollarSign, LayoutDashboard, Calculator, BookOpen, ArrowRight, Command } from 'lucide-react';
import { useStore } from '../store';
import { type PageId } from './Sidebar';
import { cn } from '../lib/utils';

interface SearchResult {
  id: string;
  type: 'client' | 'product' | 'budget' | 'finance' | 'page';
  title: string;
  subtitle: string;
  action: () => void;
  icon: React.ElementType;
}

interface GlobalSearchProps {
  onNavigate: (page: PageId) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { clients, products, budgets, financeEntries } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      // Show quick actions when no search term
      const quickActions: SearchResult[] = [
        {
          id: 'dashboard',
          type: 'page',
          title: 'Dashboard',
          subtitle: 'Visão geral do negócio',
          action: () => { onNavigate('dashboard'); setIsOpen(false); },
          icon: LayoutDashboard,
        },
        {
          id: 'calculator',
          type: 'page',
          title: 'Calculadora',
          subtitle: 'Criar novo orçamento',
          action: () => { onNavigate('calculator'); setIsOpen(false); },
          icon: Calculator,
        },
        {
          id: 'budgets',
          type: 'page',
          title: 'Orçamentos',
          subtitle: 'Gerenciar orçamentos',
          action: () => { onNavigate('budgets'); setIsOpen(false); },
          icon: FileText,
        },
        {
          id: 'clients',
          type: 'page',
          title: 'Clientes',
          subtitle: 'Gerenciar clientes',
          action: () => { onNavigate('clients'); setIsOpen(false); },
          icon: Users,
        },
        {
          id: 'products',
          type: 'page',
          title: 'Produtos',
          subtitle: 'Gerenciar produtos',
          action: () => { onNavigate('products'); setIsOpen(false); },
          icon: Package,
        },
        {
          id: 'reports',
          type: 'page',
          title: 'Financeiro',
          subtitle: 'Relatórios financeiros',
          action: () => { onNavigate('reports'); setIsOpen(false); },
          icon: DollarSign,
        },
        {
          id: 'catalog',
          type: 'page',
          title: 'Catálogo',
          subtitle: 'Gerenciar catálogo público',
          action: () => { onNavigate('catalog'); setIsOpen(false); },
          icon: BookOpen,
        },
      ];
      return quickActions;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search clients
    clients.forEach(client => {
      if (client.name.toLowerCase().includes(term) || 
          client.email.toLowerCase().includes(term) ||
          client.phone.includes(term)) {
        results.push({
          id: client.id,
          type: 'client',
          title: client.name,
          subtitle: `${client.email} • ${client.phone}`,
          action: () => { onNavigate('clients'); setIsOpen(false); },
          icon: Users,
        });
      }
    });

    // Search products
    products.forEach(product => {
      if (product.name.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.materialType?.toLowerCase().includes(term)) {
        results.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `${product.materialType} • ${product.description?.substring(0, 50)}...`,
          action: () => { onNavigate('products'); setIsOpen(false); },
          icon: Package,
        });
      }
    });

    // Search budgets
    budgets.forEach(budget => {
      const client = clients.find(c => c.id === budget.clientId);
      const product = products.find(p => p.id === budget.productId);
      const clientName = client?.name || 'Cliente desconhecido';
      const productName = product?.name || 'Produto desconhecido';
      
      if (clientName.toLowerCase().includes(term) ||
          productName.toLowerCase().includes(term) ||
          budget.id.toLowerCase().includes(term)) {
        results.push({
          id: budget.id,
          type: 'budget',
          title: `${clientName} - ${productName}`,
          subtitle: `Status: ${budget.status} • ${new Date(budget.date).toLocaleDateString('pt-BR')}`,
          action: () => { onNavigate('budgets'); setIsOpen(false); },
          icon: FileText,
        });
      }
    });

    // Search finance entries
    financeEntries.forEach(entry => {
      if (entry.title.toLowerCase().includes(term) ||
          entry.category.toLowerCase().includes(term)) {
        results.push({
          id: entry.id,
          type: 'finance',
          title: entry.title,
          subtitle: `${entry.type} • ${entry.category} • ${new Date(entry.date).toLocaleDateString('pt-BR')}`,
          action: () => { onNavigate('reports'); setIsOpen(false); },
          icon: DollarSign,
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, clients, products, budgets, financeEntries, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setSearchTerm('');
        setSelectedIndex(0);
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      // Navigate results with arrow keys
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter' && searchResults.length > 0) {
          e.preventDefault();
          searchResults[selectedIndex]?.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar clientes, produtos, orçamentos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 text-lg outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={result.action}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
                    index === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    result.type === 'client' && "bg-blue-100 text-blue-600",
                    result.type === 'product' && "bg-emerald-100 text-emerald-600",
                    result.type === 'budget' && "bg-amber-100 text-amber-600",
                    result.type === 'finance' && "bg-purple-100 text-purple-600",
                    result.type === 'page' && "bg-slate-100 text-slate-600"
                  )}>
                    <result.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900">{result.title}</p>
                    <p className="text-sm text-slate-500">{result.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">↑↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">↵</kbd>
              <span>Selecionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Esc</kbd>
              <span>Fechar</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <kbd className="px-2 py-1 bg-white rounded border border-slate-300">K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}