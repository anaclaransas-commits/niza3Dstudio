/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
} from '../lib/finance';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../store';
import { type PageId } from './Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { budgets, clients, products, filaments, financeEntries } = useStore();

  const metrics = calculateBusinessMetrics(budgets, financeEntries);
  const monthlySeries = buildMonthlyFinancialSeries(budgets, financeEntries, 6);
  const recentSales = buildRecentSales(budgets, clients, products, 5);

  const statCards = [
    {
      label: 'Receita da semana',
      value: formatCurrency(metrics.weekRevenue),
      helper: `${metrics.pendingCount} orçamento(s) pendente(s)`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Lucro líquido do mês',
      value: formatCurrency(metrics.monthProfit),
      helper: `Receita ${formatCurrency(metrics.monthRevenue)}`,
      icon: PiggyBank,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Gastos do mês',
      value: formatCurrency(metrics.monthExpenses),
      helper: 'Custos de produção + despesas extras',
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Ticket médio do mês',
      value: formatCurrency(metrics.averageTicketThisMonth),
      helper: `${metrics.monthSalesCount} venda(s) fechada(s)`,
      icon: Wallet,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Clientes ativos no mês',
      value: String(metrics.activeClientsThisMonth),
      helper: `${clients.length} cliente(s) no cadastro`,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Produtos no catálogo',
      value: String(products.filter((product) => product.isPublic !== false).length),
      helper: `${products.length} produto(s) cadastrado(s)`,
      icon: Package,
      color: 'bg-slate-100 text-slate-700',
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
      <section className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Gestão da empresa</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Dashboard financeiro, operacional e comercial da sua produção 3D.
            </h2>
            <p className="text-sm leading-6 text-slate-500 md:text-base">
              Aqui você acompanha receita, gastos, lucro, produção acumulada, histórico de vendas e atalhos para as áreas que mais usa no dia a dia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.page}
                onClick={() => onNavigate(action.page)}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-sm font-black text-slate-800">{action.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => (
          <article key={stat.label} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className={`rounded-2xl p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">Agora</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{stat.value}</h3>
            <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Fluxo mensal</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Receita, gastos e lucro dos últimos 6 meses</h3>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Receita</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Gastos</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Lucro</span>
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
          <article className="rounded-[36px] border border-slate-100 bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Operação acumulada</p>
            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Package className="h-4 w-4" />Peças vendidas</span>
                <strong className="text-lg font-black text-white">{metrics.totalPiecesSold}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Clock3 className="h-4 w-4" />Horas produzidas</span>
                <strong className="text-lg font-black text-white">{metrics.totalPrintHours.toFixed(1)}h</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Wrench className="h-4 w-4" />Filamentos cadastrados</span>
                <strong className="text-lg font-black text-white">{filaments.length}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Receipt className="h-4 w-4" />Movimentações extras</span>
                <strong className="text-lg font-black text-white">{financeEntries.length}</strong>
              </div>
            </div>
          </article>

          <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Leitura rápida</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Receita total</p>
                <p className="mt-2 text-xl font-black text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Lucro total</p>
                <p className="mt-2 text-xl font-black text-emerald-600">{formatCurrency(metrics.totalProfit)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Orçamentos</p>
                <p className="mt-2 text-xl font-black text-slate-900">{budgets.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Cadastros</p>
                <p className="mt-2 text-xl font-black text-slate-900">{clients.length + products.length}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Histórico de vendas</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Últimas vendas aprovadas e concluídas</h3>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-slate-800"
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

        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Atalhos estratégicos</p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => onNavigate('registration')}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-black text-slate-800">Cadastros e estoque</p>
                <p className="mt-1 text-xs text-slate-500">Impressoras, filamentos, insumos e canais de venda.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-black text-slate-800">Produtos e catálogo</p>
                <p className="mt-1 text-xs text-slate-500">Editar produtos, imagens, visibilidade e coleção pública.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-black text-slate-800">Página do catálogo</p>
                <p className="mt-1 text-xs text-slate-500">Ver o link público e validar o que o cliente enxerga.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
