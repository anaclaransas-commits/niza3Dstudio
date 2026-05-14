/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Printer as PrinterIcon, 
  Droplets, 
  Plus, 
  Trash2, 
  Search,
  Zap,
  DollarSign,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Shapes,
  FlaskConical,
  ShoppingCart
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, cn } from '../lib/utils';

type SubTab = 'printers' | 'filaments' | 'resins' | 'channels';

export function Registration() {
  const { 
    printers, addPrinter, 
    filaments, addFilament,
    resins, addResin,
    channels, addChannel
  } = useStore();

  const [activeTab, setActiveTab] = useState<SubTab>('printers');
  const [showForm, setShowForm] = useState(false);

  // Forms states
  const [printerForm, setPrinterForm] = useState({ name: '', brand: '', model: '', power: '250', price: '1500', maint: '1' });
  const [filForm, setFilForm] = useState({ name: '', brand: '', material: 'PLA', weightKg: '1', price: '120', color: '#000000' });
  const [resinForm, setResinForm] = useState({ name: '', brand: '', type: 'Resin', pricePerUnit: '250', volumeMl: '500' });
  const [channelForm, setChannelForm] = useState({ name: '', fee: '0' });

  const tabs = [
    { id: 'printers', label: 'Impressoras', icon: PrinterIcon },
    { id: 'filaments', label: 'Filamentos', icon: Droplets },
    { id: 'resins', label: 'Resinas & Insumos', icon: FlaskConical },
    { id: 'channels', label: 'Canais de Venda', icon: ShoppingCart },
  ];

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    addPrinter({
      name: printerForm.name,
      brand: printerForm.brand,
      model: printerForm.model,
      powerConsumption: Number(printerForm.power),
      purchasePrice: Number(printerForm.price),
      maintenanceCostPerHour: Number(printerForm.maint)
    });
    setShowForm(false);
    setPrinterForm({ name: '', brand: '', model: '', power: '250', price: '1500', maint: '1' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cadastros de Infraestrutura</h2>
          <p className="text-slate-500">Configure suas máquinas, insumos e canais.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-semibold"
        >
          {showForm ? <Trash2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Fechar Form' : `Nova ${activeTab.slice(0, -1)}`}
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as SubTab); setShowForm(false); }}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          {activeTab === 'printers' && (
            <form onSubmit={handleAddPrinter} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Amigável</label>
                <input required value={printerForm.name} onChange={e => setPrinterForm({...printerForm, name: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Ender 3 Pro Alpha" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <input required value={printerForm.brand} onChange={e => setPrinterForm({...printerForm, brand: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Creality" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo</label>
                <input required value={printerForm.model} onChange={e => setPrinterForm({...printerForm, model: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Ender 3 v2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center"><Zap className="w-4 h-4 mr-2 text-amber-500" /> Consumo (W)</label>
                <input type="number" value={printerForm.power} onChange={e => setPrinterForm({...printerForm, power: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center"><DollarSign className="w-4 h-4 mr-2 text-emerald-500" /> Valor Compra</label>
                <input type="number" value={printerForm.price} onChange={e => setPrinterForm({...printerForm, price: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center"><Monitor className="w-4 h-4 mr-2 text-sky-500" /> Manutenção por Hora</label>
                <input type="number" step="0.1" value={printerForm.maint} onChange={e => setPrinterForm({...printerForm, maint: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="col-span-full pt-4">
                <button type="submit" className="w-full md:w-fit px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Salvar Impressora</button>
              </div>
            </form>
          )}

          {activeTab === 'filaments' && (
            <form onSubmit={(e) => { e.preventDefault(); addFilament({ name: filForm.name, brand: filForm.brand, material: filForm.material as any, weightKg: Number(filForm.weightKg), pricePerKg: Number(filForm.price), color: filForm.color }); setShowForm(false); }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Filamento</label>
                <input required value={filForm.name} onChange={e => setFilForm({...filForm, name: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="PLA Silky Blue" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <input required value={filForm.brand} onChange={e => setFilForm({...filForm, brand: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="3D LAB" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Material</label>
                <select value={filForm.material} onChange={e => setFilForm({...filForm, material: e.target.value})} className="w-full p-2.5 border rounded-xl">
                  <option value="PLA">PLA</option>
                  <option value="ABS">ABS</option>
                  <option value="PETG">PETG</option>
                  <option value="TPU">TPU</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço p/ Kg</label>
                <input type="number" required value={filForm.price} onChange={e => setFilForm({...filForm, price: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <input type="color" value={filForm.color} onChange={e => setFilForm({...filForm, color: e.target.value})} className="w-full h-[42px] border rounded-xl p-1" />
              </div>
              <div className="col-span-full pt-4">
                <button type="submit" className="w-full md:w-fit px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Salvar Filamento</button>
              </div>
            </form>
          )}

          {activeTab === 'resins' && (
            <form onSubmit={(e) => { e.preventDefault(); addResin({ name: resinForm.name, brand: resinForm.brand, type: resinForm.type as any, pricePerUnit: Number(resinForm.pricePerUnit), volumeMl: Number(resinForm.volumeMl) }); setShowForm(false); }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Insumo</label>
                <input required value={resinForm.name} onChange={e => setResinForm({...resinForm, name: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Resina Standard Grey" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <input value={resinForm.brand} onChange={e => setResinForm({...resinForm, brand: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Anycubic" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço</label>
                <input type="number" value={resinForm.pricePerUnit} onChange={e => setResinForm({...resinForm, pricePerUnit: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="col-span-full pt-4">
                <button type="submit" className="w-full md:w-fit px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Salvar Insumo</button>
              </div>
            </form>
          )}

          {activeTab === 'channels' && (
            <form onSubmit={(e) => { e.preventDefault(); addChannel({ name: channelForm.name, feePercentage: Number(channelForm.fee) }); setShowForm(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Canal</label>
                <input required value={channelForm.name} onChange={e => setChannelForm({...channelForm, name: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="Mercado Livre, Shopee, etc." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Taxa / Comissão %</label>
                <input type="number" value={channelForm.fee} onChange={e => setChannelForm({...channelForm, fee: e.target.value})} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div className="col-span-full pt-4">
                <button type="submit" className="w-full md:w-fit px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Salvar Canal</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'printers' && printers.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <PrinterIcon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Ativa
              </span>
            </div>
            <h4 className="font-bold text-slate-800">{p.name}</h4>
            <p className="text-xs text-slate-500 mb-4">{p.brand} {p.model}</p>
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Consumo</p>
                <p className="text-sm font-semibold">{p.powerConsumption}W</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Investimento</p>
                <p className="text-sm font-semibold">{formatCurrency(p.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Manutenção</p>
                <p className="text-sm font-semibold">{formatCurrency(p.maintenanceCostPerHour)}/h</p>
              </div>
            </div>
          </div>
        ))}
        {activeTab === 'filaments' && filaments.map(f => (
          <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: f.color}}></div>
                <h4 className="font-bold text-slate-800">{f.name}</h4>
              </div>
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-4 flex justify-between items-end">
              <p className="text-xs text-slate-500">{f.brand} - {f.material}</p>
              <p className="text-sm font-bold text-slate-800">{formatCurrency(f.pricePerKg)}/Kg</p>
            </div>
          </div>
        ))}
        {activeTab === 'resins' && resins.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2">{r.name}</h4>
            <p className="text-xs text-slate-500">{r.brand} - {r.type}</p>
            <p className="mt-4 text-sm font-bold text-slate-800">{formatCurrency(r.pricePerUnit)}</p>
          </div>
        ))}
        {activeTab === 'channels' && channels.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">{c.name}</h4>
              <p className="text-xs text-slate-500">Taxa: {c.feePercentage}%</p>
            </div>
            <ShoppingCart className="w-5 h-5 text-slate-300" />
          </div>
        ))}
        {/* Empty states handling... */}
      </div>
        {printers.length === 0 && activeTab === 'printers' && !showForm && (
          <div className="col-span-full py-12 flex flex-col items-center text-slate-400">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
            <p>Nenhuma impressora cadastrada ainda.</p>
          </div>
        )}
      </div>
  );
}
