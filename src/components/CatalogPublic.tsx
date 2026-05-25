/**
 * Catálogo público — página para o cliente.
 * Prioriza dados publicados pela API e usa localStorage apenas como fallback local.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { getCatalogPublicData } from '../lib/catalogApi';
import type { CatalogSettings, Product } from '../types';

/* ─── helpers ────────────────────────────────────────── */
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

type CatalogAction = {
  label: string;
  url: string;
};

function createWhatsappUrl(phone?: string, productName?: string) {
  if (!phone) return undefined;
  if (!productName) {
    return `https://wa.me/${phone}`;
  }

  const message = encodeURIComponent(`Olá! Tenho interesse no produto: *${productName}*`);
  return `https://wa.me/${phone}?text=${message}`;
}

function createInstagramUrl(handle?: string) {
  if (!handle) return undefined;
  return `https://instagram.com/${handle.replace('@', '')}`;
}

function buildCatalogAction(label: string | undefined, url: string | undefined) {
  if (!label || !url) {
    return undefined;
  }

  return { label, url } satisfies CatalogAction;
}

function resolvePrimaryAction(settings: CatalogSettings) {
  return buildCatalogAction(
    settings.primaryCtaLabel || 'Solicitar orçamento',
    settings.primaryCtaUrl || createWhatsappUrl(settings.whatsapp) || (settings.email ? `mailto:${settings.email}` : undefined),
  );
}

function resolveSecondaryAction(settings: CatalogSettings) {
  return buildCatalogAction(
    settings.secondaryCtaLabel || 'Ver Instagram',
    settings.secondaryCtaUrl || createInstagramUrl(settings.instagram) || (settings.email ? `mailto:${settings.email}` : undefined),
  );
}

