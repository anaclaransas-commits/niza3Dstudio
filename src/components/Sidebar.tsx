/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  PlusCircle, 
  Users, 
  Package, 
  BarChart3, 
  FileText,
  BookOpen,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export type PageId = 'dashboard' | 'calculator' | 'registration' | 'clients' | 'products' | 'catalog' | 'reports' | 'budgets';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-blue-500 to-cyan-400' },
    { id: 'calculator', icon: Calculator, label: 'Calculadora', gradient: 'from-purple-500 to-pink-400' },
    { id: 'budgets', icon: FileText, label: 'Orçamentos', gradient: 'from-emerald-500 to-teal-400' },
    { id: 'registration', icon: PlusCircle, label: 'Cadastros', gradient: 'from-orange-500 to-amber-400' },
    { id: 'products', icon: Package, label: 'Produtos', gradient: 'from-rose-500 to-red-400' },
    { id: 'catalog', icon: BookOpen, label: 'Catálogo Cliente', gradient: 'from-indigo-500 to-violet-400' },
    { id: 'clients', icon: Users, label: 'Clientes', gradient: 'from-sky-500 to-blue-400' },
    { id: 'reports', icon: BarChart3, label: 'Financeiro', gradient: 'from-green-500 to-emerald-400' },
  ] as const;

  return (
    <>
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        id="sidebar-toggle"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl shadow-slate-900/50",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Niza3D Studio
                  </h1>
                  <p className="text-slate-400 text-xs">Gestão Inteligente</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                  activePage === item.id 
                    ? "bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-white shadow-lg shadow-slate-900/50 border border-slate-600/50" 
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700/50"
                )}
              >
                {activePage === item.id && (
                  <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10", item.gradient)} />
                )}
                <div className={cn("relative z-10 flex items-center w-full")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                    activePage === item.id 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg shadow-slate-900/50` 
                      : "bg-slate-700/50 group-hover:bg-slate-600/50"
                  )}>
                    <item.icon className={cn("w-4 h-4", activePage === item.id ? "text-white" : "text-slate-400 group-hover:text-white transition-colors")} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activePage === item.id && (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/30">
                BC
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">Brenno Castro</p>
                <p className="text-xs text-emerald-400 truncate text-ellipsis">Admin Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
