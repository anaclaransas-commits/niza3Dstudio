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
  Printer,
  CheckCircle,
  AlertCircle,
  Activity,
  Play,
  Pause,
  MoreHorizontal,
  Calendar,
  User as UserIcon,
  DollarSign,
  Settings,
} from 'lucide-react';
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
  const { budgets, clients, products, filaments, financeEntries, printQueue, activityLog, updateBudgetStatus, addPrintQueueItem, updatePrintQueueItem } = useStore();
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

  const formatTrend = (value: number) => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  };

  const getTrendColor = (value: number, isExpense = false) => {
    if (value === 0) return 'text-slate-500';
    if (isExpense) {
      // For expenses, lower is better (green), higher is worse (red)
      return value < 0 ? 'text-emerald-600' : 'text-rose-600';
    }
    // For revenue/profit, higher is better (green), lower is worse (red)
    return value > 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const handleQuickApprove = (budgetId: string) => {
    updateBudgetStatus(budgetId, 'Aprovado');
    addActivityLog({
      type: 'approval',
      description: `Orçamento #${budgetId.slice(0, 6)} aprovado rapidamente`,
      entityId: budgetId,
      entityType: 'budget',
    });
  };

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
      trend: rangeSummary.trends.revenue,
    },
    {
      label: 'Lucro do período',
      value: formatCurrency(rangeSummary.profit),
      helper: `Receita ${formatCurrency(rangeSummary.revenue)}`,
      icon: PiggyBank,
      gradient: 'from-violet-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
      trend: rangeSummary.trends.profit,
    },
    {
      label: 'Gastos do período',
      value: formatCurrency(rangeSummary.expenses),
      helper: 'Produção + despesas extras',
      icon: TrendingDown,
      gradient: 'from-rose-400 to-pink-400',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
      trend: rangeSummary.trends.expenses,
      isExpense: true,
    },
    {
      label: 'Ticket médio do período',
      value: formatCurrency(rangeSummary.averageTicket),
      helper: `${rangeSummary.salesCount} venda(s) fechada(s)`,
      icon: Wallet,
      gradient: 'from-amber-400 to-orange-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      trend: rangeSummary.trends.averageTicket,
    },
    {
      label: 'Clientes ativos no período',
      value: String(rangeSummary.activeClients),
      helper: `${clients.length} cliente(s) no cadastro`,
      icon: Users,
      gradient: 'from-slate-400 to-gray-400',
      bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
      trend: rangeSummary.trends.salesCount,
    },
  ];

  const quickActions: Array<{
    label: string;
    description: string;
    page: PageId;
    icon: typeof CalculatorIcon;
  }> = [
    {
      label: 'Nova Impressão',
      description: 'Criar nova impressão, orçamento ou venda.',
      page: 'calculator',
      icon: Printer,
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

      {/* Nova Impressão Section */}
      <section className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Impressões</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Inicie uma nova impressão</h3>
          <p className="text-sm text-slate-500 mt-1">Crie orçamentos, vendas e peças personalizadas em um só lugar</p>
        </div>
        <button
          onClick={() => onNavigate('calculator')}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-5 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
        >
          <Printer className="w-6 h-6" />
          <span>Nova Impressão</span>
          <ArrowRight className="w-6 h-6" />
        </button>
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
              <div className="flex items-center gap-2">
                <div className={`text-xs font-black uppercase tracking-wider bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.label}
                </div>
                {stat.trend !== undefined && (
                  <div className={`text-xs font-bold ${getTrendColor(stat.trend, stat.isExpense)} flex items-center gap-1`}>
                    <span>{getTrendIcon(stat.trend)}</span>
                    <span>{formatTrend(stat.trend)}</span>
                  </div>
                )}
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
          {/* Pending Approvals Widget */}
          <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Aprovações Pendentes</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{pendingBudgets.length} orçamento(s)</span>
            </div>
            {pendingBudgets.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Nenhum orçamento pendente
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBudgets.slice(0, 3).map((budget) => {
                  const client = clients.find(c => c.id === budget.clientId);
                  const product = products.find(p => p.id === budget.productId);
                  return (
                    <div key={budget.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{client?.name || 'Cliente Avulso'}</p>
                        <p className="text-xs text-slate-500 truncate">{product?.name || 'Peça Customizada'}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(budget.price)}</span>
                        <button
                          onClick={() => handleQuickApprove(budget.id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          title="Aprovar rapidamente"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {pendingBudgets.length > 3 && (
                  <button
                    onClick={() => onNavigate('budgets')}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 py-2"
                  >
                    Ver todos os {pendingBudgets.length} orçamentos →
                  </button>
                )}
              </div>
            )}
          </article>

          {/* Production Queue Widget */}
          <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-500" />
                <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fila de Produção</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{printQueue.filter(q => q.status !== 'completed').length} ativo(s)</span>
            </div>
            {printQueue.filter(q => q.status !== 'completed').length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                <Printer className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Nenhuma impressão ativa
              </div>
            ) : (
              <div className="space-y-3">
                {printQueue.filter(q => q.status !== 'completed').slice(0, 3).map((item) => {
                  const budget = budgets.find(b => b.id === item.budgetId);
                  const client = budget ? clients.find(c => c.id === budget.clientId) : null;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.status === 'printing' && <Play className="w-3 h-3 text-emerald-500" />}
                          {item.status === 'queued' && <Clock3 className="w-3 h-3 text-amber-500" />}
                          {item.status === 'paused' && <Pause className="w-3 h-3 text-rose-500" />}
                          <p className="text-sm font-bold text-slate-800 truncate">{client?.name || 'Cliente'}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all" 
                              style={{ width: `${item.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{item.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          {/* Recent Activity Widget */}
          <article className="rounded-[36px] border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <p className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Atividade Recente</p>
              </div>
            </div>
            {activityLog.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Nenhuma atividade recente
              </div>
            ) : (
              <div className="space-y-3">
                {activityLog.slice(0, 4).map((log) => {
                  const icon = log.type === 'sale' ? DollarSign : 
                              log.type === 'approval' ? CheckCircle : 
                              log.type === 'production' ? Printer : 
                              log.type === 'client' ? UserIcon : Settings;
                  const color = log.type === 'sale' ? 'text-emerald-500' : 
                              log.type === 'approval' ? 'text-blue-500' : 
                              log.type === 'production' ? 'text-purple-500' : 
                              log.type === 'client' ? 'text-amber-500' : 'text-slate-500';
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <icon className={`w-4 h-4 mt-0.5 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{log.description}</p>
                        <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
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
