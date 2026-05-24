/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sidebar, type PageId } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { Registration } from './components/Registration';
import { Clients } from './components/Clients';
import { Products } from './components/Products';
import { Catalog } from './components/Catalog';
import { Reports } from './components/Reports';
import { Budgets } from './components/Budgets';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const ADMIN_PASSWORD = '32162069';

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth');
    if (auth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin-auth', 'true');
      setAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'calculator':
        return <Calculator />;
      case 'registration':
        return <Registration />;
      case 'clients':
        return <Clients />;
      case 'products':
        return <Products />;
      case 'catalog':
        return <Catalog />;
      case 'reports':
        return <Reports />;
      case 'budgets':
        return <Budgets />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-slate-200">
          
          <h1 className="text-2xl font-black text-slate-800 mb-2 text-center">
            Painel Administrativo
          </h1>

          <p className="text-sm text-slate-500 text-center mb-6">
            Digite a senha para acessar
          </p>

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <main className="flex-1 overflow-y-auto no-print">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Styled Printable Area - Only visible during printing */}
      <div className="hidden print:block print:relative print:z-50 bg-white">
        {activePage === 'budgets' && renderPage()}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}
