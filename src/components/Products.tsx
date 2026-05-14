/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/utils';

async function* getDirectoryImageFiles(
  directoryHandle: any,
  currentPath = '',
): AsyncGenerator<{ file: File; relativePath: string }> {
  for await (const entry of directoryHandle.values()) {
    const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file.type.startsWith('image/')) {
        yield { file, relativePath };
      }
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

export function Products() {
  const { products, addProduct, removeProduct, budgets } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    materialType: 'PLA',
    description: '',
    collection: '',
    imageUrl: '',
    defaultWeightG: '',
    basePrice: '',
    category: '',
    tags: ''
  });

  const filteredProducts = products.filter((product) => {
    const normalizedSearch = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.materialType.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch) ||
      product.collection?.toLowerCase().includes(normalizedSearch) ||
      product.sourcePath?.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleFolderImport = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Seu navegador não suporta a API de Acesso ao Sistema de Arquivos. Use o Chrome ou Edge atualizado.');
        return;
      }

      setImporting(true);
      const directoryHandle = await (window as any).showDirectoryPicker();
      let importedCount = 0;

      for await (const { file, relativePath } of getDirectoryImageFiles(directoryHandle)) {
        const imageUrl = await readFileAsDataUrl(file);
        const pathSegments = relativePath.split('/');
        const collection = pathSegments.length > 1 ? pathSegments.slice(0, -1).join(' / ') : 'Importados';

        addProduct({
          name: file.name.split('.')[0].replace(/[-_]/g, ' '),
          materialType: 'PLA',
          description: `Importado da pasta local: ${relativePath}`,
          collection,
          sourcePath: relativePath,
          imageUrl,
          defaultWeightG: 50,
          basePrice: 0,
        });
        importedCount += 1;
      }

      if (importedCount === 0) {
        alert('Nenhuma imagem encontrada na pasta selecionada.');
        return;
      }

      alert(`${importedCount} produto(s) importado(s) com sucesso.`);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao importar pasta:', err);
        alert('Erro ao acessar a pasta.');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      ...formData,
      collection: formData.collection.trim() || undefined,
      defaultWeightG: Number(formData.defaultWeightG),
      basePrice: Number(formData.basePrice)
    });
    setShowForm(false);
    setFormData({
      name: '',
      materialType: 'PLA',
      description: '',
      collection: '',
      imageUrl: '',
      defaultWeightG: '',
      basePrice: ''
    });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    const linkedBudgets = budgets.filter((budget) => budget.productId === productId).length;
    if (linkedBudgets > 0) {
      alert(`O produto "${productName}" já está ligado a ${linkedBudgets} orçamento(s) e não pode ser removido agora.`);
      return;
    }

    if (!window.confirm(`Deseja excluir o produto "${productName}" do catálogo?`)) {
      return;
    }

    removeProduct(productId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h2>
          <p className="text-slate-500">Produtos recorrentes, catálogo visual e base rápida para orçamentos.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleFolderImport}
            disabled={importing}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Catálogo'}
          </button>
          <button 
            id="toggle-product-form"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-semibold"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Cancelar' : 'Adicionar Produto'}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, coleção, material ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>


      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <label className="text-sm font-semibold text-slate-500 uppercase flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" /> Imagem do Produto
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all overflow-hidden group",
                  formData.imageUrl ? "border-solid border-emerald-500" : ""
                )}
              >
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold">Alterar Foto</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs text-slate-500 font-medium">Clique para fazer upload</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG ou WEBP</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Ou cole uma URL</p>
                <input 
                  type="text" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" 
                  placeholder="https://exemplo.com/imagem.jpg" 
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome do Modelo/Produto</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Vaso Octogonal v2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Material Recomendado</label>
                <select value={formData.materialType} onChange={e => setFormData({...formData, materialType: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="PLA">PLA</option>
                  <option value="ABS">ABS</option>
                  <option value="PETG">PETG</option>
                  <option value="Resina">Resina</option>
                  <option value="SLA">SLA</option>
                  <option value="TPU">TPU</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Coleção / Categoria</label>
                <input
                  value={formData.collection}
                  onChange={e => setFormData({...formData, collection: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Vasos, Articulados, Geek"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Peso Estimado (g)</label>
                <input type="number" required value={formData.defaultWeightG} onChange={e => setFormData({...formData, defaultWeightG: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="45" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Preço Sugerido</label>
                <input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="75" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Descrição Técnica</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-24 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" placeholder="Detalhes sobre suporte, preenchimento, etc." />
              </div>
              <div className="col-span-full pt-4">
                <button type="submit" className="w-full px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                  Salvar Produto no Catálogo
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const linkedBudgets = budgets.filter((budget) => budget.productId === product.id).length;

          return (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 group-hover:text-emerald-100 transition-colors">
                    <Box className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-widest">
                    {product.materialType}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-2 bg-white/90 backdrop-blur-md text-rose-500 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all"
                    aria-label={`Excluir produto ${product.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 text-lg truncate pr-2">{product.name}</h4>
                  <div className="text-emerald-600 font-black whitespace-nowrap">
                    {formatCurrency(product.basePrice || 0)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed min-h-[32px]">
                  {product.description || 'Produto base para orçamentos rápidos.'}
                </p>
                <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {product.collection && (
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-500">
                      {product.collection}
                    </span>
                  )}
                  {product.sourcePath && (
                    <span className="px-2.5 py-1 bg-emerald-50 rounded-full text-emerald-600 max-w-full truncate">
                      {product.sourcePath}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Peso</p>
                      <p className="text-xs font-bold text-slate-700">{product.defaultWeightG}g</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Uso</p>
                      <p className="text-xs font-bold text-slate-700">{linkedBudgets} orç.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && !showForm && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100 text-slate-300">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">
              {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
            </h3>
            <p className="text-sm mt-1">
              {products.length === 0 ? 'Sua vitrine virtual aparecerá aqui.' : 'Tente outro termo de busca.'}
            </p>
            {products.length === 0 && (
              <button 
                onClick={() => setShowForm(true)}
                className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
              >
                Criar Primeiro Produto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
