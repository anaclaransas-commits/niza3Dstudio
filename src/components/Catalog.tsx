/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Copy, ExternalLink, Instagram, Mail, MessageCircle, Palette, Save, X } from 'lucide-react';
import { useStore } from '../store';
import { uploadCatalogAsset } from '../lib/catalogApi';
import type { CatalogSettings } from '../types';

/* ── Settings panel ───────────────────────────────── */
function SettingsPanel({ settings, onSave, onClose }: {
  settings: CatalogSettings;
  onSave: (s: Partial<CatalogSettings>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...settings });
  const logoRef = React.useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingLogo(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Falha ao carregar ${file.name}.`));
        reader.readAsDataURL(file);
      });

      const uploadedAsset = await uploadCatalogAsset({
        dataUrl,
        fileName: file.name,
        folder: 'branding/logo',
      });

      setForm((prev) => ({ ...prev, logoUrl: uploadedAsset.url }));
    } catch (error) {
      console.error(error);
      alert('Falha ao enviar o logo para o catálogo.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" /> Personalizar Catálogo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Logo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Logo da Empresa</label>
            <div className="flex items-center gap-4">
              {form.logoUrl
                ? <img src={form.logoUrl} alt="logo" className="h-14 w-auto rounded-xl object-contain border border-slate-100 p-1" />
                : <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 text-xs font-bold">LOGO</div>
              }
              <button type="button" onClick={() => logoRef.current?.click()}
                className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                {uploadingLogo ? 'Enviando...' : form.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
              </button>
              {form.logoUrl && (
                <button type="button" onClick={() => setForm(p => ({ ...p, logoUrl: undefined }))}
                  className="px-3 py-2 bg-rose-50 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-100 transition-colors">
                  Remover
                </button>
              )}
              <input type="file" ref={logoRef} onChange={handleLogo} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Empresa</label>
              <input value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Slogan</label>
              <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cor Principal</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primaryColor}
                  onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                <span className="text-xs text-slate-500 font-mono">{form.primaryColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cor de Destaque</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accentColor}
                  onChange={e => setForm(p => ({ ...p, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                <span className="text-xs text-slate-500 font-mono">{form.accentColor}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp</label>
              <input value={form.whatsapp || ''} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="5511999999999 (só números)" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram</label>
              <input value={form.instagram || ''} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="@seuperfil" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail className="w-3 h-3" /> E-mail</label>
              <input value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="contato@suaempresa.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nota de Rodapé</label>
              <textarea value={form.footerNote || ''} onChange={e => setForm(p => ({ ...p, footerNote: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm h-16 resize-none"
                placeholder="Informações adicionais para o cliente..." />
            </div>
          </div>

          <button onClick={() => { onSave(form); onClose(); }}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Catalog page ────────────────────────────── */
export function Catalog() {
  const { products, catalogSettings, updateCatalogSettings } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [search, setSearch] = useState('');

  const publicProducts = products.filter(p => p.isPublic !== false);
  const collections = ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Sem Coleção')))];

  const filtered = publicProducts.filter(p => {
    const matchCollection = activeCollection === 'Todos' || (p.collection || 'Sem Coleção') === activeCollection;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCollection && matchSearch;
  });

  const { primaryColor, accentColor, businessName, tagline, logoUrl, whatsapp, instagram, email, footerNote } = catalogSettings;
  const publicCatalogPath =
    typeof window !== 'undefined' && window.location.port === '3000'
      ? '/catalogo.html'
      : '/catalogo';
  const publicCatalogUrl = typeof window === 'undefined' ? publicCatalogPath : `${window.location.origin}${publicCatalogPath}`;

  const handlePrint = () => window.print();
  const handleOpenPublicCatalog = () => {
    window.open(publicCatalogPath, '_blank', 'noopener,noreferrer');
  };
  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicCatalogUrl);
      alert('Link público copiado.');
    } catch (error) {
      console.error(error);
      alert(publicCatalogUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin toolbar */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 no-print">
        <div className="flex items-center gap-2 text-amber-700">
          <span className="text-xs font-black uppercase tracking-widest">👁 Visualização do catálogo do cliente</span>
          <span className="text-xs text-amber-500">• Preços ocultos • {publicProducts.length} produto(s) visível(is)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
            <Palette className="w-3.5 h-3.5" /> Personalizar
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 no-print">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Link público do catálogo</p>
            <p className="text-sm text-slate-600 mt-1">Esse é o link que o cliente acessa sem entrar no painel.</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="flex-1 md:max-w-xl px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 break-all">
              {publicCatalogUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPublicLink}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copiar
              </button>
              <button
                onClick={handleOpenPublicCatalog}
                className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Abrir
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={catalogSettings}
          onSave={updateCatalogSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════
          CATALOG — this section is what the client sees
          ═══════════════════════════════════════════════════ */}
      <div
        className="catalog-print-area rounded-3xl overflow-hidden"
        style={{ '--primary': primaryColor, '--accent': accentColor } as React.CSSProperties}
      >
        {/* Header */}
        <div className="px-8 py-10 text-white" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="h-20 w-auto object-contain rounded-2xl bg-white/10 p-2" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white/60 text-3xl font-black">
                3D
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-tight">{businessName}</h1>
              <p className="mt-1 text-sm opacity-75">{tagline}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
                {instagram && (
                  <a href={`https://instagram.com/${instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    <Instagram className="w-3.5 h-3.5" /> {instagram}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="bg-white px-8 py-5 border-b border-slate-100 no-print">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2"
              style={{ '--tw-ring-color': accentColor + '40' } as any} />
          </div>
          {collections.length > 1 && (
            <div className="max-w-4xl mx-auto flex gap-2 flex-wrap mt-3">
              {collections.map(col => (
                <button key={col} onClick={() => setActiveCollection(col)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                  style={activeCollection === col
                    ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor }
                    : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products grid */}
        <div className="bg-slate-50 px-8 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-slate-100">
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-white uppercase tracking-widest"
                      style={{ backgroundColor: accentColor }}>
                      {product.materialType}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-slate-800 text-base mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{product.description}</p>
                  )}
                  {product.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.split(',').slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{ backgroundColor: accentColor + '18', color: accentColor }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                      style={{ backgroundColor: primaryColor }}>
                      Peça seu orçamento
                    </span>
                    {whatsapp && (
                      <a href={`https://wa.me/${whatsapp}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: '#25d366' + '20', color: '#25d366' }}
                        title="Pedir pelo WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-300">
                <Box className="w-12 h-12 mx-auto mb-4" />
                <p className="font-bold">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-white text-center" style={{ backgroundColor: primaryColor }}>
          <p className="text-sm font-bold opacity-90">{businessName}</p>
          {footerNote && <p className="text-xs opacity-60 mt-1">{footerNote}</p>}
          <p className="text-xs opacity-40 mt-2">Catálogo gerado com 3DPrint Master</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .catalog-print-area { border-radius: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