/* ─── WhatsApp floating button ───────────────────────── */
function WAButton({ phone }: { phone: string }) {
  if (!phone) return null;
  return (
    <a
  href={`https://wa.me/${phone}`}
  target="_blank"
  rel="noopener noreferrer"
  className="
    fixed bottom-6 right-6 z-50
    flex items-center gap-3
    px-6 py-4
    rounded-full
    bg-[#7d8a52]
    hover:bg-[#8f9b61]
    text-white
    font-semibold
    shadow-[0_10px_40px_rgba(0,0,0,0.35)]
    backdrop-blur-md
    border border-[#b9c48a33]
    transition-all duration-300
    hover:scale-105
    active:scale-95
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.52 3.48A11.82 11.82 0 0012.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.14 1.59 5.94L0 24l6.38-1.67a11.82 11.82 0 005.66 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.39-8.43zM12.05 21.7h-.01a9.8 9.8 0 01-4.99-1.37l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.77 9.77 0 01-1.5-5.18c0-5.42 4.41-9.83 9.84-9.83 2.63 0 5.1 1.02 6.95 2.88a9.76 9.76 0 012.88 6.95c0 5.42-4.41 9.84-9.79 9.84zm5.39-7.36c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.08-.13-.27-.2-.57-.35z" />
  </svg>

  <span>Fale no WhatsApp</span>
</a>
  );
}

/* ─── Product card ───────────────────────────────────── */
function ProductCard({ product, accent, whatsapp, ctaLabel }: {
  product: Product;
  accent: string;
  whatsapp: string;
  ctaLabel: string;
}) {
  const badgeColor = MATERIAL_BADGE[product.materialType] ?? '#64748b';
  const waLink = createWhatsappUrl(whatsapp, product.name);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 flex flex-col">
      {/* Image */}
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

        {/* Material badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: badgeColor }}>
            {product.materialType}
          </span>
        </div>

        {/* Collection badge */}
        {product.collection && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm uppercase tracking-wider">
              {product.collection}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-slate-800 text-base leading-tight mb-2">{product.name}</h3>

        {product.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{product.description}</p>
        )}

        {/* Tags */}
        {product.tags && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.split(',').slice(0, 4).map(tag => tag.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{ backgroundColor: lighten(accent, 0.88), color: accent }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          {product.defaultWeightG && (
            <span className="flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              {product.defaultWeightG}g
            </span>
          )}
          {product.avgPrintTimeHours && (
            <span className="flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {product.avgPrintTimeHours}h
            </span>
          )}
        </div>

        {/* CTA */}
        {waLink ? (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-lg mt-auto"
            style={{ backgroundColor: accent }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.874L.057 23.996l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.36-.213-3.733.979 1-3.638-.234-.374A9.818 9.818 0 1112 21.818z"/>
            </svg>
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

/* ─── Hero header ────────────────────────────────────── */
function HeroHeader({
  s,
  productCount,
  collectionCount,
  materialCount,
  primaryAction,
  secondaryAction,
}: {
  s: CatalogSettings;
  productCount: number;
  collectionCount: number;
  materialCount: number;
  primaryAction?: CatalogAction;
  secondaryAction?: CatalogAction;
}) {
  const {
    primaryColor: primary,
    accentColor: accent,
    businessName,
    tagline,
    logoUrl,
    coverImageUrl,
    heroDescription,
    highlightOne,
    highlightTwo,
    highlightThree,
    whatsapp,
    instagram,
    email,
  } = s;
  const highlights = [highlightOne, highlightTwo, highlightThree].filter(Boolean);
  const stats = [
    { label: 'Produtos', value: productCount },
    { label: 'Coleções', value: Math.max(collectionCount, 1) },
    { label: 'Materiais', value: Math.max(materialCount, 1) },
  ];

  return (
    <header
      className="relative overflow-hidden"
      style={{
        backgroundImage: coverImageUrl
          ? `linear-gradient(120deg, ${primary}f2, ${primary}d9 55%, ${accent}bf), url(${coverImageUrl})`
          : `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
        <div className="max-w-3xl text-white">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${businessName} logo`}
              className="mb-8 h-20 w-auto rounded-2xl bg-white/10 p-2 backdrop-blur-sm"
            />
          )}

          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white/80 backdrop-blur-sm">
            Catálogo oficial
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
            {businessName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium text-white/80 md:text-xl">
            {tagline}
          </p>
          {heroDescription && (
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              {heroDescription}
            </p>
          )}

          {highlights.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold text-white/88 backdrop-blur-sm"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {primaryAction && (
              <a
                href={primaryAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black text-slate-950 shadow-2xl transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#f8f6ef' }}
              >
                {primaryAction.label}
              </a>
            )}
            <a
              href="#produtos"
              className="inline-flex items-center justify-center rounded-2xl border border-white/16 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/16"
            >
              Ver catálogo
            </a>
            {secondaryAction && (
              <a
                href={secondaryAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/16 px-6 py-3 text-sm font-bold text-white/88 transition-colors hover:bg-white/10"
              >
                {secondaryAction.label}
              </a>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold text-white/75">
            {whatsapp && (
              <a
                href={createWhatsappUrl(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/16"
              >
                WhatsApp
              </a>
            )}
            {instagram && (
              <a
                href={createInstagramUrl(instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/16"
              >
                {instagram}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/16"
              >
                {email}
              </a>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-6 rounded-[36px] bg-white/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-slate-950/45 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/8">
              {coverImageUrl || logoUrl ? (
                <img
                  src={coverImageUrl || logoUrl}
                  alt={businessName}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] text-5xl font-black text-white/55">
                  3D
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
/* ─── Main export ────────────────────────────────────── */
export function CatalogPublic() {
  const fallbackSettings = readLS<CatalogSettings>('3d_catalog_settings', DEFAULT_SETTINGS);
  const fallbackProducts = readLS<Product[]>('3d_products', []).filter((product) => product.isPublic !== false);
  const [settings, setSettings] = useState<CatalogSettings>(fallbackSettings);
  const [publicProducts, setPublicProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');

  const { primaryColor: primary, accentColor: accent, whatsapp } = settings;

  /* filters */
  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('recent');

  const collections = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Geral')))], [publicProducts]);
  const materials = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.materialType)))], [publicProducts]);
  const primaryAction = useMemo(() => resolvePrimaryAction(settings), [settings]);
  const secondaryAction = useMemo(() => resolveSecondaryAction(settings), [settings]);
  const ctaLabel = settings.primaryCtaLabel || 'Solicitar orçamento';
  const activeFilters = search || activeCollection !== 'Todos' || activeMaterial !== 'Todos';

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
  }, [publicProducts, activeCollection, activeMaterial, search, sortBy, settings.primaryCtaLabel]);

  useEffect(() => {
    let isMounted = true;

    const loadPublishedCatalog = async () => {
      try {
        const publishedCatalog = await getCatalogPublicData();

        if (!isMounted) {
          return;
        }

        setSettings(publishedCatalog.catalogSettings);
        setPublicProducts(publishedCatalog.products);
        setDataSource('api');
      } catch (error) {
        console.warn('Falha ao carregar catálogo publicado.', error);

        if (!isMounted) {
          return;
        }

        setSettings(fallbackSettings);
        setPublicProducts(fallbackProducts);
        setDataSource('local');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPublishedCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  /* update page title */
  useEffect(() => {
    document.title = `${settings.businessName} — Catálogo`;
  }, [settings.businessName]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {settings.announcementText && (
        <div className="border-b border-white/10 bg-slate-950 px-4 py-3 text-center text-xs font-bold tracking-[0.18em] text-white/75 uppercase">
          {settings.announcementText}
        </div>
      )}

      {/* ── Hero ── */}
      <HeroHeader
        s={settings}
        productCount={publicProducts.length}
        collectionCount={Math.max(collections.length - 1, 0)}
        materialCount={Math.max(materials.length - 1, 0)}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />

      {!isLoading && dataSource !== 'api' && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {publicProducts.length > 0
              ? 'Não foi possível carregar o catálogo publicado agora. Este navegador está exibindo apenas uma cópia local.'
              : 'Não foi possível carregar o catálogo publicado agora. Este navegador não possui uma cópia local. Verifique as variáveis VITE_SUPABASE_* do deploy ou a API /api do catálogo.'}
          </div>
        </div>
      )}

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Buscar produto..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 transition-all"
              style={{ '--tw-ring-color': accent + '40' } as any} />
          </div>

          {/* Material filter */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-hide">
            {materials.map(m => (
              <button key={m} onClick={() => setActiveMaterial(m)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                style={activeMaterial === m
                  ? { backgroundColor: accent, color: '#fff' }
                  : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                {m}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'recent' | 'name' | 'material' | 'collection')}
            className="min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option value="recent">Ordenar: mais recentes</option>
            <option value="name">Ordenar: nome</option>
            <option value="material">Ordenar: material</option>
            <option value="collection">Ordenar: coleção</option>
          </select>
        </div>

        {/* Collection tabs */}
        {collections.length > 1 && (
          <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {collections.map(col => (
              <button key={col} onClick={() => setActiveCollection(col)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap"
                style={activeCollection === col
                  ? { borderColor: primary, backgroundColor: primary, color: '#fff' }
                  : { borderColor: '#e2e8f0', backgroundColor: '#fff', color: '#64748b' }}>
                {col}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Products ── */}
      <main id="produtos" className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">
              Vitrine online
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {settings.catalogHeadline || 'Coleções em destaque'}
            </h2>
            {settings.catalogSubheadline && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                {settings.catalogSubheadline}
              </p>
            )}
          </div>
          <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">Atendimento</p>
            <p className="mt-3 text-lg font-black">Personalize cor, escala e acabamento.</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Cada item do catálogo pode virar um projeto sob medida para seu cliente.</p>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 font-medium">
            {isLoading
              ? 'Carregando catálogo...'
              : filtered.length === 0
                ? 'Nenhum produto encontrado'
                : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''}`}
          </p>
          {activeFilters && (
            <button onClick={() => { setSearch(''); setActiveCollection('Todos'); setActiveMaterial('Todos'); setSortBy('recent'); }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: accent }}>
              Limpar filtros ×
            </button>
          )}
        </div>

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
              <React.Fragment key={p.id}>
                <ProductCard product={p} accent={accent} whatsapp={whatsapp || ''} ctaLabel={ctaLabel} />
              </React.Fragment>
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

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Identidade da empresa</p>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
              {settings.aboutTitle || 'Por que escolher nossa empresa'}
            </h3>
            {settings.aboutText && (
              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">{settings.aboutText}</p>
            )}
          </article>

          <article className="rounded-[32px] border border-slate-900 bg-slate-950 p-7 text-white shadow-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/45">Contato</p>
            <h3 className="mt-4 text-2xl font-black tracking-tight">
              {settings.contactHeadline || 'Vamos tirar seu projeto do papel'}
            </h3>
            {settings.contactText && (
              <p className="mt-4 text-sm leading-7 text-white/68">{settings.contactText}</p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              {primaryAction && (
                <a href={primaryAction.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition-all hover:bg-slate-100">
                  {primaryAction.label}
                </a>
              )}
              {secondaryAction && (
                <a href={secondaryAction.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-white/16 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-white/16">
                  {secondaryAction.label}
                </a>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-16 text-white py-12 px-6"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" className="h-12 w-auto object-contain mb-3 opacity-90" />
            ) : (
              <div className="text-2xl font-black mb-3">{settings.businessName}</div>
            )}
            <p className="text-white/60 text-sm">{settings.tagline}</p>
            {settings.footerNote && <p className="text-white/40 text-xs mt-2 max-w-xs">{settings.footerNote}</p>}
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            {primaryAction && (
              <a href={primaryAction.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all">
                {primaryAction.label}
              </a>
            )}
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} {settings.businessName}</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ── */}
      <WAButton phone={whatsapp || ''} />
    </div>
  );
}
