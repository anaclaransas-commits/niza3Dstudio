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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', fromColor: '#5f5a48', toColor: '#7c7660' },
    { id: 'calculator', icon: Calculator, label: 'Calculadora', fromColor: '#b5a470', toColor: '#c4b488' },
    { id: 'budgets', icon: FileText, label: 'Orçamentos', fromColor: '#7c7660', toColor: '#c4b488' },
    { id: 'registration', icon: PlusCircle, label: 'Cadastros', fromColor: '#c4b488', toColor: '#b8b39a' },
    { id: 'products', icon: Package, label: 'Produtos', fromColor: '#4a4536', toColor: '#5f5a48' },
    { id: 'catalog', icon: BookOpen, label: 'Catálogo Cliente', fromColor: '#a69458', toColor: '#b5a470' },
    { id: 'clients', icon: Users, label: 'Clientes', fromColor: '#7c7660', toColor: '#dfd4b8' },
    { id: 'reports', icon: BarChart3, label: 'Financeiro', fromColor: '#b5a470', toColor: '#7c7660' },
  ] as const;

  return (
    <>
      <button 
        className="fixed top-4 left-4 z-50 p-2 rounded-md shadow-md lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        id="sidebar-toggle"
        style={{ backgroundColor: '#f5f3e8', color: '#2a271d' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: 'linear-gradient(135deg, #2a271d 0%, #3a3629 50%, #2a271d 100%)', color: '#f5f3e8' }}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b" style={{ borderColor: '#4a453680' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #dfd4b8 0%, #7c7660 100%)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#2a271d' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(90deg, #dfd4b8 0%, #b8b39a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Niza3D Studio
                  </h1>
                  <p className="text-xs" style={{ color: '#b8b39a' }}>Gestão Inteligente</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: '#3a362980' }}
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: '#dfd4b8' }} /> : <Moon className="w-5 h-5" style={{ color: '#9a947c' }} />}
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
                    ? "text-beige-100 shadow-lg border" 
                    : "text-olive-300 hover:text-beige-100 border-transparent hover:border"
                )}
                style={activePage === item.id ? {
                  background: 'linear-gradient(90deg, #4a453650 0%, #5f5a4850 100%)',
                  borderColor: '#5f5a4850',
                  boxShadow: '0 10px 15px -3px rgba(42, 39, 29, 0.5)'
                } : {
                  borderColor: 'transparent'
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
                    boxShadow: '0 10px 15px -3px rgba(42, 39, 29, 0.5)'
                  } : {
                    backgroundColor: '#4a453650'
                  }}>
                    <item.icon className={cn("w-4 h-4", activePage === item.id ? "text-white" : "text-olive-400 group-hover:text-beige-100 transition-colors")} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activePage === item.id && (
                    <ChevronRight className="w-4 h-4" style={{ color: '#9a947c' }} />
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t" style={{ borderColor: '#4a453680', background: 'linear-gradient(90deg, #3a362950 0%, #4a453650 100%)' }}>
            <div className="flex items-center space-x-3 p-3 rounded-xl border backdrop-blur-sm" style={{ backgroundColor: '#2a271d80', borderColor: '#4a453650' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #c4b488 0%, #7c7660 100%)', color: '#2a271d' }}>
                BC
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate" style={{ color: '#f5f3e8' }}>Brenno Castro</p>
                <p className="text-xs truncate text-ellipsis" style={{ color: '#dfd4b8' }}>Admin Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
