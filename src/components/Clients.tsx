/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  UserPlus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  Clock,
  Package,
  MessageSquare,
  Star,
  Edit3,
  X,
  Award,
  Gift,
  Zap,
  Filter,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, isApprovedBudget } from '../lib/utils';

function getClientContactUrl(phone: string, email: string) {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly) {
    const whatsappNumber = digitsOnly.length <= 11 ? `55${digitsOnly}` : digitsOnly;
    return `https://wa.me/${whatsappNumber}`;
  }

  return `mailto:${email}`;
}

export function Clients() {
  const { clients, addClient, budgets, products, updateClient, addActivityLog } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [clientNotes, setClientNotes] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState<'all' | 'VIP' | 'Frequente' | 'Regular' | 'Novo'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(formData);
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', cpf: '', address: '' });
  };

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loyaltyFilter !== 'all') {
      filtered = filtered.filter(c => {
        const metrics = getClientMetrics(c.id);
        return metrics.loyaltyTier === loyaltyFilter;
      });
    }

    return filtered;
  }, [clients, searchTerm, loyaltyFilter]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientNotes(client.notes || '');
    }
  };

  const handleSaveNotes = () => {
    if (selectedClientId) {
      updateClient(selectedClientId, { notes: clientNotes });
      setShowNotesModal(false);
    }
  };

  const getClientMetrics = (clientId: string) => {
    const clientBudgets = budgets.filter(b => b.clientId === clientId);
    const approvedBudgets = clientBudgets.filter(b => isApprovedBudget(b.status));
    
    const totalRevenue = approvedBudgets.reduce((sum, b) => sum + b.price, 0);
    const totalProfit = approvedBudgets.reduce((sum, b) => sum + b.profit, 0);
    const totalOrders = approvedBudgets.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalPieces = approvedBudgets.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const totalPrintHours = approvedBudgets.reduce((sum, b) => sum + b.printTimeHours * (b.quantity || 1), 0);
    
    // Calculate loyalty tier and discount
    let loyaltyTier = 'Novo';
    let loyaltyColor = 'text-slate-500';
    let loyaltyBg = 'bg-slate-100';
    let discountPercent = 0;
    
    if (totalOrders >= 10) {
      loyaltyTier = 'VIP';
      loyaltyColor = 'text-amber-600';
      loyaltyBg = 'bg-amber-100';
      discountPercent = 15;
    } else if (totalOrders >= 5) {
      loyaltyTier = 'Frequente';
      loyaltyColor = 'text-emerald-600';
      loyaltyBg = 'bg-emerald-100';
      discountPercent = 10;
    } else if (totalOrders >= 2) {
      loyaltyTier = 'Regular';
      loyaltyColor = 'text-blue-600';
      loyaltyBg = 'bg-blue-100';
      discountPercent = 5;
    }
    
    // Update client loyalty data
    const client = clients.find(c => c.id === clientId);
    if (client && (client.loyaltyTier !== loyaltyTier || client.discountPercent !== discountPercent)) {
      updateClient(clientId, { 
        loyaltyTier, 
        discountPercent,
        totalOrders,
        totalRevenue 
      });
    }
    
    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      avgOrderValue,
      totalPieces,
      totalPrintHours,
      loyaltyTier,
      loyaltyColor,
      loyaltyBg,
      discountPercent,
      recentOrders: clientBudgets.slice(0, 5)
    };
  };

  const handleApplyLoyaltyDiscount = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client && client.discountPercent && client.discountPercent > 0) {
      addActivityLog({
        type: 'client',
        description: `Desconto de ${client.discountPercent}% aplicado para cliente ${client.name}`,
        entityId: clientId,
        entityType: 'client',
      });
      alert(`Desconto de ${client.discountPercent}% disponível para ${client.name}!`);
    } else {
      alert('Este cliente ainda não possui desconto disponível.');
    }
  };

  // Client Dashboard View
  if (selectedClientId && selectedClient) {
    const metrics = getClientMetrics(selectedClientId);
    
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedClientId(null)}
            className="flex items-center text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
          </button>
        </div>

        {/* Client Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                {selectedClient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedClient.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2 opacity-90">
                    <Mail className="w-4 h-4" /> {selectedClient.email}
                  </span>
                  <span className="flex items-center gap-2 opacity-90">
                    <Phone className="w-4 h-4" /> {selectedClient.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${metrics.loyaltyBg} ${metrics.loyaltyColor}`}>
                <Star className="w-4 h-4 inline mr-1" />
                {metrics.loyaltyTier}
              </span>
              <a
                href={getClientContactUrl(selectedClient.phone, selectedClient.email)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/20 rounded-full font-bold text-sm hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contato
              </a>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.totalOrders} pedidos</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold text-slate-400 uppercase">Lucro</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalProfit)}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.totalProfit > 0 ? 'Positivo' : 'Negativo'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-400 uppercase">Peças</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalPieces}</p>
            <p className="text-xs text-slate-500 mt-1">Total impresso</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-bold text-slate-400 uppercase">Tempo</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalPrintHours.toFixed(1)}h</p>
            <p className="text-xs text-slate-500 mt-1">Total impressão</p>
          </div>
        </div>

        {/* Loyalty Program Card */}
        {metrics.discountPercent > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-600" />
                <div>
                  <h4 className="font-bold text-amber-900">Programa de Fidelidade</h4>
                  <p className="text-sm text-amber-700">Desconto de {metrics.discountPercent}% disponível</p>
                </div>
              </div>
              <button
                onClick={() => handleApplyLoyaltyDiscount(selectedClientId)}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Aplicar Desconto
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Ações Rápidas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href={`mailto:${selectedClient.email}`}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Mail className="w-6 h-6 text-blue-500" />
              <span className="text-xs font-bold text-slate-600">Email</span>
            </a>
            <a
              href={getClientContactUrl(selectedClient.phone, selectedClient.email)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-emerald-500" />
              <span className="text-xs font-bold text-slate-600">WhatsApp</span>
            </a>
            <a
              href={`tel:${selectedClient.phone}`}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold text-slate-600">Ligar</span>
            </a>
            <button
              onClick={() => setShowNotesModal(true)}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-6 h-6 text-purple-500" />
              <span className="text-xs font-bold text-slate-600">Notas</span>
            </button>
          </div>
        </div>

        {/* Notes Section */}
        {selectedClient.notes && (
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h3 className="text-lg font-bold text-amber-800 mb-2">Notas Internas</h3>
            <p className="text-amber-700 whitespace-pre-wrap">{selectedClient.notes}</p>
          </div>
        )}

        {/* Order History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Histórico de Pedidos</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.map(budget => {
                const product = products.find(p => p.id === budget.productId);
                return (
                  <div key={budget.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          budget.status === 'Aprovado' ? 'bg-emerald-500' :
                          budget.status === 'Pendente' ? 'bg-amber-500' :
                          budget.status === 'Concluido' ? 'bg-blue-500' :
                          'bg-rose-500'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-800">{product?.name || 'Peça customizada'}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(budget.date).toLocaleDateString('pt-BR')} • {budget.quantity || 1} un • {budget.weightG}g
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(budget.price)}</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          budget.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                          budget.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                          budget.status === 'Concluido' ? 'bg-blue-100 text-blue-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {budget.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Editar Notas do Cliente</h3>
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Adicione notas internas sobre este cliente (preferências, histórico, etc.)"
                className="w-full p-4 border border-slate-200 rounded-xl h-40 resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNotes}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Salvar Notas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de contatos e histórico.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-semibold"
        >
          {showForm ? <Trash2 className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>

      {!showForm && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Ex: João Silva" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="joao@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone / WhatsApp</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF (Opcional)</label>
              <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Endereço de Entrega</label>
              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 border rounded-xl h-24" placeholder="Rua, Número, Bairro, Cidade - Estado" />
            </div>
            <div className="col-span-full">
              <button type="submit" className="w-full md:w-fit px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Cadastrar Cliente</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
          const clientBudgets = budgets.filter((budget) => budget.clientId === client.id);
          const approvedRevenue = clientBudgets
            .filter((budget) => isApprovedBudget(budget.status))
            .reduce((total, budget) => total + budget.price, 0);

          return (
            <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{client.name}</h4>
                  <p className="text-xs text-slate-500">{client.cpf || 'Visitante'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2 opacity-40" /> {client.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2 opacity-40" /> {client.phone}
                </div>
                {client.address && (
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 opacity-40 shrink-0" /> 
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
              </div>

              <a
                href={getClientContactUrl(client.phone, client.email)}
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                aria-label={`Abrir contato de ${client.name}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total de Pedidos</span>
                  <span className="text-sm font-bold text-slate-700">{clientBudgets.length}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Receita Aprovada</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(approvedRevenue)}</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredClients.length === 0 && !showForm && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
