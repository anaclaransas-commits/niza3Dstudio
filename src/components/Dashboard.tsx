/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator as CalculatorIcon,
  Clock3,
  FileText,
  Package,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { QuickSale } from './QuickSale';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildMonthlyFinancialSeries,
  buildRecentSales,
  calculateBusinessMetrics,
  calculateRangeSummary,
} from '../lib/finance';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../store';
import type { AnalyticsRange } from '../types';
import { type PageId } from './Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
  { value: 'all', label: 'Tudo' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const { budgets, clients, products, filaments, financeEntries } = useStore();
  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>('30d');

  const metrics = calculateBusinessMetrics(budgets, financeEntries);
  const rangeSummary = useMemo(
    () => calculateRangeSummary(budgets, financeEntries, selectedRange),
    [budgets, financeEntries, selectedRange],
  );
  const chartMonths = selectedRange === '12m' || selectedRange === 'all' ? 12 : 6;
  const monthlySeries = useMemo(
    () => buildMonthlyFinancialSeries(budgets, financeEntries, chartMonths),
    [budgets, financeEntries, chartMonths],
  );
  const recentSales = useMemo(
    () => buildRecentSales(budgets, clients, products, 5, selectedRange),
    [budgets, clients, products, selectedRange],
  );
  const publicProductsCount = products.filter((product) => product.isPublic !== false).length;

  // Calculate today's sales
  const todaySales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return budgets.filter(budget => {
      const budgetDate = new Date(budget.date);
      budgetDate.setHours(0, 0, 0, 0);
      return budgetDate.getTime() === today.getTime() && budget.status === 'Aprovado';
    });
  }, [budgets]);

  const todayRevenue = todaySales.reduce((total, budget) => total + budget.price, 0);
  const todayProfit = todaySales.reduce((total, budget) => total + budget.profit, 0);

  const statCards = [
    {
      label: 'Vendas de Hoje',
      value: formatCurrency(todayRevenue),
      helper: `${todaySales.length} venda(s) hoje • Lucro: ${formatCurrency(todayProfit)}`,
      icon: Wallet,
      gradient: 'from-emerald-400 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-cyan-50',
      highlight: true,
    },
    {
      label: 'Receita do período',
      value: formatCurrency(rangeSummary.revenue),
      helper: `${rangeSummary.pendingCount} orçamento(s) pendente(s) no período`,
      icon: TrendingUp,
      gradient: 'from-blue-400 to-indigo-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    },
    {
      label: 'Lucro do período',
      value: formatCurrency(rangeSummary.profit),
      helper: `Receita ${formatCurrency(rangeSummary.revenue)}`,
      icon: PiggyBank,
      gradient: 'from-violet-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
    },
    {
      label: 'Gastos do período',
      value: formatCurrency(rangeSummary.expenses),
      helper: 'Produção + despesas extras',
      icon: TrendingDown,
      gradient: 'from-rose-400 to-pink-400',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
    },
    {
      label: 'Ticket médio do período',
      value: formatCurrency(rangeSummary.averageTicket),
      helper: `${rangeSummary.salesCount} venda(s) fechada(s)`,
      icon: Wallet,
      gradient: 'from-amber-400 to-orange-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    },
    {
      label: 'Clientes ativos no período',
      value: String(rangeSummary.activeClients),
      helper: `${clients.length} cliente(s) no cadastro`,
      icon: Users,
      gradient: 'from-slate-400 to-gray-400',
      bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
    },
  ];

  const quickActions: Array<{
    label: string;
    description: string;
    page: PageId;
    icon: typeof CalculatorIcon;
  }> = [
    {
      label: 'Novo orçamento',
      description: 'Abrir a calculadora com seus parâmetros salvos.',
      page: 'calculator',
      icon: CalculatorIcon,
    },
    {
      label: 'Histórico de vendas',
      description: 'Ver aprovações, produção e fechamento dos pedidos.',
      page: 'budgets',
      icon: FileText,
    },
    {
      label: 'Financeiro',
      description: 'Registrar gastos e acompanhar receita e lucro.',
      page: 'reports',
      icon: Receipt,
    },
    {
      label: 'Clientes',
      description: 'Consultar contatos e receita por cliente.',
      page: 'clients',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Gestão da empresa</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Dashboard financeiro, operacional e comercial da sua produção 3D.
            </h2>
            <p className="text-sm leading-6 text-slate-500 md:text-base">
              Aqui você acompanha receita, gastos, lucro, despesas fixas mensais, produção acumulada, histórico de vendas e atalhos para as áreas que mais usa no dia a dia.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRange(option.value)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${selectedRange === option.value ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.page}
                onClick={() => onNavigate(action.page)}
                className="group rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-cyan-50 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-3 text-slate-700 shadow-sm group-hover:from-emerald-100 group-hover:to-cyan-100 group-hover:text-emerald-700 transition-all duration-300">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{action.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Sale Section */}
      <section className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Vendas</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Registre vendas rapidamente</h3>
          <p className="text-sm text-slate-500 mt-1">Adicione vendas em segundos sem passar pela calculadora completa</p>
        </div>
        <QuickSale />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => (
          <article 
            key={stat.label} 
            className={`group rounded-[32px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 ${stat.highlight ? 'ring-2 ring-emerald-400/50' : ''}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className={`rounded-2xl bg-gradient-to-br ${stat.gradient} p-3 text-white shadow-lg shadow-slate-900/20`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className={`text-xs font-black uppercase tracking-wider bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.label}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-black text-slate-900 group-hover:text-slate-800 transition-colors">{stat.value}</p>
            </div>
            <p className="text-xs text-slate-500">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Fluxo mensal</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Receita, gastos e lucro dos últimos {chartMonths} meses</h3>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />Receita</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />Gastos</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />Lucro</span>
            </div>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(15 23 42 / 0.08)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="expenses" fill="#fb7185" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl shadow-slate-900/50">
            <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Operação acumulada</p>
            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Package className="h-4 w-4" />Peças vendidas</span>
                <strong className="text-lg font-black text-white">{metrics.totalPiecesSold}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Clock3 className="h-4 w-4" />Horas produzidas</span>
                <strong className="text-lg font-black text-white">{metrics.totalPrintHours.toFixed(1)}h</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Wrench className="h-4 w-4" />Filamentos cadastrados</span>
                <strong className="text-lg font-black text-white">{filaments.length}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Receipt className="h-4 w-4" />Movimentações extras</span>
                <strong className="text-lg font-black text-white">{financeEntries.length}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Package className="h-4 w-4" />Produtos no catálogo</span>
                <strong className="text-lg font-black text-white">{publicProductsCount}</strong>
              </div>
            </div>
          </article>

          <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
            <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Leitura rápida</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="group rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Receita total</p>
                <p className="mt-2 text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="group rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Lucro total</p>
                <p className="mt-2 text-xl font-black text-emerald-600">{formatCurrency(metrics.totalProfit)}</p>
              </div>
              <div className="group rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Orçamentos</p>
                <p className="mt-2 text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{budgets.length}</p>
              </div>
              <div className="group rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Cadastros</p>
                <p className="mt-2 text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">{clients.length + products.length}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Histórico de vendas</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Últimas vendas aprovadas no período selecionado</h3>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Abrir pedidos
            </button>
          </div>

          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="pb-4">Cliente</th>
                    <th className="pb-4">Produto</th>
                    <th className="pb-4">Data</th>
                    <th className="pb-4 text-center">Qtd</th>
                    <th className="pb-4 text-right">Valor</th>
                    <th className="pb-4 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="text-sm text-slate-600">
                      <td className="py-4 font-bold text-slate-800">{sale.clientName}</td>
                      <td className="py-4">{sale.productName}</td>
                      <td className="py-4">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 text-center font-bold text-slate-700">{sale.quantity}</td>
                      <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(sale.price)}</td>
                      <td className="py-4 text-right font-bold text-emerald-600">{formatCurrency(sale.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-400">
              Ainda não existem vendas aprovadas ou concluídas para alimentar o histórico.
            </div>
          )}
        </article>

        <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Atalhos estratégicos</p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => onNavigate('registration')}
              className="group flex w-full items-center justify-between rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left transition-all duration-300 hover:border-emerald-300/60 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-cyan-50 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors">Cadastros e estoque</p>
                <p className="mt-1 text-xs text-slate-500">Impressoras, filamentos, insumos e canais de venda.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="group flex w-full items-center justify-between rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left transition-all duration-300 hover:border-purple-300/60 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-purple-700 transition-colors">Produtos e catálogo</p>
                <p className="mt-1 text-xs text-slate-500">Editar produtos, imagens, visibilidade e coleção pública.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="group flex w-full items-center justify-between rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left transition-all duration-300 hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-indigo-700 transition-colors">Página do catálogo</p>
                <p className="mt-1 text-xs text-slate-500">Ver o link público e validar o que o cliente enxerga.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
