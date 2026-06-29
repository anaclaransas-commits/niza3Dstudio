/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Sidebar, type PageId } from './components/Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { ToastContainer } from './components/ToastContainer';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ThemeProvider } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

// Lazy loading para componentes pesados
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Calculator = lazy(() => import('./components/Calculator').then(m => ({ default: m.Calculator })));
const Catalog = lazy(() => import('./components/Catalog').then(m => ({ default: m.Catalog })));
const Registration = lazy(() => import('./components/Registration').then(m => ({ default: m.Registration })));
const Clients = lazy(() => import('./components/Clients').then(m => ({ default: m.Clients })));
const Products = lazy(() => import('./components/Products').then(m => ({ default: m.Products })));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Budgets = lazy(() => import('./components/Budgets').then(m => ({ default: m.Budgets })));
const DiscountCodes = lazy(() => import('./components/DiscountCodes').then(m => ({ default: m.DiscountCodes })));

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
        if (!mounted) return;
        setAuthenticated(res.ok);
      } catch (error) {
        console.error('Session check failed:', error);
        if (!mounted) return;
        setAuthenticated(false);
      } finally {
        if (!mounted) return;
        setCheckingSession(false);
      }
    };
    void check();
    return () => {
      mounted = false;
    };
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setAppError(event.error?.message || 'Erro desconhecido');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      let payload: { error?: string } | null = null;
      let fallbackText = '';
      try {
        payload = (await res.json()) as { error?: string };
      } catch {
        try {
          fallbackText = await res.text();
        } catch {
          fallbackText = '';
        }
        payload = null;
      }
      if (!res.ok) {
        if (res.status === 500) {
          try {
            const healthRes = await fetch('/api/auth/health', { method: 'GET', credentials: 'include' });
            if (healthRes.ok) {
              const health = (await healthRes.json()) as { missingEnv?: string[] };
              if (health.missingEnv && health.missingEnv.length > 0) {
                setLoginError(`Faltam variáveis no Vercel: ${health.missingEnv.join(', ')}`);
                return;
              }
            }
          } catch {
            // Mantém erro padrão abaixo.
          }
        }
        const message =
          payload?.error ||
          (res.status === 401
            ? 'Login ou senha incorretos.'
            : `Falha no login (${res.status})${fallbackText ? `: ${fallbackText.slice(0, 160)}` : '.'}`);
        setLoginError(message);
        return;
      }
      setAuthenticated(true);
      setPassword('');
    } catch (error) {
      console.error(error);
      setLoginError('Falha ao fazer login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setAuthenticated(false);
      setUsername('');
      setPassword('');
    }
  };
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const keyboardShortcuts = [
    { key: 'Ctrl+K', description: 'Busca global', action: () => {} },
    { key: '?', description: 'Mostrar atalhos', action: () => {} },
  ];

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
      case 'discounts':
        return <DiscountCodes />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Carregando…</p>
      </div>
    </div>
  );
  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-error-200)' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: 'var(--color-error-50)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-error-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Erro na Aplicação
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {appError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl font-bold transition-all"
              style={{ background: 'var(--color-primary)', color: '#ffffff' }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-sm rounded-3xl shadow-2xl p-8 border text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-light)', borderTopColor: 'var(--color-primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Carregando…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-sm rounded-3xl shadow-2xl p-8 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Painel Administrativo
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Digite seu login e senha para acessar
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-error-50)', borderColor: 'var(--color-error-200)', borderWidth: '1px' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-error-600)' }}>{loginError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Login
              </label>
              <input
                type="text"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--color-border)', '--tw-ring-color': 'var(--color-focus-ring)' }}
                autoComplete="username"
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Senha
              </label>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--color-border)', '--tw-ring-color': 'var(--color-focus-ring)' }}
                autoComplete="current-password"
                disabled={isLoggingIn}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn || !username || !password}
              className="w-full font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                color: '#ffffff',
                opacity: (isLoggingIn || !username || !password) ? 0.6 : 1,
                cursor: (isLoggingIn || !username || !password) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entrando…</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--color-background)' }}>
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        <GlobalSearch onNavigate={setActivePage} />
        <KeyboardShortcuts shortcuts={keyboardShortcuts} />
        <ToastContainer />

        <main className="flex-1 overflow-y-auto no-print">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <Breadcrumbs currentPage={activePage} onNavigate={setActivePage} />
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border backdrop-blur-sm px-4 py-2 text-xs font-bold transition-all flex items-center gap-2"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.2 }
                }}
              >
                <Suspense fallback={<LoadingFallback />}>
                  {renderPage()}
                </Suspense>
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
    </ThemeProvider>
  );
}
