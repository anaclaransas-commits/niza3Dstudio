import React, { useEffect, useMemo, useState } from 'react';
import { getCatalogPublicData } from '../lib/catalogApi';
import type { CatalogSettings, Product } from '../types';
import { X } from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────── */
function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_SETTINGS: CatalogSettings = {
  businessName: 'Niza3D Studio',
  tagline: 'Peças impressas em 3D com acabamento premium e produção sob medida.',
  primaryColor: '#22271b',
  accentColor: '#8b9964',
  coverImageUrl: '',
  announcementText: 'Catálogo sob encomenda • personalização de cor, escala e acabamento • atendimento direto',
  heroDescription: 'A Niza3D Studio cria peças decorativas, utilitárias e presentes personalizados com visual limpo, produção cuidadosa e contato rápido para orçamento.',
  highlightOne: 'Decoração, organização e presentes',
  highlightTwo: 'Escala, cor e acabamento sob medida',
  highlightThree: 'Atendimento rápido pelo WhatsApp',
  catalogHeadline: 'Peças que saem do catálogo para o seu projeto',
  catalogSubheadline: 'Explore as coleções, escolha o modelo ideal e fale com a Niza3D Studio para personalizar cada detalhe.',
  aboutTitle: 'Feito com atenção aos detalhes',
  aboutText: 'Na Niza3D Studio, cada peça é produzida sob demanda com foco em acabamento, proporção e apresentação. Trabalhamos com modelos decorativos, organizadores e itens personalizados para presente ou uso diário.',
  contactHeadline: 'Vamos montar sua versão ideal',
  contactText: 'Se você já escolheu um modelo, fale com a gente para ajustar medidas, cor, quantidade e prazo de produção.',
  primaryCtaLabel: 'Pedir orçamento',
  primaryCtaUrl: '',
  secondaryCtaLabel: 'Ver Instagram',
  secondaryCtaUrl: '',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: 'Produção sob demanda em impressão 3D.',
};

const MATERIAL_BADGE: Record<string, string> = {
  PLA:    '#22c55e',
  ABS:    '#f97316',
  PETG:   '#3b82f6',
  TPU:    '#a855f7',
  Resina: '#ec4899',
  SLA:    '#ec4899',
};

