/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  TrendingUp,
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
import { downloadCsvFile, formatCurrency, getBudgetQuantity, isApprovedBudget } from '../lib/utils';
import { useStore } from '../store';

export function Reports() {
  const { budgets, filaments, clients, products } = useStore();

  const approvedBudgets = budgets.filter((budget) => isApprovedBudget(budget.status));
  const totalRevenue = approvedBudgets.reduce((sum, budget) => sum + budget.price, 0);
  const totalProfit = approvedBudgets.reduce((sum, budget) => sum + budget.profit, 0);
  const approvalRate = budgets.length > 0 ? (approvedBudgets.length / budgets.length) * 100 : 0;

  const materialUsageMap = approvedBudgets.reduce((acc, budget) => {
    const filament = filaments.find((item) => item.id === budget.filamentId);
    const material = filament ? filament.material : 'Outros';
    acc[material] = (acc[material] || 0) + getBudgetQuantity(budget);
    return acc;
  }, {} as Record<string, number>);

  const materialData = Object.keys(materialUsageMap).map((name) => ({
    name,
    value: materialUsageMap[name],
  }));

  const chartData = [...approvedBudgets]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce<Array<{ date: string; vendas: number; lucro: number }>>((acc, budget) => {
      const dateLabel = new Date(budget.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const existingEntry = acc.find((item) => item.date === dateLabel);

      if (existingEntry) {
        existingEntry.vendas += budget.price;
        existingEntry.lucro += budget.profit;
        return acc;
      }

      acc.push({ date: dateLabel, vendas: budget.price, lucro: budget.profit });
      return acc;
    }, [])
    .slice(-10);

  const stats = [
    { label: 'Receita Total', value: totalRevenue, trend: '+sinc', icon: DollarSign, format: 'currency' },
    { label: 'Lucro Total', value: totalProfit, trend: '+sinc', icon: TrendingUp, format: 'currency' },
    { label: 'Orçamentos', value: budgets.length, trend: 'Total', icon: FileText, format: 'number' },
    { label: 'Taxa de Aprovação', value: `${approvalRate.toFixed(1)}%`, trend: 'Vendas', icon: CheckCircle, format: 'text' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleExportCsv = () => {
    const rows = [
      ['ID', 'Data', 'Status', 'Cliente', 'Produto', 'Quantidade', 'Valor', 'Lucro', 'Material'],
      ...[...budgets]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((budget) => {
          const filament = filaments.find((item) => item.id === budget.filamentId);
          const client = clients.find((item) => item.id === budget.clientId);
          const product = products.find((item) => item.id === budget.productId);

          return [
            budget.id,
            new Date(budget.date).toLocaleDateString('pt-BR'),
            budget.status,
            client?.name || 'Cliente Avulso',
            product?.name || 'Peça Customizada',
            getBudgetQuantity(budget),
            budget.price.toFixed(2),
            budget.profit.toFixed(2),
            filament?.material || 'Outros',
          ];
        }),
    ];

    downloadCsvFile(`relatorio-orcamentos-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Business Analytics</h2>
          <p className="text-slate-500">Relatórios gerados em tempo real com base em seus orçamentos aprovados.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-inner">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter text-emerald-600 bg-emerald-50">
                {stat.trend}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {stat.format === 'currency' ? formatCurrency(stat.value as number) : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Performance de Vendas</h3>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Receita</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lucro</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 12}} 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  />
                  <Bar dataKey="vendas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="lucro" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">
                <p className="font-bold underline decoration-slate-200 underline-offset-8">Aguardando mais orçamentos para gerar gráfico</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-8">Uso de Materiais</h3>
          <div className="flex flex-col items-center justify-center h-full pb-8">
            {materialData.length > 0 ? (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={materialData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {materialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  {materialData.map((material, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-2xl flex flex-col">
                      <div className="flex items-center mb-1">
                        <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{material.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-700">{material.value} peças</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-300 font-bold">
                Sem dados de materiais
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
