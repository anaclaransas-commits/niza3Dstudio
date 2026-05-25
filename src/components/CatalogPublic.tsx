/**
 * Catálogo Público — Versão Premium 2026
 * Modal + Galeria + Favoritos + Relacionados
 */

import React, { useEffect, useMemo, useState } from 'react';
import { getCatalogPublicData } from '../lib/catalogApi';
import type { CatalogSettings, Product } from '../types';
import { X, Clock, Package, Eye, Heart, Share2 } from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────── */
function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* DEFAULT_SETTINGS, MATERIAL_BADGE, lighten, createWhatsappUrl... 
   (mantenha exatamente como estava no seu arquivo original) */

const DEFAULT_SETTINGS: CatalogSettings = { /* ... seu DEFAULT_SETTINGS completo ... */ };

const MATERIAL_BADGE: Record<string, string> = { /* ... seu MATERIAL_BADGE ... */ };

function lighten(hex: string, amount = 0.92) { /* ... sua função ... */ }

function createWhatsappUrl(phone?: string, productName?: string) {
  if (!phone) return undefined;
  const message = productName 
    ? `Olá! Tenho interesse no produto: *${productName}*` 
    : "Olá! Vi seu catálogo e gostaria de um orçamento.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/* ─── Modal Premium ───────────────────────────────────── */
function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  accent, 
  whatsapp,
  favorites,
  toggleFavorite 
}: { 
  product: Product | null; 
  isOpen: boolean; 
  onClose: () => void; 
  accent: string; 
  whatsapp: string;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}) {
  if (!product || !isOpen) return null;

  const isFavorited = favorites.includes(product.id);
  const waLink = createWhatsappUrl(whatsapp, product.name);

  // Galeria (suporta images[] ou imageUrl)
  const images = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : product.imageUrl ? [product.imageUrl] : [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const relatedProducts = [] as Product[]; // pode melhorar depois

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-black pr-8">{product.name}</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => toggleFavorite(product.id)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <Heart className={`w-6 h-6 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row overflow-auto flex-1">
          {/* Galeria */}
          <div className="lg:w-1/2 bg-slate-50 p-8 flex flex-col items-center">
            <div className="relative w-full max-w-md">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full rounded-2xl shadow-xl object-contain max-h-[460px]"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-6">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="lg:w-1/2 p-8 flex flex-col">
            {product.description && <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>}

            <div className="grid grid-cols-2 gap-y-6 mb-8">
              <div><p className="text-xs uppercase tracking-widest text-slate-400">Material</p><p className="font-bold">{product.materialType}</p></div>
              {product.defaultWeightG && <div><p className="text-xs uppercase tracking-widest text-slate-400">Peso aprox.</p><p className="font-bold">{product.defaultWeightG}g</p></div>}
              {product.avgPrintTimeHours && <div><p className="text-xs uppercase tracking-widest text-slate-400">Tempo médio</p><p className="font-bold">{product.avgPrintTimeHours}h</p></div>}
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Personalização</p>
              <div className="flex flex-wrap gap-2">
                {['Escala', 'Cor', 'Acabamento', 'Quantidade', 'Suporte'].map(t => (
                  <span key={t} className="px-4 py-2 bg-slate-100 rounded-2xl text-sm">{t}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="block w-full py-4 rounded-2xl font-bold text-lg text-center text-white hover:scale-[1.02] transition-all shadow-lg"
                style={{ backgroundColor: accent }}>
                Solicitar Orçamento Personalizado
              </a>

              <button 
                onClick={() => {
                  navigator.share?.({
                    title: product.name,
                    text: `Olha que legal! ${product.name}`,
                    url: window.location.href
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <Share2 className="w-5 h-5" /> Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────── */
function ProductCard({ 
  product, 
  accent, 
  whatsapp, 
  ctaLabel,
  onQuickView,
  isFavorited,
  toggleFavorite 
}: {
  product: Product;
  accent: string;
  whatsapp: string;
  ctaLabel: string;
  onQuickView: (p: Product) => void;
  isFavorited: boolean;
  toggleFavorite: (id: string) => void;
}) {
  const waLink = createWhatsappUrl(whatsapp, product.name);

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 flex flex-col cursor-pointer relative"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        )}

        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-lg" style={{ backgroundColor: MATERIAL_BADGE[product.materialType] ?? '#64748b' }}>
            {product.materialType}
          </span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-2xl hover:bg-white transition-all"
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-black text-base mb-2 line-clamp-2">{product.name}</h3>
        {product.description && <p className="text-xs text-slate-500 line-clamp-3 flex-1">{product.description}</p>}

        <div className="flex gap-4 text-xs text-slate-400 mt-4">
          {product.defaultWeightG && <span>{product.defaultWeightG}g</span>}
          {product.avgPrintTimeHours && <span>{product.avgPrintTimeHours}h</span>}
        </div>

        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="mt-auto block w-full py-3.5 rounded-2xl font-bold text-sm text-white text-center hover:brightness-105 transition-all"
          style={{ backgroundColor: accent }}
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}

/* ─── CatalogPublic Principal ───────────────────────────────────── */
export function CatalogPublic() {
  const fallbackSettings = readLS<CatalogSettings>('3d_catalog_settings', DEFAULT_SETTINGS);
  const fallbackProducts = readLS<Product[]>('3d_products', []).filter(p => p.isPublic !== false);

  const [settings, setSettings] = useState(fallbackSettings);
  const [publicProducts, setPublicProducts] = useState(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => readLS<string[]>('catalog_favorites', []));

  const { accentColor: accent, whatsapp } = settings;
  const ctaLabel = settings.primaryCtaLabel || 'Pedir orçamento';

  // Filtros
  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('recent');

  const collections = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Geral')))], [publicProducts]);
  const materials = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.materialType)))], [publicProducts]);

  const filtered = useMemo(() => {
    // ... mesma lógica de filtro que você já tinha
    let result = publicProducts.filter(p => {
      const matchesCollection = activeCollection === 'Todos' || (p.collection || 'Geral') === activeCollection;
      const matchesMaterial = activeMaterial === 'Todos' || p.materialType === activeMaterial;
      const matchesSearch = !search || [p.name, p.description, p.tags, p.collection].some(f => f?.toLowerCase().includes(search.toLowerCase()));
      return matchesCollection && matchesMaterial && matchesSearch;
    });

    // Ordenação
    if (sortBy === 'name') result.sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));
    else if (sortBy === 'material') result.sort((a,b) => a.materialType.localeCompare(b.materialType, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR'));
    // ... etc

    return result;
  }, [publicProducts, search, activeCollection, activeMaterial, sortBy]);

  // Carregar dados
  useEffect(() => {
    getCatalogPublicData()
      .then(data => {
        setSettings(data.catalogSettings);
        setPublicProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    writeLS('catalog_favorites', newFavorites);
  };

  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Seu HeroHeader, filtros, etc. podem ficar iguais ou eu melhoro depois */}

      <main id="produtos" className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              accent={accent}
              whatsapp={whatsapp || ''}
              ctaLabel={ctaLabel}
              onQuickView={openProduct}
              isFavorited={favorites.includes(p.id)}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accent={accent}
        whatsapp={whatsapp || ''}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}