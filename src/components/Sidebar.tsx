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

export type PageId = 'dashboard' | 'calculator' | 'registration' | 'clients' | 'products' | 'catalog' | 'reports' | 'budgets' | 'discounts';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'calculator', icon: Calculator, label: 'Calculadora', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'budgets', icon: FileText, label: 'Orçamentos', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'registration', icon: PlusCircle, label: 'Cadastros', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'products', icon: Package, label: 'Produtos', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'catalog', icon: BookOpen, label: 'Catálogo Cliente', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'clients', icon: Users, label: 'Clientes', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'discounts', icon: Sparkles, label: 'Descontos', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
    { id: 'reports', icon: BarChart3, label: 'Financeiro', fromColor: 'var(--color-primary)', toColor: 'var(--color-primary-hover)' },
  ] as const;

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md shadow-md lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        id="sidebar-toggle"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: 'var(--color-sidebar)', color: 'var(--color-text-primary)' }}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-petrol-400) 0%, var(--color-petrol-600) 100%)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(90deg, var(--color-petrol-300) 0%, var(--color-petrol-500) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Niza3D Studio
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Gestão Inteligente</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />}
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
                    ? "shadow-lg border"
                    : "border-transparent hover:border"
                )}
                style={activePage === item.id ? {
                  background: 'linear-gradient(90deg, var(--color-petrol-700)40 0%, var(--color-petrol-600)40 100%)',
                  borderColor: 'var(--color-petrol-500)',
                  boxShadow: '0 10px 15px -3px rgba(0, 50, 71, 0.5)',
                  color: 'var(--color-text-primary)'
                } : {
                  borderColor: 'transparent',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {activePage === item.id && (
                  <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(90deg, ${item.fromColor} 0%, ${item.toColor} 100%)` }} />
                )}
                <div className="relative z-10 flex items-center w-full">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                    activePage === item.id
                      ? "shadow-lg"
                      : "group-hover"
                  )} style={activePage === item.id ? {
                    background: `linear-gradient(135deg, ${item.fromColor} 0%, ${item.toColor} 100%)`,
                    boxShadow: '0 10px 15px -3px rgba(0, 50, 71, 0.5)'
                  } : {
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}>
                    <item.icon className={cn("w-4 h-4", activePage === item.id ? "text-white" : "transition-colors")} style={activePage === item.id ? {} : { color: 'var(--color-text-tertiary)' }} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activePage === item.id && (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-petrol-400)' }} />
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(90deg, var(--color-surface-elevated)50 0%, var(--color-surface-elevated)50 100%)' }}>
            <div className="flex items-center space-x-3 p-3 rounded-xl border backdrop-blur-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)', color: '#ffffff' }}>
                BC
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>Brenno Castro</p>
                <p className="text-xs truncate text-ellipsis" style={{ color: 'var(--color-text-secondary)' }}>Admin Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
