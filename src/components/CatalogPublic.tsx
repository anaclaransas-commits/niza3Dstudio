import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Instagram,
  Mail,
  MessageCircle,
  Search,
  X,
  ZoomIn,
} from 'lucide-react';
import { getCatalogPublicData } from '../lib/catalogApi';
import {
  createWhatsappUrl,
  formatCurrencyBRL,
  getPrimaryCtaUrl,
  getProductImages,
  getSecondaryCtaUrl,
  lightenHex,
  MATERIAL_BADGE,
} from '../lib/catalogUtils';
import type { CatalogSettings, Product } from '../types';

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
  // Paleta no estilo do layout de referência (oliva + bege)
  primaryColor: '#2f2f1b',
  accentColor: '#aab27a',
  coverImageUrl: '',
  announcementText: 'Catálogo sob encomenda • personalização de cor, escala e acabamento • atendimento direto',
  heroDescription: 'A Niza3D Studio cria peças decorativas, utilitárias e presentes personalizados com visual limpo, produção cuidadosa e contato rápido para orçamento.',
  highlightOne: 'Decoração, organização e presentes',
  highlightTwo: 'Escala, cor e acabamento sob medida',
  highlightThree: 'Atendimento rápido pelo WhatsApp',
  catalogHeadline: 'Peças que saem do catálogo para o seu projeto',
  catalogSubheadline: 'Explore as coleções, escolha o modelo ideal e fale conosco para personalizar cada detalhe.',
  aboutTitle: 'Feito com atenção aos detalhes',
  aboutText: 'Cada peça é produzida sob demanda com foco em acabamento, proporção e apresentação.',
  contactHeadline: 'Vamos montar sua versão ideal',
  contactText: 'Se você já escolheu um modelo, fale conosco para ajustar medidas, cor, quantidade e prazo.',
  primaryCtaLabel: 'Pedir orçamento',
  primaryCtaUrl: '',
  secondaryCtaLabel: 'Ver Instagram',
  secondaryCtaUrl: '',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: 'Produção sob demanda em impressão 3D.',
};

