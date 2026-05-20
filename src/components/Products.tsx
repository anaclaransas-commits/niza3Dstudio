/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Clock,
  Edit2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore } from '../store';
import { uploadCatalogAsset } from '../lib/catalogApi';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import JSZip from "jszip";

const MATERIAL_COLORS: Record<string, string> = {
  PLA:    'bg-emerald-100 text-emerald-700',
  ABS:    'bg-orange-100 text-orange-700',
  PETG:   'bg-blue-100 text-blue-700',
  TPU:    'bg-purple-100 text-purple-700',
  Resina: 'bg-rose-100 text-rose-700',
  SLA:    'bg-pink-100 text-pink-700',
  Other:  'bg-slate-100 text-slate-600',
};

const EMPTY_FORM = {
  name: '',
  materialType: 'PLA',
  description: '',
  collection: '',
  imageUrl: '',
  defaultWeightG: '',
  basePrice: '',
  stlUrl: '',
  referenceUrl: '',
  avgPrintTimeHours: '',
  tags: '',
  isPublic: true,
};

async function* getDirectoryImageFiles(
  directoryHandle: any,
  currentPath = '',
): AsyncGenerator<{ file: File; relativePath: string }> {
  for await (const entry of directoryHandle.values()) {
    const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file.type.startsWith('image/')) yield { file, relativePath };
      continue;
    }
    yield* getDirectoryImageFiles(entry, relativePath);
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Falha ao carregar ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function slugifySegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'catalogo';
}
async function extractThumbnail(file: File) {

  const zip = await JSZip.loadAsync(file);

  const thumbnailFile =
    zip.file("Metadata/thumbnail.png") ||
    zip.file("3D/Thumbnail.png");

  if (!thumbnailFile) return null;

  const blob = await thumbnailFile.async("blob");

  return URL.createObjectURL(blob);
}
export function Products() {
  const { products, addProduct, updateProduct, removeProduct, budgets } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCollection, setActiveCollection] = useState<string>('Todos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [thumbnail, setThumbnail] = useState("");

  // Collections list
  const collections = ['Todos', ...Array.from(new Set(products.map(p => p.collection || 'Sem Coleção')))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.collection?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCollection =
      activeCollection === 'Todos' ||
      (p.collection || 'Sem Coleção') === activeCollection;
    return matchSearch && matchCollection;
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      materialType: p.materialType,
      description: p.description || '',
      collection: p.collection || '',
      imageUrl: p.imageUrl || '',
      defaultWeightG: p.defaultWeightG?.toString() || '',
      basePrice: p.basePrice?.toString() || '',
      stlUrl: p.stlUrl || '',
      referenceUrl: p.referenceUrl || '',
      avgPrintTimeHours: p.avgPrintTimeHours?.toString() || '',
      tags: p.tags || '',
      isPublic: p.isPublic !== false,
    });
    setShowForm(true);
  };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  // Se for arquivo 3MF
  if (file.name.toLowerCase().endsWith('.3mf')) {

    try {

      const zip = await JSZip.loadAsync(file);

     const thumbnailFile = Object.values(zip.files).find(file =>
  file.name.toLowerCase().includes("thumbnail") &&
  (file.name.endsWith(".png") || file.name.endsWith(".jpg"))
);

      if (!thumbnailFile) {
        alert("Esse arquivo 3MF não possui thumbnail.");
        return;
      }

      const blob = await thumbnailFile.async("blob");

      const imageUrl = URL.createObjectURL(blob);

      setFormData(prev => ({
        ...prev,
        imageUrl
      }));

    } catch (error) {

      console.error(error);
      alert("Erro ao ler arquivo 3MF");

    }

    return;
  }

  // Upload normal de imagem
  setUploadingImage(true);

  try {

    const imageUrl = await uploadCatalogAsset(file);

    setFormData(prev => ({
      ...prev,
      imageUrl
    }));

  } catch (error) {

    console.error(error);
    alert("Erro ao enviar imagem");

  } finally {

    setUploadingImage(false);

  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      materialType: formData.materialType,
      description: formData.description,
      collection: formData.collection.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      defaultWeightG: formData.defaultWeightG ? Number(formData.defaultWeightG) : undefined,
      basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
      stlUrl: formData.stlUrl.trim() || undefined,
      referenceUrl: formData.referenceUrl.trim() || undefined,
      avgPrintTimeHours: formData.avgPrintTimeHours ? Number(formData.avgPrintTimeHours) : undefined,
      tags: formData.tags.trim() || undefined,
      isPublic: formData.isPublic,
    };
    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleDelete = (id: string, name: string) => {
    const linked = budgets.filter(b => b.productId === id).length;
    if (linked > 0) {
      alert(`"${name}" está ligado a ${linked} orçamento(s) e não pode ser removido.`);
      return;
    }
    if (!window.confirm(`Excluir "${name}"?`)) return;
    removeProduct(id);
  };

  const handleFolderImport = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Use Chrome ou Edge para importar pastas.');
        return;
      }
      setImporting(true);
      const dir = await (window as any).showDirectoryPicker();
      let count = 0;
      let failed = 0;
      for await (const { file, relativePath } of getDirectoryImageFiles(dir)) {
        try {
          const imageDataUrl = await readFileAsDataUrl(file);
          const segments = relativePath.split('/');
          const collection = segments.length > 1 ? segments.slice(0, -1).join(' / ') : 'Importados';
          const uploadedAsset = await uploadCatalogAsset({
            dataUrl: imageDataUrl,
            fileName: file.name,
            folder: `products/${slugifySegment(collection)}`,
          });

          addProduct({
            name: file.name.split('.')[0].replace(/[-_]/g, ' '),
            materialType: 'PLA',
            description: `Importado de: ${relativePath}`,
            collection,
            sourcePath: relativePath,
            imageUrl: uploadedAsset.url,
            defaultWeightG: 50,
            basePrice: 0,
            isPublic: true,
          });
          count++;
        } catch (error) {
          console.error(`Falha ao importar ${relativePath}.`, error);
          failed++;
        }
      }
      if (count === 0) {
        alert(failed > 0 ? 'Nenhuma imagem foi publicada com sucesso.' : 'Nenhuma imagem encontrada.');
        return;
      }
      alert(
        failed > 0
          ? `${count} produto(s) importado(s) e ${failed} arquivo(s) falharam.`
          : `${count} produto(s) importado(s).`,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') alert('Erro ao acessar a pasta.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h2>
          <p className="text-slate-500 text-sm">Gerencie produtos, imagens, links STL e visibilidade no catálogo do cliente.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleFolderImport} disabled={importing}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm disabled:opacity-50">
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Pasta'}
          </button>
          <button onClick={openAdd}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-semibold text-sm">
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar por nome, coleção, tags ou material..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" />
      </div>

      {/* Collection tabs */}
      {collections.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {collections.map(col => (
            <button key={col} onClick={() => setActiveCollection(col)}
              className={cn('px-4 py-1.5 rounded-full text-xs font-bold transition-all',
                activeCollection === col
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400')}>
              {col}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 text-lg">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image upload */}
            <div className="md:col-span-1 space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Imagem
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className={cn('relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all overflow-hidden group',
                  formData.imageUrl ? 'border-solid border-emerald-400' : '')}>
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white text-xs font-bold">
                        Enviando imagem...
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold">Alterar</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs text-slate-500 font-medium">
                      {uploadingImage ? 'Enviando imagem...' : 'Clique para upload'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG ou WEBP</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.3mf" />
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Ou cole uma URL de imagem</p>
                <input type="text" value={formData.imageUrl}
                  onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  placeholder="https://..." />
              </div>
            </div>

            {/* Fields */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome *</label>
                <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  placeholder="Vaso Low Poly" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Material</label>
                <select value={formData.materialType} onChange={e => setFormData(p => ({ ...p, materialType: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                  {['PLA','ABS','PETG','TPU','Resina','SLA'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Coleção / Categoria</label>
                <input value={formData.collection} onChange={e => setFormData(p => ({ ...p, collection: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  placeholder="Ex: Decoração, Geek, Funcional" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tags (separadas por vírgula)</label>
                <input value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  placeholder="vaso, decoração, presente" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Peso estimado (g) *</label>
                <input required type="number" value={formData.defaultWeightG}
                  onChange={e => setFormData(p => ({ ...p, defaultWeightG: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" placeholder="50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tempo médio (horas)</label>
                <input type="number" value={formData.avgPrintTimeHours}
                  onChange={e => setFormData(p => ({ ...p, avgPrintTimeHours: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" placeholder="4" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Preço sugerido (R$)</label>
                <input type="number" value={formData.basePrice}
                  onChange={e => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" placeholder="75" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Link className="w-3 h-3" /> Link STL</label>
                <input type="url" value={formData.stlUrl} onChange={e => setFormData(p => ({ ...p, stlUrl: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  placeholder="Google Drive, Printables..." />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20 outline-none resize-none text-sm"
                  placeholder="Detalhes sobre suporte, preenchimento, tempo de impressão..." />
              </div>
              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <button type="button" onClick={() => setFormData(p => ({ ...p, isPublic: !p.isPublic }))}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                    formData.isPublic ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200')}>
                  {formData.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {formData.isPublic ? 'Visível no catálogo do cliente' : 'Oculto no catálogo do cliente'}
                </button>
                <button type="submit"
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm">
                  {editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(product => {
          const linked = budgets.filter(b => b.productId === product.id).length;
          const matColor = MATERIAL_COLORS[product.materialType] || MATERIAL_COLORS.Other;
          return (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Image */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Box className="w-16 h-16" />
                  </div>
                )}
                {/* Material badge */}
                <div className="absolute top-3 left-3">
                  <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest', matColor)}>
                    {product.materialType}
                  </span>
                </div>
                {/* Visibility badge */}
                <div className="absolute top-3 right-12">
                  {product.isPublic === false ? (
                    <span className="text-[10px] font-bold bg-slate-800/80 text-slate-300 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <EyeOff className="w-3 h-3" /> Privado
                    </span>
                  ) : null}
                </div>
                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(product)}
                    className="p-2 bg-white/90 backdrop-blur-md text-slate-600 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 bg-white/90 backdrop-blur-md text-rose-400 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h4 className="font-bold text-slate-800 text-base truncate mb-1">{product.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed mb-3">
                  {product.description || 'Sem descrição.'}
                </p>

                {/* Tags */}
                {product.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.split(',').slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {product.defaultWeightG && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Package className="w-3 h-3" /> {product.defaultWeightG}g
                      </span>
                    )}
                    {product.avgPrintTimeHours && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" /> {product.avgPrintTimeHours}h
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {product.stlUrl && (
                      <a href={product.stlUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors" title="Abrir STL">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {linked > 0 && (
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-500 px-2 py-1 rounded-lg font-bold">
                        <FileText className="w-3 h-3" /> {linked}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !showForm && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100 text-slate-300">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">
              {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
            </h3>
            <p className="text-sm mt-1 text-slate-400">
              {products.length === 0 ? 'Sua vitrine aparecerá aqui.' : 'Tente outro filtro ou termo.'}
            </p>
            {products.length === 0 && (
              <button onClick={openAdd}
                className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all">
                Criar Primeiro Produto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
