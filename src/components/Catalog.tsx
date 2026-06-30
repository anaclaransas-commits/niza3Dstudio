/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Box, CheckCircle2, Copy, ExternalLink, Instagram, Mail, MessageCircle, Palette, RefreshCw, Save, X, ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { getCatalogAdminData, getCatalogBackendDebugInfo, getCatalogPublicData, uploadCatalogAsset } from '../lib/catalogApi';
import { getProductImages } from '../lib/catalogUtils';
import type { CatalogSettings, Product } from '../types';

/* ── Settings panel ───────────────────────────────── */
function SettingsPanel({ settings, onSave, onClose }: {
  settings: CatalogSettings;
  onSave: (s: Partial<CatalogSettings>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...settings });
  const logoRef = React.useRef<HTMLInputElement>(null);
  const coverRef = React.useRef<HTMLInputElement>(null);
  const [uploadingAsset, setUploadingAsset] = useState<'logo' | 'cover' | null>(null);

  const uploadBrandAsset = async (
    file: File,
    folder: string,
    field: 'logoUrl' | 'coverImageUrl',
    errorMessage: string,
  ) => {
    setUploadingAsset(field === 'logoUrl' ? 'logo' : 'cover');

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
        folder,
      });

      setForm((prev) => ({ ...prev, [field]: uploadedAsset.url }));
    } catch (error) {
      console.error(error);
      alert(errorMessage);
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadBrandAsset(file, 'branding/logo', 'logoUrl', 'Falha ao enviar o logo para o catálogo.');
    event.target.value = '';
  };

  const handleCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadBrandAsset(file, 'branding/cover', 'coverImageUrl', 'Falha ao enviar a capa do catálogo.');
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto my-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" /> Personalizar Catálogo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-5">
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
                {uploadingAsset === 'logo' ? 'Enviando...' : form.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Imagem de Capa</label>
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[16/7]">
                {form.coverImageUrl ? (
                  <img src={form.coverImageUrl} alt="capa do catálogo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Sem capa
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => coverRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                  {uploadingAsset === 'cover' ? 'Enviando...' : form.coverImageUrl ? 'Trocar Capa' : 'Enviar Capa'}
                </button>
                {form.coverImageUrl && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, coverImageUrl: undefined }))}
                    className="px-3 py-2 bg-rose-50 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-100 transition-colors">
                    Remover
                  </button>
                )}
                <input type="file" ref={coverRef} onChange={handleCover} className="hidden" accept="image/*" />
              </div>
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
              <label className="text-xs font-bold text-slate-500 uppercase">Barra de anúncio</label>
              <input value={form.announcementText || ''} onChange={e => setForm(p => ({ ...p, announcementText: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="Ex: produção sob demanda, envio para todo o Brasil..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição principal</label>
              <textarea value={form.heroDescription || ''} onChange={e => setForm(p => ({ ...p, heroDescription: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm h-20 resize-none"
                placeholder="Descreva o posicionamento da sua empresa e o tipo de projeto que vocês atendem." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Destaque 1</label>
              <input value={form.highlightOne || ''} onChange={e => setForm(p => ({ ...p, highlightOne: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Destaque 2</label>
              <input value={form.highlightTwo || ''} onChange={e => setForm(p => ({ ...p, highlightTwo: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Destaque 3</label>
              <input value={form.highlightThree || ''} onChange={e => setForm(p => ({ ...p, highlightThree: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Título da vitrine</label>
              <input value={form.catalogHeadline || ''} onChange={e => setForm(p => ({ ...p, catalogHeadline: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Subtítulo da vitrine</label>
              <input value={form.catalogSubheadline || ''} onChange={e => setForm(p => ({ ...p, catalogSubheadline: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Título institucional</label>
              <input value={form.aboutTitle || ''} onChange={e => setForm(p => ({ ...p, aboutTitle: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Título do bloco de contato</label>
              <input value={form.contactHeadline || ''} onChange={e => setForm(p => ({ ...p, contactHeadline: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Texto institucional</label>
              <textarea value={form.aboutText || ''} onChange={e => setForm(p => ({ ...p, aboutText: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm h-20 resize-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Texto do bloco de contato</label>
              <textarea value={form.contactText || ''} onChange={e => setForm(p => ({ ...p, contactText: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm h-20 resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Rótulo do botão principal</label>
              <input value={form.primaryCtaLabel || ''} onChange={e => setForm(p => ({ ...p, primaryCtaLabel: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="Solicitar orçamento" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Link do botão principal</label>
              <input value={form.primaryCtaUrl || ''} onChange={e => setForm(p => ({ ...p, primaryCtaUrl: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="Deixe vazio para usar o WhatsApp" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Rótulo do botão secundário</label>
              <input value={form.secondaryCtaLabel || ''} onChange={e => setForm(p => ({ ...p, secondaryCtaLabel: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="Ver Instagram" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Link do botão secundário</label>
              <input value={form.secondaryCtaUrl || ''} onChange={e => setForm(p => ({ ...p, secondaryCtaUrl: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                placeholder="Deixe vazio para usar Instagram ou e-mail" />
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

/* ── Filter Values Management Panel ─────────────────────────── */
function FilterValuesManagementPanel({ 
  products, 
  field, 
  fieldName, 
  onUpdateValues, 
  onClose 
}: { 
  products: Product[]; 
  field: string;
  fieldName: string;
  onUpdateValues: (values: string[]) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const uniqueValues = Array.from(new Set(
      products
        .map((p) => {
          const fieldValue = p[field as keyof Product];
          if (Array.isArray(fieldValue)) {
            return fieldValue.flat();
          }
          return fieldValue;
        })
        .flat()
        .filter(Boolean)
    ));
    setValues(uniqueValues);
  }, [products, field]);

  const handleAddValue = () => {
    if (newValue.trim()) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
      onUpdateValues([...values, newValue.trim()]);
    }
  };

  const handleDeleteValue = (value: string) => {
    const updated = values.filter(v => v !== value);
    setValues(updated);
    onUpdateValues(updated);
  };

  const handleEditValue = (value: string) => {
    setEditingValue(value);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (editingValue && editValue.trim()) {
      const updated = values.map(v => v === editingValue ? editValue.trim() : v);
      setValues(updated);
      onUpdateValues(updated);
      setEditingValue(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingValue(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto my-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" /> Gerenciar {fieldName}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          {/* Add new value */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Adicionar novo valor</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Nome do ${fieldName.toLowerCase()}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2"
                style={{ '--tw-ring-color': '#3b82f640' } as any}
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="px-4 py-2.5 bg-blue-500 rounded-xl text-sm font-bold text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* Existing values */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Valores existentes ({values.length})</label>
            <div className="space-y-2">
              {values.map((value) => (
                <div
                  key={value}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  {editingValue === value ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-sm focus:ring-2"
                        style={{ '--tw-ring-color': '#3b82f640' } as any}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-2 bg-green-500 rounded-lg text-sm font-bold text-white hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-slate-400 rounded-lg text-sm font-bold text-white hover:bg-slate-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-700">{value}</span>
                      <button
                        type="button"
                        onClick={() => handleEditValue(value)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(value)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {values.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum valor cadastrado ainda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryManagementPanel({ 
  products, 
  onUpdateCategories, 
  onClose 
}: { 
  products: Product[]; 
  onUpdateCategories: (categories: string[]) => void;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.collection || 'Geral').filter(Boolean)));
    setCategories(uniqueCategories);
  }, [products]);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      onUpdateCategories([...categories, newCategory.trim()]);
    }
  };

  const handleDeleteCategory = (category: string) => {
    const updated = categories.filter(c => c !== category);
    setCategories(updated);
    onUpdateCategories(updated);
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editValue.trim()) {
      const updated = categories.map(c => c === editingCategory ? editValue.trim() : c);
      setCategories(updated);
      onUpdateCategories(updated);
      setEditingCategory(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto my-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" /> Gerenciar Categorias
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          {/* Add new category */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Adicionar nova categoria</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nome da categoria..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2"
                style={{ '--tw-ring-color': '#3b82f640' } as any}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2.5 bg-blue-500 rounded-xl text-sm font-bold text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* Existing categories */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Categorias existentes ({categories.length})</label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  {editingCategory === category ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-sm focus:ring-2"
                        style={{ '--tw-ring-color': '#3b82f640' } as any}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-2 bg-green-500 rounded-lg text-sm font-bold text-white hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-slate-400 rounded-lg text-sm font-bold text-white hover:bg-slate-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-700">{category}</span>
                      <button
                        type="button"
                        onClick={() => handleEditCategory(category)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhuma categoria cadastrada ainda
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-800">
              💡 As categorias são usadas para organizar seus produtos no catálogo público. 
              Edite os produtos para atribuir categorias diferentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type CatalogDiagnostics = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  errorDetails?: string;
  remoteProducts?: number;
  remotePublicProducts?: number;
};

/* ── Product Card Component ───────────────────────── */
function ProductCard({ product, accentColor, primaryColor, primaryCtaLabel, whatsapp, key }: {
  product: Product;
  accentColor: string;
  primaryColor: string;
  primaryCtaLabel: string;
  whatsapp: string;
  key?: string;
}) {
  const images = getProductImages(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-slate-100">
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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
            {primaryCtaLabel || 'Peça seu orçamento'}
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
  );
}

/* ── Main Catalog page ────────────────────────────── */
export function Catalog() {
  const { products, catalogSettings, updateCatalogSettings } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showFilterManagement, setShowFilterManagement] = useState(false);
  const [selectedFilterField, setSelectedFilterField] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [search, setSearch] = useState('');
  const [diagnostics, setDiagnostics] = useState<CatalogDiagnostics>({ status: 'idle' });

  const backendInfo = useMemo(() => getCatalogBackendDebugInfo(), []);
  const publicProducts = products.filter(p => p.isPublic !== false);
  const collections = ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Sem Coleção')))];

  const filtered: Product[] = publicProducts.filter(p => {
    const matchCollection = activeCollection === 'Todos' || (p.collection || 'Sem Coleção') === activeCollection;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCollection && matchSearch;
  });

  const {
    primaryColor,
    accentColor,
    businessName,
    tagline,
    logoUrl,
    coverImageUrl,
    announcementText,
    heroDescription,
    highlightOne,
    highlightTwo,
    highlightThree,
    catalogHeadline,
    catalogSubheadline,
    aboutTitle,
    aboutText,
    contactHeadline,
    contactText,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    whatsapp,
    instagram,
    email,
    footerNote,
  } = catalogSettings;
  const previewHighlights = [highlightOne, highlightTwo, highlightThree].filter(Boolean);
  const previewPrimaryUrl = primaryCtaUrl || (whatsapp ? `https://wa.me/${whatsapp}` : email ? `mailto:${email}` : undefined);
  const previewSecondaryUrl = secondaryCtaUrl || (instagram ? `https://instagram.com/${instagram.replace('@', '')}` : email ? `mailto:${email}` : undefined);
  const isLocalPreview = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const publicCatalogPath = isLocalPreview ? '/catalogo.html' : '/catalogo';
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

  const handleRunDiagnostics = async () => {
    setDiagnostics({ status: 'loading' });

    try {
      const [adminSnapshot, publicSnapshot] = await Promise.all([
        getCatalogAdminData(),
        getCatalogPublicData(),
      ]);

      const remoteProducts = adminSnapshot.products.length;
      const remotePublicProducts = publicSnapshot.products.length;
      let message = 'O backend compartilhado respondeu normalmente.';

      if (remoteProducts === 0 && products.length > 0) {
        message = 'Os produtos deste navegador ainda não foram publicados no backend compartilhado.';
      } else if (remoteProducts > 0 && remotePublicProducts === 0) {
        message = 'O backend tem produtos, mas todos estão privados no catálogo do cliente.';
      } else if (remotePublicProducts > 0) {
        message = 'O catálogo público já está recebendo produtos do backend compartilhado.';
      }

      setDiagnostics({
        status: 'success',
        message,
        remoteProducts,
        remotePublicProducts,
      });
    } catch (error) {
      setDiagnostics({
        status: 'error',
        message: 'Falha ao acessar o backend compartilhado do catálogo.',
        errorDetails: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 sm:px-5 py-3 no-print gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-amber-700">
          <span className="text-xs font-black uppercase tracking-widest">👁 Visualização do catálogo do cliente</span>
          <span className="text-xs text-amber-500">• Preços ocultos • {publicProducts.length} produto(s) visível(is)</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowCategoryManagement(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Categorias
          </button>
          <button onClick={() => setShowFilterManagement(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
            <Palette className="w-3.5 h-3.5" /> Filtros
          </button>
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
            <Palette className="w-3.5 h-3.5" /> Personalizar
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-4 no-print">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Link público do catálogo</p>
            <p className="text-sm text-slate-600 mt-1">Esse é o link que o cliente acessa sem entrar no painel.</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex-1 sm:max-w-xl px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 break-all">
              {publicCatalogUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPublicLink}
                className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copiar
              </button>
              <button
                onClick={handleOpenPublicCatalog}
                className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Abrir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-4 no-print space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Diagnóstico do catálogo</p>
            <p className="text-sm text-slate-600 mt-1">Use este teste para confirmar se este build está lendo e publicando no backend compartilhado.</p>
          </div>
          <button
            onClick={handleRunDiagnostics}
            disabled={diagnostics.status === 'loading'}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${diagnostics.status === 'loading' ? 'animate-spin' : ''}`} />
            {diagnostics.status === 'loading' ? 'Testando...' : 'Testar publicação'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Backend detectado</p>
            <p className="mt-2 text-sm font-bold text-slate-800">
              {backendInfo.supabase.configured
                ? `Supabase (${backendInfo.supabase.projectHost})`
                : backendInfo.apiBaseUrl
                  ? `API (${backendInfo.apiBaseUrl})`
                  : 'Nenhum backend compartilhado detectado'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Produtos neste navegador</p>
            <p className="mt-2 text-sm font-bold text-slate-800">{products.length} total / {publicProducts.length} públicos</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tabelas</p>
            <p className="mt-2 text-sm font-bold text-slate-800">{backendInfo.supabase.productsTable} / {backendInfo.supabase.settingsTable}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bucket</p>
            <p className="mt-2 text-sm font-bold text-slate-800">{backendInfo.supabase.storageBucket}</p>
          </div>
        </div>

        {diagnostics.status !== 'idle' && (
          <div className={`rounded-2xl border px-4 py-4 text-sm ${diagnostics.status === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : diagnostics.status === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <div className="flex items-start gap-3">
              {diagnostics.status === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              ) : diagnostics.status === 'error' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              ) : (
                <RefreshCw className="mt-0.5 h-5 w-5 flex-shrink-0 animate-spin" />
              )}
              <div className="space-y-2">
                <p className="font-bold">{diagnostics.message}</p>
                {typeof diagnostics.remoteProducts === 'number' && (
                  <p>Produtos no backend: {diagnostics.remoteProducts} total / {diagnostics.remotePublicProducts ?? 0} públicos</p>
                )}
                {diagnostics.errorDetails && (
                  <p className="break-words font-mono text-xs">{diagnostics.errorDetails}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          settings={catalogSettings}
          onSave={updateCatalogSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCategoryManagement && (
        <CategoryManagementPanel
          products={publicProducts}
          onUpdateCategories={(updatedCategories) => {
            // Categories are managed via product updates - this panel is for reference only
            console.log('Categories updated:', updatedCategories);
          }}
          onClose={() => setShowCategoryManagement(false)}
        />
      )}

      {showFilterManagement && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" /> Gerenciar Filtros
              </h3>
              <button onClick={() => setShowFilterManagement(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Selecione o campo para gerenciar</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('ambiente'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Ambiente
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('público'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Público
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('estilo'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Estilo
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('ocasião'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Ocasião
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('coleção'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Coleção
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilterField('material'); setShowFilterManagement(false); }}
                  className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFilterField && (
        <FilterValuesManagementPanel
          products={publicProducts}
          field={selectedFilterField}
          fieldName={selectedFilterField.charAt(0).toUpperCase() + selectedFilterField.slice(1)}
          onUpdateValues={(updatedValues) => {
            // Filter values are managed via product updates - this panel is for reference only
            console.log(`${selectedFilterField} values updated:`, updatedValues);
          }}
          onClose={() => setSelectedFilterField(null)}
        />
      )}

      {/* ═══════════════════════════════════════════════════
          CATALOG — this section is what the client sees
          ═══════════════════════════════════════════════════ */}
      <div
        className="catalog-print-area rounded-3xl overflow-hidden"
        style={{ '--primary': primaryColor, '--accent': accentColor } as React.CSSProperties}
      >
        {announcementText && (
          <div className="bg-slate-950 px-6 py-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
            {announcementText}
          </div>
        )}

        {/* Header */}
        <div
          className="px-8 py-10 text-white"
          style={{
            background: coverImageUrl
              ? `linear-gradient(120deg, ${primaryColor}ee 0%, ${accentColor}cc 58%, ${primaryColor}f2 100%), url(${coverImageUrl}) center/cover`
              : primaryColor,
          }}
        >
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
              {heroDescription && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{heroDescription}</p>}
              {previewHighlights.length > 0 && (
                <div className="flex flex-nowrap gap-1.5 mt-4 overflow-x-auto md:flex-wrap md:overflow-visible">
                  {previewHighlights.map((highlight) => (
                    <span key={highlight} className="whitespace-nowrap rounded-full border border-white/16 bg-white/12 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white/80 md:px-3 md:py-1.5 md:text-[11px]">
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
              {(previewPrimaryUrl || previewSecondaryUrl) && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {previewPrimaryUrl && (
                    <a href={previewPrimaryUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black bg-white text-slate-900 px-4 py-2 rounded-full transition-colors">
                      {primaryCtaLabel || 'Solicitar orçamento'}
                    </a>
                  )}
                  {previewSecondaryUrl && (
                    <a href={previewSecondaryUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors">
                      {secondaryCtaLabel || 'Ver Instagram'}
                    </a>
                  )}
                </div>
              )}
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
        <div className="bg-white px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-100 no-print">
          <div className="max-w-4xl mx-auto mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{catalogHeadline || 'Coleções em destaque'}</h2>
            {catalogSubheadline && <p className="mt-2 text-sm text-slate-500">{catalogSubheadline}</p>}
          </div>
          
          {/* Search input */}
          <div className="max-w-4xl mx-auto mb-4">
            <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2"
              style={{ '--tw-ring-color': accentColor + '40' } as any} />
          </div>
          
          {/* Categories - Always horizontal */}
          {collections.length > 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 flex-wrap items-center justify-center sm:justify-start overflow-x-auto pb-2 scrollbar-hide">
                {collections.map(col => (
                  <button key={col} onClick={() => setActiveCollection(col)}
                    className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0"
                    style={activeCollection === col
                      ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor }
                      : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products grid */}
        <div className="bg-slate-50 px-8 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <ProductCard
                product={product}
                accentColor={accentColor}
                primaryColor={primaryColor}
                primaryCtaLabel={primaryCtaLabel}
                whatsapp={whatsapp}
                key={product.id}
              />
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
          <p className="text-xs opacity-40 mt-2">Catálogo digital {businessName}</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .catalog-print-area { border-radius: 0 !important; }
          body { background: white !important; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

