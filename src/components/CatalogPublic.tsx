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
  businessName: '3DPrint Master',
  tagline: 'Impressão 3D com qualidade e precisão',
  primaryColor: '#0f172a',
  accentColor: '#3b82f6',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: '',
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

/* ─── WhatsApp floating button ───────────────────────── */
function WAButton({ phone, accent }: { phone: string; accent: string }) {
  if (!phone) return null;
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: '#25d366' }}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.874L.057 23.996l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.36-.213-3.733.979 1-3.638-.234-.374A9.818 9.818 0 1112 21.818z"/>
      </svg>
      Falar pelo WhatsApp
    </a>
  );
}

/* ─── Product card ───────────────────────────────────── */
function ProductCard({ product, accent, primary, whatsapp }: {
  product: Product;
  accent: string;
  primary: string;
  whatsapp: string;
}) {
  const badgeColor = MATERIAL_BADGE[product.materialType] ?? '#64748b';
  const msg = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.name}* 😊`);
  const waLink = whatsapp ? `https://wa.me/${whatsapp}?text=${msg}` : undefined;

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
            Solicitar orçamento
          </a>
        ) : (
          <div className="w-full py-3 rounded-2xl font-bold text-sm text-white text-center mt-auto"
            style={{ backgroundColor: accent }}>
            Solicitar orçamento
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Hero header ────────────────────────────────────── */
function HeroHeader({ s }: { s: CatalogSettings }) {
  const { primaryColor: primary, accentColor: accent, businessName, tagline, logoUrl, whatsapp, instagram, email } = s;
  return (
    <header style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }} className="relative overflow-hidden">
      {/* decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#ffffff' }} />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#ffffff' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Logo / initials */}
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className="w-24 h-24 rounded-3xl object-contain bg-white/10 p-2 shadow-xl flex-shrink-0" />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center text-white font-black text-3xl shadow-xl flex-shrink-0">
            {businessName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">{businessName}</h1>
          <p className="text-white/70 text-lg mt-2 font-medium">{tagline}</p>

          {/* Social links */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.874L.057 23.996l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.36-.213-3.733.979 1-3.638-.234-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {instagram && (
              <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                {instagram}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {email}
              </a>
            )}
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

  const collections = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.collection || 'Geral')))], [publicProducts]);
  const materials   = useMemo(() => ['Todos', ...Array.from(new Set(publicProducts.map(p => p.materialType)))], [publicProducts]);

  const filtered = useMemo(() => publicProducts.filter(p => {
    const col = p.collection || 'Geral';
    const ok_col  = activeCollection === 'Todos' || col === activeCollection;
    const ok_mat  = activeMaterial  === 'Todos' || p.materialType === activeMaterial;
    const ok_srch = !search || [p.name, p.description, p.tags, p.collection]
      .filter(Boolean).some(f => f!.toLowerCase().includes(search.toLowerCase()));
    return ok_col && ok_mat && ok_srch;
  }), [publicProducts, activeCollection, activeMaterial, search]);

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
      {/* ── Hero ── */}
      <HeroHeader s={settings} />

      {!isLoading && dataSource !== 'api' && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar o catálogo publicado agora. Exibindo apenas os dados disponíveis neste navegador.
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
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 font-medium">
            {isLoading
              ? 'Carregando catálogo...'
              : filtered.length === 0
                ? 'Nenhum produto encontrado'
                : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''}`}
          </p>
          {(search || activeCollection !== 'Todos' || activeMaterial !== 'Todos') && (
            <button onClick={() => { setSearch(''); setActiveCollection('Todos'); setActiveMaterial('Todos'); }}
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
                <ProductCard product={p} accent={accent} primary={primary} whatsapp={whatsapp || ''} />
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
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.14 1.535 5.874L.057 23.996l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.36-.213-3.733.979 1-3.638-.234-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                Solicitar Orçamento
              </a>
            )}
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} {settings.businessName}</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ── */}
      <WAButton phone={whatsapp || ''} accent={accent} />
    </div>
  );
}
