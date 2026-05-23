/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  DollarSign,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildExpenseBreakdown,
  buildMonthlyFinancialSeries,
  buildRecentSales,
  calculateBusinessMetrics,
} from '../lib/finance';
import { downloadCsvFile, formatCurrency } from '../lib/utils';
import { useStore } from '../store';
import type { FinanceEntryType } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#a855f7'];

export function Reports() {
  const {
    budgets,
    financeEntries,
    addFinanceEntry,
    removeFinanceEntry,
    clients,
    products,
  } = useStore();

  const metrics = calculateBusinessMetrics(budgets, financeEntries);
  const monthlySeries = buildMonthlyFinancialSeries(budgets, financeEntries, 6);
  const expenseBreakdown = buildExpenseBreakdown(budgets, financeEntries);
  const recentSales = buildRecentSales(budgets, clients, products, 6);
  const salesForExport = buildRecentSales(budgets, clients, products, budgets.length);

  const [entryTypeFilter, setEntryTypeFilter] = useState<'Todos' | FinanceEntryType>('Todos');
  const [formData, setFormData] = useState({
    type: 'Despesa' as FinanceEntryType,
    title: '',
    category: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const filteredEntries = useMemo(
    () => financeEntries.filter((entry) => entryTypeFilter === 'Todos' || entry.type === entryTypeFilter),
    [financeEntries, entryTypeFilter],
  );

  const stats = [
    { label: 'Receita total', value: formatCurrency(metrics.totalRevenue), helper: `${salesForExport.length} venda(s) aprovadas/concluídas`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Gastos totais', value: formatCurrency(metrics.totalExpenses), helper: 'Produção + despesas manuais', icon: TrendingDown, color: 'bg-rose-50 text-rose-600' },
    { label: 'Lucro acumulado', value: formatCurrency(metrics.totalProfit), helper: `Lucro do mês: ${formatCurrency(metrics.monthProfit)}`, icon: Wallet, color: 'bg-blue-50 text-blue-600' },
    { label: 'Movimentações extras', value: String(financeEntries.length), helper: 'Receitas e despesas lançadas manualmente', icon: Receipt, color: 'bg-amber-50 text-amber-600' },
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(formData.amount.replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert('Informe um valor financeiro maior que zero.');
      return;
    }

    addFinanceEntry({
      type: formData.type,
      title: formData.title.trim(),
      category: formData.category.trim() || (formData.type === 'Receita' ? 'Receitas extras' : 'Despesas gerais'),
      amount,
      date: formData.date,
      notes: formData.notes.trim() || undefined,
    });

    setFormData({
      type: 'Despesa',
      title: '',
      category: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
  };

  const handleExportCsv = () => {
    const rows = [
      ['origem', 'id', 'data', 'tipo', 'categoria', 'descricao', 'cliente', 'produto', 'quantidade', 'receita', 'gasto', 'lucro'],
      ...salesForExport.map((sale) => ['Venda', sale.id, new Date(sale.date).toLocaleDateString('pt-BR'), sale.status, 'Orçamento aprovado', sale.productName, sale.clientName, sale.productName, sale.quantity, sale.price.toFixed(2), '0.00', sale.profit.toFixed(2)]),
      ...financeEntries.slice().sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()).map((entry) => ['Financeiro manual', entry.id, new Date(entry.date).toLocaleDateString('pt-BR'), entry.type, entry.category, entry.title, '', '', '', entry.type === 'Receita' ? entry.amount.toFixed(2) : '0.00', entry.type === 'Despesa' ? entry.amount.toFixed(2) : '0.00', entry.type === 'Receita' ? entry.amount.toFixed(2) : (-entry.amount).toFixed(2)]),
    ];

    downloadCsvFile(`financeiro-3dprint-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Financeiro</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Receita, gastos, lucro e histórico da empresa</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">Lance despesas extras, organize entradas fora dos orçamentos e acompanhe o resultado consolidado da operação em um só lugar.</p>
        </div>
        <button onClick={handleExportCsv} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          <Calendar className="mr-2 h-4 w-4" /> Exportar CSV financeiro
        </button>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className={`rounded-2xl p-3 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">Consolidado</span>
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
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Resumo mensal</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Fluxo financeiro recente</h3>
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(15 23 42 / 0.08)' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="expenses" fill="#fb7185" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Composição dos gastos</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Para onde o dinheiro está indo</h3>
          {expenseBreakdown.length > 0 ? (
            <>
              <div className="mt-6 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={6}>
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {expenseBreakdown.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}
                    </span>
                    <strong className="font-black text-slate-900">{formatCurrency(entry.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-400">
              Sem gastos suficientes para montar a composição ainda.
            </div>
          )}
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Nova movimentação</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Registrar receita ou despesa manual</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Tipo
              <select value={formData.type} onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value as FinanceEntryType }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none">
                <option value="Despesa">Despesa</option>
                <option value="Receita">Receita</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Data
              <input type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" />
            </label>
            <label className="space-y-2 text-sm font-bold text-slate-700 md:col-span-2">
              Descrição
              <input required type="text" value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" placeholder="Ex.: Conta de energia, marketing, venda avulsa, manutenção" />
            </label>
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Categoria
              <input type="text" value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" placeholder="Energia, frete, imposto, receita extra..." />
            </label>
            <label className="space-y-2 text-sm font-bold text-slate-700">
              Valor
              <input required type="text" inputMode="decimal" value={formData.amount} onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" placeholder="0,00" />
            </label>
            <label className="space-y-2 text-sm font-bold text-slate-700 md:col-span-2">
              Observações
              <textarea value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" placeholder="Informações complementares para lembrar do contexto dessa movimentação." />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" /> Salvar movimentação
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Vendas recentes</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Pedidos que já geram receita</h3>
          <div className="mt-6 space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-800">{sale.productName}</p>
                      <p className="mt-1 text-xs text-slate-500">{sale.clientName} • {new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(sale.price)}</p>
                      <p className="mt-1 text-xs font-bold text-emerald-600">Lucro {formatCurrency(sale.profit)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-400">
                Nenhuma venda aprovada ou concluída encontrada ainda.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[36px] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Histórico manual</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Receitas e despesas extras da empresa</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Todos', 'Despesa', 'Receita'] as const).map((filter) => (
              <button key={filter} onClick={() => setEntryTypeFilter(filter)} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-colors ${entryTypeFilter === filter ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="pb-4">Data</th>
                  <th className="pb-4">Tipo</th>
                  <th className="pb-4">Descrição</th>
                  <th className="pb-4">Categoria</th>
                  <th className="pb-4 text-right">Valor</th>
                  <th className="pb-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntries.slice().sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()).map((entry) => (
                  <tr key={entry.id} className="text-sm text-slate-600">
                    <td className="py-4">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4"><span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${entry.type === 'Receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{entry.type}</span></td>
                    <td className="py-4"><p className="font-bold text-slate-800">{entry.title}</p>{entry.notes ? <p className="mt-1 text-xs text-slate-500">{entry.notes}</p> : null}</td>
                    <td className="py-4 font-medium text-slate-600">{entry.category}</td>
                    <td className={`py-4 text-right font-black ${entry.type === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>{entry.type === 'Receita' ? '+' : '-'}{formatCurrency(entry.amount)}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => removeFinanceEntry(entry.id)} className="inline-flex items-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-400">
            Nenhuma movimentação manual registrada para esse filtro.
          </div>
        )}
      </section>
    </div>
  );
}
