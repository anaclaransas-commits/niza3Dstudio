/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Clock,
  Eye,
  FileText,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import { useStore } from '../store';
import { cn, formatCurrency, getBudgetQuantity, isApprovedBudget } from '../lib/utils';
import { type BudgetStatus } from '../types';

const statusFilters: Array<'Todos' | BudgetStatus> = ['Todos', 'Pendente', 'Aprovado', 'Concluido', 'Recusado'];
const budgetStatuses: BudgetStatus[] = ['Pendente', 'Aprovado', 'Concluido', 'Recusado'];

const statusActions: Array<{
  label: string;
  status: BudgetStatus;
  className: string;
}> = [
  { label: 'Aprovar', status: 'Aprovado', className: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Concluir', status: 'Concluido', className: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'Recusar', status: 'Recusado', className: 'bg-rose-600 hover:bg-rose-700' },
];

export function Budgets() {
  const { budgets, clients, products, updateBudgetStatus, deleteBudget } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Todos' | BudgetStatus>('Todos');

  const getClientName = (id: string) => clients.find((client) => client.id === id)?.name || 'Cliente Avulso';
  const getProductName = (id: string) => products.find((product) => product.id === id)?.name || 'Peça Customizada';

  const selectedBudget = budgets.find((budget) => budget.id === selectedBudgetId) ?? null;

  const filteredBudgets = useMemo(
    () =>
      [...budgets]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((budget) => {
          const normalizedSearch = searchTerm.toLowerCase();
          const matchesSearch =
            getClientName(budget.clientId).toLowerCase().includes(normalizedSearch) ||
            getProductName(budget.productId).toLowerCase().includes(normalizedSearch) ||
            budget.id.slice(0, 6).toLowerCase().includes(normalizedSearch);

          const matchesStatus = statusFilter === 'Todos' || budget.status === statusFilter;
          return matchesSearch && matchesStatus;
        }),
    [budgets, clients, products, searchTerm, statusFilter],
  );

  const approvedBudgets = budgets.filter((budget) => isApprovedBudget(budget.status));
  const approvalRate = budgets.length > 0 ? (approvedBudgets.length / budgets.length) * 100 : 0;
  const pendingBudgets = budgets.filter((budget) => budget.status === 'Pendente');
  const totalApprovedRevenue = approvedBudgets.reduce((total, budget) => total + budget.price, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (!window.confirm('Deseja excluir este orçamento? Essa ação não pode ser desfeita.')) {
      return;
    }

    deleteBudget(budgetId);
    if (selectedBudgetId === budgetId) {
      setSelectedBudgetId(null);
    }
  };

  const handleStatusChange = (budgetId: string, status: BudgetStatus) => {
    updateBudgetStatus(budgetId, status);
  };

  if (selectedBudget) {
    const quantity = getBudgetQuantity(selectedBudget);
    const selectedClient = clients.find((client) => client.id === selectedBudget.clientId);

    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col gap-4 mb-8 no-print">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedBudgetId(null)}
              className="flex items-center text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Voltar para a lista
            </button>
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(selectedBudget.id, action.status)}
                  disabled={selectedBudget.status === action.status}
                  className={cn(
                    'px-4 py-2 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    action.className,
                  )}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => handleDeleteBudget(selectedBudget.id)}
                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all"
              >
                Excluir
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center shadow-lg shadow-slate-200"
              >
                <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {budgetStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(selectedBudget.id, status)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors',
                  selectedBudget.status === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300',
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div id="pdf-content" className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 print:shadow-none print:border-none">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">ORÇAMENTO #3D-{selectedBudget.id.slice(0, 5)}</h1>
              <p className="text-slate-500 font-medium">Data: {new Date(selectedBudget.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">3DPrint Master Manager</h2>
              <p className="text-sm text-slate-500">contato@3dprintmaster.com</p>
              <p className="text-sm text-slate-500">São Paulo, SP</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Para:</p>
              <p className="text-lg font-bold text-slate-800">{getClientName(selectedBudget.clientId)}</p>
              <p className="text-sm text-slate-500">{selectedClient?.email || 'N/A'}</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</p>
              <span
                className={cn(
                  'inline-block px-3 py-1 rounded-full font-bold text-xs',
                  selectedBudget.status === 'Aprovado'
                    ? 'bg-emerald-50 text-emerald-600'
                    : selectedBudget.status === 'Concluido'
                      ? 'bg-blue-50 text-blue-600'
                      : selectedBudget.status === 'Recusado'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600',
                )}
              >
                {selectedBudget.status.toUpperCase()}
              </span>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-left">
                <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Item / Produto</th>
                <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Especificações</th>
                <th className="py-4 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Qtd</th>
                <th className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Bruto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-8">
                  <p className="font-black text-slate-900 text-lg">{getProductName(selectedBudget.productId)}</p>
                  <p className="text-xs text-slate-500 font-medium">Serviço de Manufatura Aditiva FDM/SLA</p>
                </td>
                <td className="py-8">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      {selectedBudget.weightG}g por peça
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      {selectedBudget.printTimeHours}h por peça
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      Lucro estimado: {formatCurrency(selectedBudget.profit)}
                    </span>
                  </div>
                </td>
                <td className="py-8 text-center">
                  <span className="text-lg font-black text-slate-900">{quantity}</span>
                </td>
                <td className="py-8 text-right font-black text-slate-900 text-xl">{formatCurrency(selectedBudget.price)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-12 border-t border-slate-100">
            <div className="max-w-xs">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">Informações Adicionais</p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                O valor total inclui custos de material, energia, manutenção preventiva do hardware e mão de obra especializada.
              </p>
            </div>
            <div className="w-full md:w-72 space-y-4">
              <div className="flex justify-between items-center py-5 px-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-200">
                <span className="font-bold text-blue-100 text-sm">Valor Final</span>
                <span className="text-3xl font-black">{formatCurrency(selectedBudget.price)}</span>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto">
              Este é um orçamento válido por 10 dias. O início da produção depende da aprovação deste documento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Orçamentos e histórico de vendas</h2>
          <p className="text-slate-500">Acompanhe a aprovação, produção, fechamento e o valor comercial de cada pedido.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'Todos' | BudgetStatus)}
            className="px-4 py-2 border rounded-xl text-sm bg-white"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total cadastrado</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{budgets.length}</p>
          <p className="mt-2 text-sm text-slate-500">Todos os pedidos registrados.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pendentes</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{pendingBudgets.length}</p>
          <p className="mt-2 text-sm text-slate-500">Aguardando resposta do cliente.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Receita aprovada</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{formatCurrency(totalApprovedRevenue)}</p>
          <p className="mt-2 text-sm text-slate-500">Somando aprovados e concluídos.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Taxa de aprovação</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{approvalRate.toFixed(1)}%</p>
          <p className="mt-2 text-sm text-slate-500">Conversão comercial dos pedidos.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Lucro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 text-center">#{budget.id.slice(0, 4)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{getProductName(budget.productId)}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" /> {new Date(budget.date).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{getClientName(budget.clientId)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700 text-center">{getBudgetQuantity(budget)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(budget.price)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">+{formatCurrency(budget.profit)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center',
                        budget.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-600'
                          : budget.status === 'Concluido'
                            ? 'bg-blue-50 text-blue-600'
                            : budget.status === 'Recusado'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600',
                      )}
                    >
                      {budget.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedBudgetId(budget.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        aria-label={`Visualizar orçamento ${budget.id}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        aria-label={`Excluir orçamento ${budget.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBudgets.length === 0 && (
          <div className="py-20 flex flex-col items-center text-slate-400">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>Nenhum orçamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
