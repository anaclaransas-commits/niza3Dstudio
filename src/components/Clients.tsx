/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  UserPlus,
  Trash2,
  ExternalLink
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
  const { clients, addClient, budgets } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
