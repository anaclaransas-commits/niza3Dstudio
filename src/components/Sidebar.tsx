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
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export type PageId = 'dashboard' | 'calculator' | 'registration' | 'clients' | 'products' | 'catalog' | 'reports' | 'budgets';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calculator', icon: Calculator, label: 'Calculadora' },
    { id: 'budgets', icon: FileText, label: 'Orçamentos' },
    { id: 'registration', icon: PlusCircle, label: 'Cadastros' },
    { id: 'products', icon: Package, label: 'Produtos' },
    { id: 'catalog', icon: BookOpen, label: 'Catálogo Cliente' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'reports', icon: BarChart3, label: 'Relatórios' },
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
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              3DPrint Master
            </h1>
            <p className="text-slate-400 text-xs mt-1">Gestão Inteligente</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activePage === item.id 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                BC
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Brenno Castro</p>
                <p className="text-xs text-slate-400 truncate text-ellipsis">Admin Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
