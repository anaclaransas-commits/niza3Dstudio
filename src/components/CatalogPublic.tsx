import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
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
  // Paleta baseada em azul petróleo (tema escuro) e bege pastel (tema claro)
  primaryColor: '#003247',
  accentColor: '#c9be99',
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
  const [isLoading, setIsLoading] = useState(false);
  const safeIndex = images.length > 0 ? Math.min(index, images.length - 1) : 0;

  useEffect(() => {
    setIndex(0);
  }, [images.length, images[0]]);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageChange = (newIndex: number) => {
    setIsLoading(true);
    setIndex(newIndex);
  };

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: lightenHex(accent) }}
      >
        <span className="text-sm font-bold" style={{ color: '#78716c' }}>Sem imagem</span>
      </div>
    );
  }

  const go = (delta: number) => handleImageChange((index + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl shadow-inner" style={{ background: 'linear-gradient(135deg, #faf9f5 0%, #f5f2eb 100%)' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf9f5 0%, #f5f2eb 100%)' }}>
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#e7e5e4', borderTopColor: '#003247' }} />
          </div>
        )}
        <img
          src={images[safeIndex]}
          alt={`${alt} — foto ${safeIndex + 1}`}
          className="max-h-full max-w-full object-contain transition-all duration-500"
          style={{ opacity: isLoading ? 0 : 1, transform: isLoading ? 'scale(0.95)' : 'scale(1)' }}
          onLoad={handleImageLoad}
          onError={(e) => {
            console.error('Erro ao carregar imagem na galeria:', images[safeIndex]);
            handleImageLoad();
          }}
          loading="lazy"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
              style={{ background: 'linear-gradient(90deg, rgba(42, 39, 29, 0.7) 0%, rgba(42, 39, 29, 0.5) 100%)' }}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
              style={{ background: 'linear-gradient(90deg, rgba(42, 39, 29, 0.7) 0%, rgba(42, 39, 29, 0.5) 100%)' }}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-lg" style={{ background: 'linear-gradient(90deg, rgba(42, 39, 29, 0.7) 0%, rgba(42, 39, 29, 0.5) 100%)' }}>
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
              className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300"
              style={i === safeIndex ? {
                borderColor: '#003247',
                boxShadow: '0 10px 15px -3px rgba(0, 50, 71, 0.3)',
                transform: 'scale(1.05)'
              } : {
                borderColor: '#e7e5e4',
                transform: 'scale(1)'
              }}
            >
              <img 
                src={url} 
                alt="" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error('Erro ao carregar thumbnail:', url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BTN_DETAILS =
  'flex-1 rounded-2xl border py-2.5 text-xs font-bold transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.97]';
const BTN_QUOTE =
  'flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-bold shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.97]';

function ModalShell({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-4xl',
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[95vh] w-full ${maxWidth} overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5`}
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-xl font-black sm:text-2xl" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
            {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-3 transition-colors hover:bg-black/5"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>
        <div className="max-h-[calc(95vh-5rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─── Card/modal: detalhes do produto ───────────────────── */
function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onRequestQuote,
  settings,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: () => void;
  settings: CatalogSettings;
}) {
  if (!product) return null;

  const images = getProductImages(product);
  const accent = settings.accentColor;
  const primaryColor = settings.primaryColor;
  const tags = product.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <ModalShell
      title={product.name}
      subtitle={product.collection ? `Coleção: ${product.collection}` : undefined}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="p-6 lg:w-1/2" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <ImageGallery images={images} alt={product.name} accent={accent} />
        </div>
        <div className="flex flex-col p-6 lg:w-1/2">
          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white"
              style={{ backgroundColor: MATERIAL_BADGE[product.materialType] ?? '#003247' }}
            >
              {product.materialType}
            </span>
          </div>

          {product.description && (
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{product.description}</p>
          )}

          {tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{ backgroundColor: `${accent}33`, color: primaryColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
            {product.defaultWeightG != null && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Peso estimado</p>
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{product.defaultWeightG}g</p>
              </div>
            )}
            {product.avgPrintTimeHours != null && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Tempo de impressão</p>
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{product.avgPrintTimeHours}h</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestQuote}
            className={`${BTN_QUOTE} w-full py-3.5 text-sm`}
            style={{ backgroundColor: accent, color: primaryColor }}
          >
            <MessageCircle className="h-5 w-5" />
            {settings.primaryCtaLabel || 'Solicitar orçamento'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─── Card/modal: solicitar orçamento ─────────────────── */
function QuoteRequestModal({
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
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [quoteNote, setQuoteNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setQuantity('1');
      setQuoteNote('');
    }
  }, [isOpen, product?.id]);

  if (!product) return null;

  const accent = settings.accentColor;
  const primaryColor = settings.primaryColor;
  const ctaLabel = settings.primaryCtaLabel || 'Enviar orçamento';

  const buildExtraNote = () => {
    const lines: string[] = [];
    if (customerName.trim()) lines.push(`Nome: ${customerName.trim()}`);
    if (quantity.trim()) lines.push(`Quantidade: ${quantity.trim()}`);
    if (quoteNote.trim()) lines.push(`Detalhes: ${quoteNote.trim()}`);
    return lines.join('\n');
  };

  const buildFullMessage = () => {
    const base = `Olá! Gostaria de um orçamento para: *${product.name}*`;
    const extra = buildExtraNote();
    return extra ? `${base}\n\n${extra}` : base;
  };

  const waLink = createWhatsappUrl(settings.whatsapp, product.name, buildExtraNote());
  const mailtoLink = settings.email
    ? `mailto:${settings.email}?subject=${encodeURIComponent(`Orçamento — ${product.name}`)}&body=${encodeURIComponent(buildFullMessage())}`
    : undefined;
  const sendLink = waLink ?? mailtoLink;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendLink) {
      alert('Configure WhatsApp ou e-mail nas configurações do catálogo.');
      return;
    }
    window.open(sendLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <ModalShell
      title="Solicitar orçamento"
      subtitle={product.name}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="rounded-2xl bg-[#f2efe6] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b6a55]">Produto</p>
          <p className="mt-1 font-black text-[#1f1f14]">{product.name}</p>
          {product.collection && (
            <p className="mt-1 text-xs text-[#6b6a55]">{product.collection}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#6b6a55]">Seu nome</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border border-[#e7e0cf] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
            placeholder="Como podemos te chamar?"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#6b6a55]">Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-xl border border-[#e7e0cf] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#6b6a55]">Detalhes (cor, tamanho, acabamento…)</label>
          <textarea
            value={quoteNote}
            onChange={(e) => setQuoteNote(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-[#e7e0cf] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
            placeholder="Ex: cor preta, 15cm, acabamento fosco..."
          />
        </div>

        <button
          type="submit"
          disabled={!sendLink}
          className={`${BTN_QUOTE} w-full py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60`}
          style={{ backgroundColor: accent, color: primaryColor }}
        >
          <MessageCircle className="h-5 w-5" />
          {ctaLabel}
        </button>

        {!sendLink && (
          <p className="text-center text-xs text-amber-800">
            Configure WhatsApp ou e-mail no painel do catálogo.
          </p>
        )}
      </form>
    </ModalShell>
  );
}

/* ─── Card do produto ──────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  accent: string;
  primaryColor: string;
  ctaLabel: string;
  onOpenDetails: (product: Product) => void;
  onOpenQuote: (product: Product) => void;
  key?: string;
}

function ProductCard({
  product,
  accent,
  primaryColor,
  ctaLabel,
  onOpenDetails,
  onOpenQuote,
}: ProductCardProps) {
  const images = getProductImages(product);
  const cover = images[0];
  const extraCount = images.length - 1;
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = readLS<string[]>('catalog-favorites', []);
    return favorites.includes(product.id);
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = readLS<string[]>('catalog-favorites', []);
    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== product.id)
      : [...favorites, product.id];
    localStorage.setItem('catalog-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };
  const badgeColor = MATERIAL_BADGE[product.materialType] ?? '#003247';
  const tags = product.tags?.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 2) ?? [];

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-3xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/30"
      style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={() => onOpenDetails(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpenDetails(product)}
      >
        {cover ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={cover}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Erro ao carregar imagem de capa do produto:', cover);
                setImageLoaded(true);
              }}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: lightenHex(accent) }}
          >
            <span className="text-xs font-bold text-slate-400">Sem foto</span>
          </div>
        )}

        {extraCount > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-black/70 to-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:from-emerald-600/80 group-hover:to-cyan-600/80">
            <ZoomIn className="h-3 w-3" /> +{extraCount}
          </span>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute right-3 bottom-3 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white"
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
          />
        </button>

        <div className="absolute left-3 top-3">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-sm"
            style={{ 
              background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}dd)`,
              boxShadow: `0 4px 12px ${badgeColor}40`
            }}
          >
            {product.materialType}
          </span>
        </div>

        {product.collection && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-gradient-to-r from-black/60 to-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg">
              {product.collection}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5 bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm">
        <h3
          className="mb-2 cursor-pointer text-base font-black leading-tight text-slate-800 transition-colors group-hover:text-emerald-700"
          onClick={() => onOpenDetails(product)}
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
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className={BTN_DETAILS}
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-surface)' }}
          >
            Ver detalhes
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuote(product);
            }}
            className={BTN_QUOTE}
            style={{ backgroundColor: accent, color: primaryColor }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {ctaLabel}
          </button>
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [weightRange, setWeightRange] = useState<[number, number]>([0, 500]);

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
    const favorites = readLS<string[]>('catalog-favorites', []);
    const visible = publicProducts.filter((product) => {
      const collection = product.collection || 'Geral';
      const matchesCollection = activeCollection === 'Todos' || collection === activeCollection;
      const matchesMaterial = activeMaterial === 'Todos' || product.materialType === activeMaterial;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(product.id);
      const matchesPrice = !product.basePrice || (product.basePrice >= priceRange[0] && product.basePrice <= priceRange[1]);
      const matchesWeight = !product.defaultWeightG || (product.defaultWeightG >= weightRange[0] && product.defaultWeightG <= weightRange[1]);
      const haystack = [product.name, product.description, product.tags, product.collection, product.materialType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesCollection && matchesMaterial && matchesSearch && matchesFavorites && matchesPrice && matchesWeight;
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
  }, [publicProducts, activeCollection, activeMaterial, search, sortBy, showFavoritesOnly, priceRange, weightRange]);

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

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setQuoteOpen(false);
    setDetailsOpen(true);
  };

  const openQuote = (product: Product) => {
    setSelectedProduct(product);
    setDetailsOpen(false);
    setQuoteOpen(true);
  };

  const closePanels = () => {
    setDetailsOpen(false);
    setQuoteOpen(false);
    setSelectedProduct(null);
  };

  const switchToQuote = () => {
    setDetailsOpen(false);
    setQuoteOpen(true);
  };

  // Deep-link: /catalogo?produto=<id> ou ?produto=<id>&orcamento=1
  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('produto');
    if (!id) return;
    const found = publicProducts.find((p) => p.id === id);
    if (!found) return;
    setSelectedProduct(found);
    if (params.get('orcamento') === '1') {
      setDetailsOpen(false);
      setQuoteOpen(true);
    } else {
      setQuoteOpen(false);
      setDetailsOpen(true);
    }
  }, [isLoading, publicProducts]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const panelOpen = detailsOpen || quoteOpen;
    if (panelOpen && selectedProduct?.id) {
      url.searchParams.set('produto', selectedProduct.id);
      if (quoteOpen) url.searchParams.set('orcamento', '1');
      else url.searchParams.delete('orcamento');
      window.history.replaceState({}, '', url.toString());
      return;
    }
    url.searchParams.delete('produto');
    url.searchParams.delete('orcamento');
    window.history.replaceState({}, '', url.toString());
  }, [detailsOpen, quoteOpen, selectedProduct?.id]);

  const palette = useMemo(() => {
    // Nova paleta baseada em azul petróleo e bege pastel
    const pageBg = '#faf9f5';
    const sectionBg = '#f5f2eb';
    const cardBg = '#ffffff';
    const border = '#e7e5e4';
    const textMuted = '#78716c';
    const text = '#1c1917';
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
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                showFavoritesOnly ? 'bg-rose-50 text-rose-600' : ''
              }`}
              style={{ backgroundColor: showFavoritesOnly ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: showFavoritesOnly ? undefined : palette.text }}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
              Favoritos
            </button>
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
                      ? { backgroundColor: primaryColor, color: '#ffffff', borderColor: primaryColor }
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

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: palette.textMuted }}>
                Faixa de preço (R$)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}` }}
                  placeholder="Min"
                />
                <span style={{ color: palette.textMuted }}>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}` }}
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: palette.textMuted }}>
                Faixa de peso (g)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weightRange[0]}
                  onChange={(e) => setWeightRange([Number(e.target.value), weightRange[1]])}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}` }}
                  placeholder="Min"
                />
                <span style={{ color: palette.textMuted }}>-</span>
                <input
                  type="number"
                  value={weightRange[1]}
                  onChange={(e) => setWeightRange([weightRange[0], Number(e.target.value)])}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}` }}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
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
                  ctaLabel={ctaLabel}
                  onOpenDetails={openDetails}
                  onOpenQuote={openQuote}
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
                ctaLabel={ctaLabel}
                onOpenDetails={openDetails}
                onOpenQuote={openQuote}
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

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={detailsOpen}
        onClose={closePanels}
        onRequestQuote={switchToQuote}
        settings={settings}
      />
      <QuoteRequestModal
        product={selectedProduct}
        isOpen={quoteOpen}
        onClose={closePanels}
        settings={settings}
      />
    </div>
  );
}
