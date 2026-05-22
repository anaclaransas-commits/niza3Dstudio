/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Layers,
  Zap,
  Weight,
  AlertCircle,
  ChevronRight,
  Printer,
  Package,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, cn, getBudgetQuantity, isApprovedBudget } from '../lib/utils';
import { useStore } from '../store';
import { type PageId } from './Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  
 const senha = prompt('32162069')

  if (senha !== "1234") {
    window.location.href = "/catalog"
}
	
  const { budgets, clients, products, filaments } = useStore();

  // Real Stats calculation
  const approvedBudgets = budgets.filter((budget) => isApprovedBudget(budget.status));
  const pendingBudgets = budgets.filter(b => b.status === 'Pendente');
  
  const totalRevenue = approvedBudgets.reduce((sum, b) => sum + b.price, 0);
  const totalProfit = approvedBudgets.reduce((sum, b) => sum + b.profit, 0);
  
  const totalWeight = approvedBudgets.reduce((sum, budget) => sum + (budget.weightG * getBudgetQuantity(budget)), 0);
  const totalPrintHours = approvedBudgets.reduce(
    (sum, budget) => sum + (budget.printTimeHours * getBudgetQuantity(budget)),
    0,
  );
  const avgMargin = approvedBudgets.length > 0 
    ? (totalProfit / totalRevenue) * 100 
    : 0;

  // Cost breakdown for approved budgets
  const costStats = approvedBudgets.reduce((acc, budget) => {
    if (budget.calculation) {
      const quantity = getBudgetQuantity(budget);
      acc.material += (budget.calculation.unitMaterialCost || 0) * quantity;
      acc.energy += (budget.calculation.unitEnergyCost || 0) * quantity;
      acc.maintenance += (budget.calculation.unitFixedCost || 0) * quantity;
    }
    return acc;
  }, { material: 0, energy: 0, maintenance: 0 });

  const chartData = [...approvedBudgets]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((budget) => ({
      name: new Date(budget.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      profit: budget.profit,
      revenue: budget.price,
    }));

  const stats = [
    { label: 'Receita Total', value: totalRevenue, icon: DollarSign, trend: '+12%', color: 'blue', format: 'currency' },
    { label: 'Lucro Líquido', value: totalProfit, icon: TrendingUp, trend: '+18%', color: 'emerald', format: 'currency' },
    { label: 'Orçamentos', value: budgets.length, icon: FileText, trend: budgets.length > 0 ? 'Ativos' : 'Vazio', color: 'indigo', format: 'number' },
    { label: 'Margem Média', value: `${avgMargin.toFixed(1)}%`, icon: Layers, trend: 'Saudável', color: 'amber', format: 'text' },
  ];

  const recentBudgets = [...budgets]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Painel de Controle</h2>
          <p className="text-slate-500 font-medium">Gestão centralizada da sua oficina de impressão 3D.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm space-x-1">
          <button 
            onClick={() => onNavigate('clients')}
            className="flex items-center px-4 py-2.5 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-slate-100"
          >
            <Users className="w-4 h-4 mr-2" /> Cliente
          </button>
          <button 
            onClick={() => onNavigate('products')}
            className="flex items-center px-4 py-2.5 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-slate-100"
          >
            <Package className="w-4 h-4 mr-2" /> Produto
          </button>
          <button 
            onClick={() => onNavigate('calculator')}
            className="flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Novo Orçamento
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-400">
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">
              {stat.format === 'currency' ? formatCurrency(stat.value as number) : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Histórico de Lucro</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Desempenho financeiro dos últimos orçamentos</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Receita</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Lucro</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-50 rounded-3xl">
                Realize mais orçamentos para gerar o gráfico
              </div>
            )}
          </div>
        </div>

        {/* Planilha de Custos / Cost Sheet */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col h-full ring-1 ring-white/10">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400">Distribuição de Custos</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg mr-3">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Materiais</p>
                    <p className="text-sm font-bold">{formatCurrency(costStats.material)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-500">{((costStats.material / (totalRevenue || 1)) * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg mr-3">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Energia</p>
                    <p className="text-sm font-bold">{formatCurrency(costStats.energy)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-500">{((costStats.energy / (totalRevenue || 1)) * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg mr-3">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Manutenção</p>
                    <p className="text-sm font-bold">{formatCurrency(costStats.maintenance)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-purple-500">{((costStats.maintenance / (totalRevenue || 1)) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Carga Horária Total</p>
                  <p className="text-3xl font-black text-white">{totalPrintHours}h</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">{totalWeight}g produzidos</p>
                </div>
                <Calendar className="w-10 h-10 text-white/10" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Orçamentos Recentes</h3>
            <button 
              onClick={() => onNavigate('budgets')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-5 flex-1">
            {recentBudgets.map((budget, index) => {
              const client = clients.find(c => c.id === budget.clientId);
              const product = products.find(p => p.id === budget.productId);
              return (
                <div key={budget.id || index} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-none mb-1 line-clamp-1">{client?.name || 'Cliente Direto'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic line-clamp-1">
                        {product?.name || 'Item Avulso'} • {new Date(budget.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{formatCurrency(budget.price || 0)}</p>
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                      budget.status === 'Aprovado' ? "bg-emerald-50 text-emerald-600" :
                      budget.status === 'Concluido' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {budget.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-center">Nenhuma movimentação<br/>recente registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Inventory Insights */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Status dos Insumos</h4>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Materiais Cadastrados</p>
                <p className="text-3xl font-black text-slate-800">{filaments.length}</p>
              </div>
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500">
                <Weight className="w-8 h-8" />
              </div>
            </div>
            <button 
              onClick={() => onNavigate('registration')}
              className="w-full py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              Estoque <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Alertas Operacionais</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1.5" /> Pendentes
                </span>
                <span className="text-slate-800">{pendingBudgets.length} orç.</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-500 flex items-center">
                  <Printer className="w-3 h-3 mr-1.5" /> Em Produção
                </span>
                <span className="text-slate-800">{budgets.filter(b => b.status === 'Aprovado').length} un</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-500 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1.5" /> Concluídos
                </span>
                <span className="text-slate-800">{budgets.filter(b => b.status === 'Concluido').length} un</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