/* ─── Galeria de imagens ─────────────────────────────── */
function ImageGallery({ images, alt, accent }: { images: string[]; alt: string; accent: string }) {
  const [index, setIndex] = useState(0);
  const safeIndex = images.length > 0 ? index % images.length : 0;

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: lightenHex(accent) }}
      >
        <span className="text-sm font-bold text-slate-400">Sem imagem</span>
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={images[safeIndex]}
          alt={`${alt} — foto ${safeIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white">
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === safeIndex ? 'border-slate-800 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Modal do produto ─────────────────────────────────── */
function ProductModal({
  product,
  isOpen,
  onClose,
  settings,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  settings: CatalogSettings;
}) {
  const [quoteNote, setQuoteNote] = useState('');

  useEffect(() => {
    if (isOpen) setQuoteNote('');
  }, [isOpen, product?.id]);

  if (!product || !isOpen) return null;

  const images = getProductImages(product);
  const accent = settings.accentColor;
  const ctaLabel = settings.primaryCtaLabel || 'Solicitar orçamento';
  const waLink = createWhatsappUrl(settings.whatsapp, product.name, quoteNote);
  const tags = product.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="product-modal-title" className="text-xl font-black text-slate-900 sm:text-2xl">
            {product.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-3 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(95vh-4rem)] overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            <div className="bg-slate-50 p-6 lg:w-1/2">
              <ImageGallery images={images} alt={product.name} accent={accent} />
            </div>

            <div className="flex flex-col p-6 lg:w-1/2">
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                  style={{ backgroundColor: MATERIAL_BADGE[product.materialType] ?? '#64748b' }}
                >
                  {product.materialType}
                </span>
                {product.collection && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600">
                    {product.collection}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mb-6 leading-relaxed text-slate-600">{product.description}</p>
              )}

              {tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${accent}22`, color: accent }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
                {product.defaultWeightG != null && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Peso estimado</p>
                    <p className="font-bold text-slate-800">{product.defaultWeightG}g</p>
                  </div>
                )}
                {product.avgPrintTimeHours != null && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tempo de impressão</p>
                    <p className="font-bold text-slate-800">{product.avgPrintTimeHours}h</p>
                  </div>
                )}
              </div>

              <div className="mb-4 space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Detalhes para o orçamento (opcional)
                </label>
                <textarea
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  rows={3}
                  placeholder="Ex: cor preta, 15cm de altura, quantidade 2..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-center text-lg font-bold text-white transition-all hover:scale-[1.02] hover:opacity-95"
                  style={{ backgroundColor: accent }}
                >
                  <MessageCircle className="h-5 w-5" />
                  {ctaLabel}
                </a>
              ) : (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
                  Configure o WhatsApp nas configurações do catálogo para receber orçamentos.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Card do produto ──────────────────────────────────── */
function ProductCard({
  product,
  accent,
  primaryColor,
  whatsapp,
  email,
  ctaLabel,
  onQuickView,
}: {
  product: Product;
  accent: string;
  primaryColor: string;
  whatsapp?: string;
  email?: string;
  ctaLabel: string;
  onQuickView: (product: Product) => void;
}) {
  const images = getProductImages(product);
  const cover = images[0];
  const extraCount = images.length - 1;
  const badgeColor = MATERIAL_BADGE[product.materialType] ?? '#64748b';
  const waLink = createWhatsappUrl(whatsapp, product.name);
  const mailtoLink = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Orçamento — ${product.name}`)}`
    : undefined;
  const budgetLink = waLink ?? mailtoLink;
  const tags = product.tags?.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 2) ?? [];

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ border: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div className="relative aspect-square overflow-hidden" onClick={() => onQuickView(product)} role="button" tabIndex={0}>
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: lightenHex(accent) }}
          >
            <span className="text-xs font-bold text-slate-400">Sem foto</span>
          </div>
        )}

        {extraCount > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <ZoomIn className="h-3 w-3" /> +{extraCount}
          </span>
        )}

        <div className="absolute left-3 top-3">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
            style={{ backgroundColor: badgeColor }}
          >
            {product.materialType}
          </span>
        </div>

        {product.collection && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {product.collection}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className="mb-2 text-base font-black leading-tight text-slate-800"
          onClick={() => onQuickView(product)}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">{product.description}</p>
        )}

        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {product.defaultWeightG != null && <span>{product.defaultWeightG}g</span>}
            {product.avgPrintTimeHours != null && <span>~{product.avgPrintTimeHours}h</span>}
          </div>
          {typeof product.basePrice === 'number' && product.basePrice > 0 && (
            <span className="text-sm font-black text-slate-900">{formatCurrencyBRL(product.basePrice)}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all duration-200"
            style={{ border: '1px solid rgba(0,0,0,0.10)', color: '#2a2a18', backgroundColor: 'rgba(255,255,255,0.7)' }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Ver detalhes
          </button>
          {budgetLink ? (
            <a
              href={budgetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ backgroundColor: accent, color: primaryColor }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {ctaLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                alert('Configure WhatsApp ou e-mail nas configurações do catálogo para receber orçamentos.');
              }}
              className="flex-1 cursor-not-allowed rounded-2xl py-2.5 text-xs font-bold text-white/70 transition-all duration-200"
              style={{ backgroundColor: primaryColor, opacity: 0.75 }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Página pública ───────────────────────────────────── */
export function CatalogPublic() {
  const fallbackSettings = readLS<CatalogSettings>('3d_catalog_settings', DEFAULT_SETTINGS);
  const fallbackProducts = readLS<Product[]>('3d_products', []).filter((p) => p.isPublic !== false);

  const [settings, setSettings] = useState<CatalogSettings>(fallbackSettings);
  const [publicProducts, setPublicProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('name');

  const {
    primaryColor,
    accentColor: accent,
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
    secondaryCtaLabel,
    whatsapp,
    instagram,
    email,
    footerNote,
  } = settings;

  const highlights = [highlightOne, highlightTwo, highlightThree].filter(Boolean) as string[];
  const primaryCtaUrl = getPrimaryCtaUrl(settings);
  const secondaryCtaUrl = getSecondaryCtaUrl(settings);
  const ctaLabel = primaryCtaLabel || 'Solicitar orçamento';

  const collections = useMemo(
    () => ['Todos', ...Array.from(new Set(publicProducts.map((p) => p.collection || 'Geral')))],
    [publicProducts],
  );

  const materials = useMemo(
    () => ['Todos', ...Array.from(new Set(publicProducts.map((p) => p.materialType)))],
    [publicProducts],
  );

  const categorySummaries = useMemo(
    () =>
      Array.from(
        publicProducts.reduce<Map<string, number>>((map, product) => {
          const key = product.collection || 'Geral';
          map.set(key, (map.get(key) ?? 0) + 1);
          return map;
        }, new Map()),
      ).map(([name, count]) => ({ name, count })),
    [publicProducts],
  );

  const featuredProducts = useMemo(() => {
    const byCollection = publicProducts.filter(
      (p) => p.collection?.toLowerCase().includes('destaque') || p.collection?.toLowerCase().includes('featured'),
    );
    if (byCollection.length > 0) return byCollection.slice(0, 8);
    return publicProducts.slice(0, 8);
  }, [publicProducts]);

  const filtered = useMemo(() => {
    const visible = publicProducts.filter((product) => {
      const collection = product.collection || 'Geral';
      const matchesCollection = activeCollection === 'Todos' || collection === activeCollection;
      const matchesMaterial = activeMaterial === 'Todos' || product.materialType === activeMaterial;
      const haystack = [product.name, product.description, product.tags, product.collection, product.materialType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesCollection && matchesMaterial && matchesSearch;
    });

    const sorted = [...visible];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'material':
          return a.materialType.localeCompare(b.materialType, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR');
        case 'collection':
          return (a.collection || 'Geral').localeCompare(b.collection || 'Geral', 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR');
        default:
          return a.name.localeCompare(b.name, 'pt-BR');
      }
    });
    return sorted;
  }, [publicProducts, activeCollection, activeMaterial, search, sortBy]);

  useEffect(() => {
    let isMounted = true;

    const loadPublishedCatalog = async () => {
      try {
        const published = await getCatalogPublicData();
        if (!isMounted) return;
        setSettings(published.catalogSettings);
        setPublicProducts(published.products);
      } catch (error) {
        console.warn('Falha ao carregar catálogo publicado.', error);
        if (!isMounted) return;
        setSettings(fallbackSettings);
        setPublicProducts(fallbackProducts);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPublishedCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.title = `${businessName} — Catálogo`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', tagline || `Catálogo de produtos ${businessName}`);
    }
  }, [businessName, tagline]);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Deep-link: /catalogo?produto=<id>
  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('produto');
    if (!id) return;
    const found = publicProducts.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
      setIsModalOpen(true);
    }
  }, [isLoading, publicProducts]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (isModalOpen && selectedProduct?.id) {
      url.searchParams.set('produto', selectedProduct.id);
      window.history.replaceState({}, '', url.toString());
      return;
    }
    if (url.searchParams.has('produto')) {
      url.searchParams.delete('produto');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isModalOpen, selectedProduct?.id]);

  const palette = useMemo(() => {
    // Tons quentes/bege para aproximar do mock (sem depender de Tailwind config)
    const pageBg = '#f2efe6';
    const sectionBg = '#f7f3ea';
    const cardBg = '#fbf8f1';
    const border = '#e7e0cf';
    const textMuted = '#6b6a55';
    const text = '#1f1f14';
    const pill = 'rgba(255,255,255,0.10)';
    const heroOverlay = `linear-gradient(120deg, ${primaryColor}f2 0%, ${primaryColor}d6 42%, ${primaryColor}f0 100%)`;
    const heroBg = coverImageUrl
      ? `${heroOverlay}, url(${coverImageUrl}) center/cover`
      : primaryColor;
    const ctaPrimaryBg = 'rgba(245, 240, 220, 0.95)';
    const ctaPrimaryText = primaryColor;
    const ctaOutline = 'rgba(245, 240, 220, 0.25)';

    return {
      pageBg,
      sectionBg,
      cardBg,
      border,
      textMuted,
      text,
      pill,
      heroBg,
      ctaPrimaryBg,
      ctaPrimaryText,
      ctaOutline,
    };
  }, [primaryColor, coverImageUrl]);

  return (
    <div
      className="min-h-screen font-sans"
      style={
        {
          '--accent': accent,
          '--primary': primaryColor,
          backgroundColor: palette.pageBg,
        } as React.CSSProperties
      }
    >
      {announcementText && (
        <div className="border-b border-white/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/75" style={{ backgroundColor: primaryColor }}>
          {announcementText}
        </div>
      )}

      {/* Hero */}
      <header
        className="px-6 py-12 text-white sm:px-8 sm:py-14"
        style={{
          background: palette.heroBg,
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:items-start">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="h-20 w-auto rounded-2xl bg-white/10 object-contain p-2" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black text-white/70">
              3D
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80" style={{ backgroundColor: palette.pill }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              Impressão 3D personalizada
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {businessName}
            </h1>
            {tagline && <p className="mt-2 text-sm text-white/80 sm:text-base">{tagline}</p>}
            {heroDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 md:mx-0">{heroDescription}</p>
            )}
            {highlights.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/85"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              {primaryCtaUrl && (
                <a
                  href={primaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-5 py-2.5 text-xs font-black transition hover:opacity-95"
                  style={{ backgroundColor: palette.ctaPrimaryBg, color: palette.ctaPrimaryText }}
                >
                  {ctaLabel}
                </a>
              )}
              {secondaryCtaUrl && (
                <a
                  href={secondaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
                  style={{ border: `1px solid ${palette.ctaOutline}` }}
                >
                  {secondaryCtaLabel || 'Instagram'}
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {whatsapp && createWhatsappUrl(whatsapp) && (
                <a
                  href={createWhatsappUrl(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
              {instagram && secondaryCtaUrl?.includes('instagram') && (
                <a
                  href={secondaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
                >
                  <Instagram className="h-3.5 w-3.5" /> {instagram}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
                >
                  <Mail className="h-3.5 w-3.5" /> {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Faixa de benefícios */}
      <section className="px-4 py-6 sm:px-6" style={{ backgroundColor: palette.sectionBg, borderBottom: `1px solid ${palette.border}` }}>
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4" style={{ color: palette.text }}>
          <div className="flex flex-1 min-w-[220px] items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black shadow-sm" style={{ backgroundColor: palette.cardBg, color: accent, border: `1px solid ${palette.border}` }}>
              3D
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Impressão 3D sob medida</p>
              <p className="text-xs" style={{ color: palette.textMuted }}>Ajuste de escala, cor e acabamento para cada projeto.</p>
            </div>
          </div>
          <div className="flex flex-1 min-w-[220px] items-center gap-3">
            <div className="h-9 w-9 rounded-2xl" style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Acabamento profissional</p>
              <p className="text-xs" style={{ color: palette.textMuted }}>Peças pensadas para decoração, organização e presentes.</p>
            </div>
          </div>
          <div className="flex flex-1 min-w-[220px] items-center gap-3">
            <div className="h-9 w-9 rounded-2xl" style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Atendimento especializado</p>
              <p className="text-xs" style={{ color: palette.textMuted }}>Orçamentos rápidos direto pelo WhatsApp.</p>
            </div>
          </div>
          <div className="flex flex-1 min-w-[220px] items-center gap-3">
            <div className="h-9 w-9 rounded-2xl" style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Pagamento seguro</p>
              <p className="text-xs" style={{ color: palette.textMuted }}>Produção sob demanda com embalagem cuidadosa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros + visão geral */}
      <section className="px-4 py-8 sm:px-6" style={{ backgroundColor: palette.pageBg, borderBottom: `1px solid ${palette.border}` }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-black sm:text-2xl" style={{ color: palette.text }}>
            {catalogHeadline || 'Nossos produtos'}
          </h2>
          {catalogSubheadline && <p className="mt-1 text-sm" style={{ color: palette.textMuted }}>{catalogSubheadline}</p>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar produto, tag ou coleção..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2"
                style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, boxShadow: `0 0 0 0 transparent`, outlineColor: accent }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
              style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, color: palette.text }}
              aria-label="Ordenar produtos"
            >
              <option value="name">Nome A–Z</option>
              <option value="collection">Coleção</option>
              <option value="material">Material</option>
            </select>
          </div>

          {collections.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {collections.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setActiveCollection(col)}
                  className="rounded-full border px-4 py-1.5 text-xs font-bold transition-all"
                  style={
                    activeCollection === col
                      ? { backgroundColor: primaryColor, color: '#fff', borderColor: primaryColor }
                      : { backgroundColor: palette.sectionBg, color: palette.textMuted, borderColor: palette.border }
                  }
                >
                  {col}
                </button>
              ))}
            </div>
          )}

          {materials.length > 2 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {materials.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setActiveMaterial(mat)}
                  className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all"
                  style={
                    activeMaterial === mat
                      ? { backgroundColor: accent, color: palette.text, borderColor: accent }
                      : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                  }
                >
                  {mat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categorias */}
      {categorySummaries.length > 0 && (
        <section className="px-4 py-10 sm:px-6" style={{ backgroundColor: palette.pageBg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>Categorias</h3>
              <span className="text-xs" style={{ color: palette.textMuted }}>
                {publicProducts.length} modelo{publicProducts.length === 1 ? '' : 's'} disponível(eis)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {categorySummaries.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setActiveCollection(category.name);
                    setActiveMaterial('Todos');
                  }}
                  className={`flex flex-col items-start rounded-2xl px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    activeCollection === category.name ? 'border-slate-900' : 'border-slate-100'
                  }`}
                  style={{ backgroundColor: palette.cardBg, borderColor: activeCollection === category.name ? primaryColor : palette.border }}
                >
                  <span className="text-xs font-bold" style={{ color: palette.text }}>{category.name}</span>
                  <span className="mt-1 text-[11px]" style={{ color: palette.textMuted }}>
                    {category.count} produto{category.count === 1 ? '' : 's'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destaques + grid */}
      <main id="produtos" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!isLoading && featuredProducts.length > 0 && (
          <section className="mb-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Produtos em destaque</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Seleção de modelos para começar a explorar o catálogo.
                </p>
              </div>
              {publicProducts.length > 8 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCollection('Todos');
                    setActiveMaterial('Todos');
                    setSearch('');
                  }}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ver todos os produtos
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={`featured-${p.id}`}
                  product={p}
                  accent={accent}
                  primaryColor={primaryColor}
                  whatsapp={whatsapp}
                  email={email}
                  ctaLabel={ctaLabel}
                  onQuickView={openProduct}
                />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="aspect-square animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                primaryColor={primaryColor}
                whatsapp={whatsapp}
                email={email}
                ctaLabel={ctaLabel}
                onQuickView={openProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-lg font-bold text-slate-500">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm">Tente outro filtro ou termo de busca</p>
            {(search || activeCollection !== 'Todos' || activeMaterial !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCollection('Todos');
                  setActiveMaterial('Todos');
                }}
                className="mt-4 rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* Sobre + contato */}
      {(aboutTitle || aboutText || contactHeadline || contactText) && (
        <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
            {(aboutTitle || aboutText) && (
              <div>
                {aboutTitle && <h3 className="text-xl font-black text-slate-900">{aboutTitle}</h3>}
                {aboutText && <p className="mt-3 leading-relaxed text-slate-600">{aboutText}</p>}
              </div>
            )}
            {(contactHeadline || contactText) && (
              <div className="rounded-3xl p-6 text-white" style={{ backgroundColor: primaryColor }}>
                {contactHeadline && <h3 className="text-lg font-black">{contactHeadline}</h3>}
                {contactText && <p className="mt-2 text-sm leading-relaxed text-white/85">{contactText}</p>}
                {primaryCtaUrl && (
                  <a
                    href={primaryCtaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-slate-900"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {ctaLabel}
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Rodapé */}
      <footer className="px-6 py-8 text-center text-white" style={{ backgroundColor: primaryColor }}>
        <p className="text-sm font-bold">{businessName}</p>
        {footerNote && <p className="mt-1 text-xs text-white/70">{footerNote}</p>}
        <p className="mt-3 text-[10px] uppercase tracking-widest text-white/40">Catálogo digital</p>
      </footer>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
      />
    </div>
  );
}