function lighten(hex: string, amount = 0.92) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function createWhatsappUrl(phone?: string, productName?: string) {
  if (!phone) return undefined;
  const message = productName 
    ? `Olá! Tenho interesse no produto: *${productName}*` 
    : "Olá! Vi seu catálogo e gostaria de conversar.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/* ─── Modal ───────────────────────────────────── */
function ProductModal({ product, isOpen, onClose, accent, whatsapp }: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  accent: string;
  whatsapp: string;
}) {
  if (!product || !isOpen) return null;

  const waLink = createWhatsappUrl(whatsapp, product.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-black">{product.name}</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 bg-slate-50 p-8 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[500px] w-auto rounded-2xl shadow-xl object-contain"
            />
          </div>

          <div className="lg:w-1/2 p-8 flex flex-col">
            {product.description && (
              <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Material</p>
                <p className="font-bold">{product.materialType}</p>
              </div>
              {product.defaultWeightG && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Peso</p>
                  <p className="font-bold">{product.defaultWeightG}g</p>
                </div>
              )}
              {product.avgPrintTimeHours && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Tempo</p>
                  <p className="font-bold">{product.avgPrintTimeHours}h</p>
                </div>
              )}
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto block w-full py-4 rounded-2xl font-bold text-lg text-center text-white hover:scale-[1.02] transition-all"
              style={{ backgroundColor: accent }}
            >
              Solicitar Orçamento Personalizado
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────── */
function ProductCard({ product, accent, whatsapp, ctaLabel, onQuickView }: {
  product: Product;
  accent: string;
  whatsapp: string;
  ctaLabel: string;
  onQuickView: (product: Product) => void;
}) {
  const badgeColor = MATERIAL_BADGE[product.materialType] ?? '#64748b';
  const waLink = createWhatsappUrl(whatsapp, product.name);

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 flex flex-col cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: lighten(accent) }}>
            <svg className="w-16 h-16 opacity-20" style={{ color: accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: badgeColor }}>
            {product.materialType}
          </span>
        </div>

        {product.collection && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm uppercase tracking-wider">
              {product.collection}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-slate-800 text-base leading-tight mb-2">{product.name}</h3>

        {product.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{product.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          {product.defaultWeightG && <span>{product.defaultWeightG}g</span>}
          {product.avgPrintTimeHours && <span>{product.avgPrintTimeHours}h</span>}
        </div>

        {waLink ? (
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-lg mt-auto"
            style={{ backgroundColor: accent }}
          >
            {ctaLabel}
          </a>
        ) : (
          <div className="w-full py-3 rounded-2xl font-bold text-sm text-white text-center mt-auto"
            style={{ backgroundColor: accent }}>
            {ctaLabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CatalogPublic ───────────────────────────────────── */
export function CatalogPublic() {
  const fallbackSettings = readLS<CatalogSettings>('3d_catalog_settings', DEFAULT_SETTINGS);
  const fallbackProducts = readLS<Product[]>('3d_products', []).filter((product) => product.isPublic !== false);

  const [settings, setSettings] = useState<CatalogSettings>(fallbackSettings);
  const [publicProducts, setPublicProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { accentColor: accent, whatsapp } = settings;

  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('recent');

  const collections = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Geral')))], [publicProducts]);
  const materials = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.materialType)))], [publicProducts]);
  const ctaLabel = settings.primaryCtaLabel || 'Solicitar orçamento';

  const filtered = useMemo(() => {
    const visibleProducts = publicProducts.filter((product) => {
      const collection = product.collection || 'Geral';
      const matchesCollection = activeCollection === 'Todos' || collection === activeCollection;
      const matchesMaterial = activeMaterial === 'Todos' || product.materialType === activeMaterial;
      const matchesSearch = !search || [product.name, product.description, product.tags, product.collection]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(search.toLowerCase()));

      return matchesCollection && matchesMaterial && matchesSearch;
    });

    const sortedProducts = [...visibleProducts];
    sortedProducts.sort((left, right) => {
      switch (sortBy) {
        case 'name':
          return left.name.localeCompare(right.name, 'pt-BR');
        case 'material':
          return left.materialType.localeCompare(right.materialType, 'pt-BR') || left.name.localeCompare(right.name, 'pt-BR');
        case 'collection':
          return (left.collection || 'Geral').localeCompare(right.collection || 'Geral', 'pt-BR') || left.name.localeCompare(right.name, 'pt-BR');
        default:
          return 0;
      }
    });

    return sortedProducts;
  }, [publicProducts, activeCollection, activeMaterial, search, sortBy]);

  useEffect(() => {
    let isMounted = true;

    const loadPublishedCatalog = async () => {
      try {
        const publishedCatalog = await getCatalogPublicData();
        if (!isMounted) return;

        setSettings(publishedCatalog.catalogSettings);
        setPublicProducts(publishedCatalog.products);
        setDataSource('api');
      } catch (error) {
        console.warn('Falha ao carregar catálogo publicado.', error);
        if (!isMounted) return;
        setSettings(fallbackSettings);
        setPublicProducts(fallbackProducts);
        setDataSource('local');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPublishedCatalog();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    document.title = `${settings.businessName} — Catálogo`;
  }, [settings.businessName]);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {settings.announcementText && (
        <div className="border-b border-white/10 bg-slate-950 px-4 py-3 text-center text-xs font-bold tracking-[0.18em] text-white/75 uppercase">
          {settings.announcementText}
        </div>
      )}

      {/* HeroHeader, filtros, etc. - mantenha o resto do seu código original aqui */}

      <main id="produtos" className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="aspect-square animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                accent={accent} 
                whatsapp={whatsapp || ''} 
                ctaLabel={ctaLabel}
                onQuickView={openProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <p className="font-bold text-lg text-slate-400">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente outro filtro ou termo de busca</p>
          </div>
        )}
      </main>

      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        accent={accent} 
        whatsapp={whatsapp || ''} 
      />
    </div>
  );
}