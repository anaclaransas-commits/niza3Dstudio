import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  Shield,
  Zap,
  Package,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
  ChevronUp,
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
  highlightOne: 'Design exclusivo e moderno',
  highlightTwo: 'Projetos exclusivos criados sob medidas',
  highlightThree: 'Entrega segura para todo Brasil',
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
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [isLoading, setIsLoading] = useState(false);
  const safeIndex = images.length > 0 ? Math.min(index, images.length - 1) : 0;

  useEffect(() => {
    setIndex(0);
    setDirection(0);
  }, [images.length, images[0]]);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageChange = (newIndex: number, dir: number) => {
    setDirection(dir);
    setIsLoading(true);
    setTimeout(() => {
      setIndex(newIndex);
    }, 150); // Small delay for smooth transition
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

  const go = (delta: number) => {
    const newIndex = (index + delta + images.length) % images.length;
    handleImageChange(newIndex, delta);
  };

  return (
    <div className="space-y-3">
      <motion.div 
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl shadow-lg" 
        style={{ background: 'linear-gradient(135deg, #faf9f5 0%, #f5f2eb 100%)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Loading overlay with elegant animation */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-10" 
              style={{ background: 'linear-gradient(135deg, #faf9f5 0%, #f5f2eb 100%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-10 h-10 border-3 rounded-full" 
                style={{ borderColor: '#e7e5e4', borderTopColor: '#003247', borderWidth: '3px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Image with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.img
            key={images[safeIndex]}
            src={images[safeIndex]}
            alt={`${alt} — foto ${safeIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            initial={{ 
              opacity: 0, 
              x: direction > 0 ? -30 : 30,
              scale: 0.95
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              x: direction > 0 ? 30 : -30,
              scale: 0.95
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            onLoad={handleImageLoad}
            onError={(e) => {
              console.error('Erro ao carregar imagem na galeria:', images[safeIndex]);
              handleImageLoad();
            }}
            loading="lazy"
          />
        </AnimatePresence>
        
        {/* Elegant navigation buttons */}
        {images.length > 1 && (
          <>
            <motion.button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 50, 71, 0.85) 0%, rgba(0, 50, 71, 0.65) 100%)',
                boxShadow: '0 8px 32px rgba(0, 50, 71, 0.3)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 50, 71, 0.85) 0%, rgba(0, 50, 71, 0.65) 100%)',
                boxShadow: '0 8px 32px rgba(0, 50, 71, 0.3)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
            
            {/* Elegant counter badge */}
            <motion.div 
              className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-xs font-bold text-white backdrop-blur-md shadow-lg" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 50, 71, 0.85) 0%, rgba(0, 50, 71, 0.65) 100%)',
                boxShadow: '0 4px 16px rgba(0, 50, 71, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {safeIndex + 1} / {images.length}
            </motion.div>
          </>
        )}
      </motion.div>
      
      {/* Elegant thumbnails with smooth hover effects */}
      {images.length > 1 && (
        <motion.div 
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {images.map((url, i) => (
            <motion.button
              key={url}
              type="button"
              onClick={() => {
                const dir = i > safeIndex ? 1 : -1;
                handleImageChange(i, dir);
              }}
              className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={i === safeIndex ? {
                borderColor: '#003247',
                boxShadow: '0 0 0 3px rgba(0, 50, 71, 0.1), 0 12px 24px -8px rgba(0, 50, 71, 0.4)',
              } : {
                borderColor: '#e7e5e4',
                opacity: 0.8
              }}
              aria-label={`Ver foto ${i + 1}`}
            >
              <motion.img 
                src={url} 
                alt={`Thumbnail ${i + 1}`} 
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </motion.div>
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`max-h-[95vh] w-full ${maxWidth} overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5`}
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-black sm:text-2xl" 
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {title}
                </motion.h2>
                {subtitle && (
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-1 text-sm" 
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
              <motion.button
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                type="button"
                onClick={onClose}
                className="rounded-2xl p-3 transition-colors hover:bg-black/5"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" style={{ color: 'var(--color-text-primary)' }} />
              </motion.button>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-h-[calc(95vh-5rem)] overflow-y-auto"
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

          {/* Size change notice */}
          <div className="mb-6 rounded-2xl p-4 text-center" style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}>
            <p className="text-xs font-semibold" style={{ color: accent }}>
              💡 O tamanho pode ser alterado conforme sua necessidade.
            </p>
          </div>

          {/* Professional contact information */}
          <div className="mb-6 space-y-3 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Contato Profissional
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}33` }}>
                <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>WhatsApp</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {settings.whatsapp || 'Configure seu WhatsApp'}
                </p>
              </div>
            </div>
            {settings.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}33` }}>
                  <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>E-mail</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{settings.email}</p>
                </div>
              </div>
            )}
            {settings.secondaryCtaUrl && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}33` }}>
                  <Instagram className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {settings.secondaryCtaLabel || 'Instagram'}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Siga nosso perfil
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestQuote}
            className={`${BTN_QUOTE} w-full py-2.5 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
            style={{
              backgroundColor: accent,
              color: primaryColor,
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
            }}
          >
            <MessageCircle className="h-4 w-4" />
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
          className={`${BTN_QUOTE} w-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
          style={{
            backgroundColor: accent,
            color: primaryColor,
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
          }}
        >
          <MessageCircle className="h-4 w-4" />
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
  index?: number;
  palette: {
    text: string;
    textMuted: string;
    cardBg: string;
    border: string;
  };
}

function ProductCard({
  product,
  accent,
  primaryColor,
  ctaLabel,
  onOpenDetails,
  onOpenQuote,
  index = 0,
  palette,
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.05 // Stagger effect
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group flex flex-col overflow-hidden rounded-3xl shadow-lg"
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
          <motion.span
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-black/70 to-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: isHovered ? [0, 360] : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <ZoomIn className="h-3 w-3" />
            </motion.div>
            +{extraCount}
          </motion.span>
        )}

        <motion.button
          type="button"
          onClick={toggleFavorite}
          className="absolute right-3 bottom-3 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm"
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          animate={{
            backgroundColor: isFavorite ? 'rgba(251, 113, 133, 0.95)' : 'rgba(255, 255, 255, 0.9)',
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={false}
            animate={{
              scale: isFavorite ? [1, 1.3, 1] : 1,
              rotate: isFavorite ? [0, -15, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-white text-white' : 'text-slate-400'}`}
            />
          </motion.div>
        </motion.button>

        <motion.div 
          className="absolute left-3 top-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            className="rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl backdrop-blur-md flex items-center gap-1.5"
            style={{ 
              background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}ee)`,
              boxShadow: `0 4px 20px ${badgeColor}60`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
            {product.materialType}
          </motion.span>
        </motion.div>

        {product.collection && (
          <motion.div 
            className="absolute bottom-3 left-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span 
              className="rounded-xl bg-gradient-to-r from-black/80 to-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md shadow-xl flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
              {product.collection}
            </motion.span>
          </motion.div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-6 bg-gradient-to-b from-white/60 to-white/90 backdrop-blur-sm">
        <motion.h3
          className="mb-3 cursor-pointer text-lg font-black leading-snug"
          style={{ color: palette.text }}
          onClick={() => onOpenDetails(product)}
          whileHover={{ color: accent }}
          transition={{ duration: 0.2 }}
        >
          {product.name}
        </motion.h3>

        {product.description && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed" style={{ color: palette.textMuted }}>{product.description}</p>
        )}

        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <motion.span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${accent}15`, color: accent }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.1, backgroundColor: `${accent}25` }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuote(product);
            }}
            className={`${BTN_QUOTE} w-full py-3.5 text-sm font-bold shadow-lg`}
            whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              backgroundColor: accent,
              color: primaryColor,
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
              transition: 'all 0.3s ease'
            }}
          >
            <MessageCircle className="h-4 w-4" />
            {ctaLabel}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Página pública ───────────────────────────────────── */
export function CatalogPublic() {
  const fallbackSettings = readLS<CatalogSettings>('3d_catalog_settings', DEFAULT_SETTINGS);
  const fallbackProducts = readLS<Product[]>('3d_products', []).filter((p) => p.isPublic !== false);

  const [settings, setSettings] = useState<CatalogSettings>(fallbackSettings);
  const [publicProducts, setPublicProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [activeMaterial, setActiveMaterial] = useState('Todos');
  const [activeTag, setActiveTag] = useState('Todos');
  const [activeTipo, setActiveTipo] = useState('Todos');
  const [activeOcasião, setActiveOcasião] = useState('Todos');
  const [activeAmbiente, setActiveAmbiente] = useState('Todos');
  const [activePublico, setActivePublico] = useState('Todos');
  const [activeHighlightTab, setActiveHighlightTab] = useState<'destaques' | 'mais_vendidos' | 'novidades'>('destaques');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'material' | 'collection'>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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

  const tags = useMemo(() => {
    const allTags = publicProducts.flatMap((p) => p.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? []);
    return ['Todos', ...Array.from(new Set(allTags))];
  }, [publicProducts]);

  // Extrair valores por categoria e campo específico
  const getValuesByCategoryAndField = useMemo(() => {
    return (category: string, field: 'tipo' | 'ocasião' | 'ambiente' | 'público') => {
      const categoryProducts = category === 'Todos' 
        ? publicProducts 
        : publicProducts.filter(p => (p.collection || 'Geral') === category);
      
      const allValues = categoryProducts.flatMap((p) => {
        const value = p[field];
        return value ? [value] : [];
      });
      return ['Todos', ...Array.from(new Set(allValues))];
    };
  }, [publicProducts]);

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
      const matchesTag = activeTag === 'Todos' || product.tags?.toLowerCase().includes(activeTag.toLowerCase());
      
      // Filtros específicos por campo
      const matchesTipo = activeTipo === 'Todos' || product.tipo === activeTipo;
      const matchesOcasião = activeOcasião === 'Todos' || product.ocasião === activeOcasião;
      const matchesAmbiente = activeAmbiente === 'Todos' || product.ambiente === activeAmbiente;
      const matchesPublico = activePublico === 'Todos' || product.público === activePublico;
      
      const matchesFavorites = !showFavoritesOnly || favorites.includes(product.id);
      const haystack = [product.name, product.description, product.tags, product.collection, product.materialType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesCollection && matchesMaterial && matchesTag && matchesTipo && matchesOcasião && matchesAmbiente && matchesPublico && matchesSearch && matchesFavorites;
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
  }, [publicProducts, activeCollection, activeMaterial, activeTag, activeTipo, activeOcasião, activeAmbiente, activePublico, search, sortBy, showFavoritesOnly]);

  // Contadores de produtos para cada filtro
  const getFilterCount = (filterType: string, value: string) => {
    return publicProducts.filter((product) => {
      switch (filterType) {
        case 'collection':
          return (product.collection || 'Geral') === value;
        case 'material':
          return product.materialType === value;
        case 'tag':
          return product.tags?.toLowerCase().includes(value.toLowerCase());
        case 'tipo':
          return product.tipo === value;
        case 'ocasião':
          return product.ocasião === value;
        case 'ambiente':
          return product.ambiente === value;
        case 'público':
          return product.público === value;
        default:
          return false;
      }
    }).length;
  };

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
    // Nova paleta baseada em azul petróleo e bege pastel com melhor contraste
    const pageBg = '#faf9f5';
    const sectionBg = '#f5f2eb';
    const cardBg = '#ffffff';
    const border = '#d6d3d1';
    const textMuted = '#57534e';
    const text = '#1c1917';
    const pill = 'rgba(255,255,255,0.15)';
    const heroOverlay = `linear-gradient(120deg, ${primaryColor}e8 0%, ${primaryColor}cc 42%, ${primaryColor}e0 100%)`;
    const heroBg = coverImageUrl
      ? `${heroOverlay}, url(${coverImageUrl}) center/cover`
      : primaryColor;
    const ctaPrimaryBg = 'rgba(245, 240, 220, 0.98)';
    const ctaPrimaryText = primaryColor;
    const ctaOutline = 'rgba(245, 240, 220, 0.40)';

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

  /* ─── Skeleton Screen Component ─────────────────────────── */
  function ProductCardSkeleton() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col overflow-hidden rounded-3xl shadow-lg"
        style={{ 
          border: '1px solid rgba(0,0,0,0.08)', 
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="relative aspect-square overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            style={{ backgroundColor: lightenHex(accent) }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-white/80" />
          <div className="absolute left-3 top-3 h-8 w-20 rounded-xl bg-white/80" />
          <div className="absolute bottom-3 left-3 h-8 w-24 rounded-xl bg-white/80" />
        </div>
        <div className="flex flex-1 flex-col p-6 space-y-4">
          <motion.div 
            className="h-6 w-3/4 rounded-xl bg-slate-100"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div 
            className="h-4 w-full rounded-xl bg-slate-100"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
          <motion.div 
            className="h-4 w-2/3 rounded-xl bg-slate-100"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
          />
          <div className="mt-auto flex gap-2">
            <motion.div 
              className="h-10 flex-1 rounded-xl bg-slate-100"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/90" style={{ backgroundColor: palette.pill }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
              Impressão 3D personalizada
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl" style={{ color: 'rgba(255,255,255,0.95)' }}>
              {businessName}
            </h1>
            {tagline && <p className="mt-3 text-base text-white/85 sm:text-lg font-medium">{tagline}</p>}
            {heroDescription && (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80 md:mx-0">{heroDescription}</p>
            )}
            {highlights.length > 0 && (
              <div className="mt-6 flex flex-nowrap justify-center gap-2 overflow-x-auto md:justify-start md:flex-wrap md:overflow-visible">
                {highlights.map((h) => (
                  <span
                    key={h}
                    className="whitespace-nowrap rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white/90 md:px-5 md:py-2.5 md:text-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              {primaryCtaUrl && (
                <motion.a
                  href={primaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-6 py-3 text-sm font-black transition hover:opacity-95"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ backgroundColor: palette.ctaPrimaryBg, color: palette.ctaPrimaryText }}
                >
                  {ctaLabel}
                </motion.a>
              )}
              {secondaryCtaUrl && (
                <motion.a
                  href={secondaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ border: `1px solid ${palette.ctaOutline}` }}
                >
                  {secondaryCtaLabel || 'Instagram'}
                </motion.a>
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
      <section className="px-4 py-4 sm:px-6" style={{ backgroundColor: palette.sectionBg, borderBottom: `1px solid ${palette.border}` }}>
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4" style={{ color: palette.text }}>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${accent}20`, color: accent }}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.text }}>Personalizado</p>
              <p className="text-[11px] leading-tight" style={{ color: palette.textMuted }}>Projetos exclusivos sob medida</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${accent}20`, color: accent }}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.text }}>Qualidade</p>
              <p className="text-[11px] leading-tight" style={{ color: palette.textMuted }}>Acabamento premium e durável</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${accent}20`, color: accent }}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.text }}>Rápido</p>
              <p className="text-[11px] leading-tight" style={{ color: palette.textMuted }}>Atendimento ágil e direto</p>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}` }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${accent}20`, color: accent }}>
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.text }}>Cuidado</p>
              <p className="text-[11px] leading-tight" style={{ color: palette.textMuted }}>Embalagem segura e protegida</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destaques unificados - Cards menores com abas */}
      {!isLoading && featuredProducts.length > 0 && (
        <section className="px-4 py-8 sm:px-6" style={{ backgroundColor: palette.pageBg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => setActiveHighlightTab('destaques')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: activeHighlightTab === 'destaques' ? accent : 'transparent',
                    color: activeHighlightTab === 'destaques' ? palette.text : palette.textMuted,
                    border: `1px solid ${activeHighlightTab === 'destaques' ? accent : palette.border}`
                  }}
                >
                  Destaques
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setActiveHighlightTab('mais_vendidos')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: activeHighlightTab === 'mais_vendidos' ? accent : 'transparent',
                    color: activeHighlightTab === 'mais_vendidos' ? palette.text : palette.textMuted,
                    border: `1px solid ${activeHighlightTab === 'mais_vendidos' ? accent : palette.border}`
                  }}
                >
                  Mais vendidos
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setActiveHighlightTab('novidades')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: activeHighlightTab === 'novidades' ? accent : 'transparent',
                    color: activeHighlightTab === 'novidades' ? palette.text : palette.textMuted,
                    border: `1px solid ${activeHighlightTab === 'novidades' ? accent : palette.border}`
                  }}
                >
                  Novidades
                </motion.button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {featuredProducts.slice(0, 8).map((product) => {
                const images = getProductImages(product);
                const cover = images[0];
                return (
                  <button
                    key={`${activeHighlightTab}-${product.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDetailsOpen(true);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl shadow-sm transition-all hover:scale-105 hover:shadow-md"
                    style={{ backgroundColor: palette.cardBg }}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: lightenHex(accent) }}>
                        <span className="text-xs font-bold text-slate-400">Sem foto</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 line-clamp-2">
                        {product.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Filtros + visão geral */}
      <section className="px-4 py-8 sm:px-6" style={{ backgroundColor: palette.pageBg, borderBottom: `1px solid ${palette.border}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black sm:text-3xl" style={{ color: palette.text }}>
              {catalogHeadline || 'Nossos produtos'}
            </h2>
            {catalogSubheadline && <p className="mt-2 text-base" style={{ color: palette.textMuted }}>{catalogSubheadline}</p>}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: palette.textMuted }} />
              <input
                type="search"
                placeholder="Buscar produto, tag ou coleção..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl py-3 pl-12 pr-4 text-base outline-none focus:ring-2"
                style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, boxShadow: `0 0 0 0 transparent`, outlineColor: accent }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  onClick={() => {
                    setActiveMaterial('PLA');
                    setActiveCollection('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
                    activeMaterial === 'PLA' ? 'bg-green-50 text-green-600' : ''
                  }`}
                  style={{ backgroundColor: activeMaterial === 'PLA' ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: activeMaterial === 'PLA' ? undefined : palette.text }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  PLA
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setActiveMaterial('PETG');
                    setActiveCollection('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
                    activeMaterial === 'PETG' ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  style={{ backgroundColor: activeMaterial === 'PETG' ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: activeMaterial === 'PETG' ? undefined : palette.text }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  PETG
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setActiveAmbiente('Sala');
                    setActiveCollection('Todos');
                    setActiveMaterial('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActivePublico('Todos');
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
                    activeAmbiente === 'Sala' ? 'bg-purple-50 text-purple-600' : ''
                  }`}
                  style={{ backgroundColor: activeAmbiente === 'Sala' ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: activeAmbiente === 'Sala' ? undefined : palette.text }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sala
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setActiveOcasião('Presente');
                    setActiveCollection('Todos');
                    setActiveMaterial('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
                    activeOcasião === 'Presente' ? 'bg-yellow-50 text-yellow-600' : ''
                  }`}
                  style={{ backgroundColor: activeOcasião === 'Presente' ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: activeOcasião === 'Presente' ? undefined : palette.text }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Presente
                </motion.button>
              </div>
              <motion.button
                type="button"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                  showFavoritesOnly ? 'bg-rose-50 text-rose-600' : ''
                }`}
                style={{ backgroundColor: showFavoritesOnly ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: showFavoritesOnly ? undefined : palette.text }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: showFavoritesOnly ? [0, -15, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
                </motion.div>
                Favoritos
              </motion.button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-2xl px-5 py-3 text-sm font-semibold outline-none"
                style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, color: palette.text }}
                aria-label="Ordenar produtos"
              >
                <option value="name">Nome A–Z</option>
                <option value="collection">Coleção</option>
                <option value="material">Material</option>
              </select>
              <motion.button
                type="button"
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                  showFilterSidebar ? 'bg-blue-50 text-blue-600' : ''
                }`}
                style={{ backgroundColor: showFilterSidebar ? undefined : palette.sectionBg, border: `1px solid ${palette.border}`, color: showFilterSidebar ? undefined : palette.text }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Filtros avançados"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </motion.button>
              {(search || activeCollection !== 'Todos' || activeMaterial !== 'Todos' || activeTag !== 'Todos' || activeTipo !== 'Todos' || activeOcasião !== 'Todos' || activeAmbiente !== 'Todos' || activePublico !== 'Todos' || showFavoritesOnly) && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveCollection('Todos');
                    setActiveMaterial('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                    setShowFavoritesOnly(false);
                  }}
                  className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, color: palette.text }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Limpar filtros"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </motion.div>
                  Limpar
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar de Filtros Avançados */}
      <AnimatePresence>
        {showFilterSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterSidebar(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-50 overflow-y-auto"
              style={{ backgroundColor: palette.pageBg }}
            >
              <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: palette.pageBg, borderBottom: `1px solid ${palette.border}` }}>
                <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: palette.text }}>Filtros Avançados</h2>
                <button
                  type="button"
                  onClick={() => setShowFilterSidebar(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" style={{ color: palette.text }} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Coleção */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Coleção</label>
                  <div className="space-y-2">
                    {collections.map((col) => (
                      <motion.button
                        key={col}
                        type="button"
                        onClick={() => setActiveCollection(col)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeCollection === col ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeCollection === col ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{col}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('collection', col)}
                          </span>
                          {activeCollection === col && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Material</label>
                  <div className="space-y-2">
                    {materials.map((mat) => (
                      <motion.button
                        key={mat}
                        type="button"
                        onClick={() => setActiveMaterial(mat)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeMaterial === mat ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeMaterial === mat ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{mat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('material', mat)}
                          </span>
                          {activeMaterial === mat && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Tags</label>
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <motion.button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeTag === tag ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeTag === tag ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{tag}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('tag', tag)}
                          </span>
                          {activeTag === tag && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Tipo</label>
                  <div className="space-y-2">
                    {tipos.map((tipo) => (
                      <motion.button
                        key={tipo}
                        type="button"
                        onClick={() => setActiveTipo(tipo)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeTipo === tipo ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeTipo === tipo ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{tipo}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('tipo', tipo)}
                          </span>
                          {activeTipo === tipo && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Ocasião */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Ocasião</label>
                  <div className="space-y-2">
                    {ocasiões.map((oc) => (
                      <motion.button
                        key={oc}
                        type="button"
                        onClick={() => setActiveOcasião(oc)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeOcasião === oc ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeOcasião === oc ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{oc}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('ocasião', oc)}
                          </span>
                          {activeOcasião === oc && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Ambiente */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Ambiente</label>
                  <div className="space-y-2">
                    {ambientes.map((amb) => (
                      <motion.button
                        key={amb}
                        type="button"
                        onClick={() => setActiveAmbiente(amb)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activeAmbiente === amb ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activeAmbiente === amb ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{amb}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('ambiente', amb)}
                          </span>
                          {activeAmbiente === amb && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Público */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Público</label>
                  <div className="space-y-2">
                    {públicos.map((pub) => (
                      <motion.button
                        key={pub}
                        type="button"
                        onClick={() => setActivePublico(pub)}
                        className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors"
                        style={{ 
                          backgroundColor: activePublico === pub ? `${accent}15` : palette.cardBg, 
                          border: `1px solid ${activePublico === pub ? accent : palette.border}`,
                          color: palette.text
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{pub}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal" style={{ color: palette.textMuted }}>
                            {getFilterCount('público', pub)}
                          </span>
                          {activePublico === pub && <Check className="h-4 w-4" style={{ color: accent }} />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Botão de limpar */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveCollection('Todos');
                    setActiveMaterial('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                    setShowFavoritesOnly(false);
                  }}
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: palette.sectionBg, border: `1px solid ${palette.border}`, color: palette.text }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpar todos os filtros
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Categorias */}
      {categorySummaries.length > 0 && (
        <section className="px-4 py-8 sm:px-6" style={{ backgroundColor: palette.pageBg }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>Categorias</h3>
              <motion.span 
                className="text-sm font-semibold" 
                style={{ color: palette.textMuted }}
                key={filtered.length}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {filtered.length} de {publicProducts.length} modelo{publicProducts.length === 1 ? '' : 's'}
              </motion.span>
            </div>
            <div className="flex flex-wrap gap-4 md:grid md:grid-cols-4 lg:grid-cols-5">
              {/* Card "Todos" */}
              <motion.button
                key="Todos"
                type="button"
                onClick={() => {
                  setActiveCollection('Todos');
                  setActiveMaterial('Todos');
                  setActiveTag('Todos');
                  setActiveTipo('Todos');
                  setActiveOcasião('Todos');
                  setActiveAmbiente('Todos');
                  setActivePublico('Todos');
                }}
                className={`flex flex-col items-start rounded-2xl px-5 py-4 text-left shadow-md flex-1 min-w-[100px] max-w-[140px] ${
                  activeCollection === 'Todos' ? 'border-slate-900' : 'border-slate-100'
                }`}
                style={{ backgroundColor: palette.cardBg, borderColor: activeCollection === 'Todos' ? primaryColor : palette.border }}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-bold" style={{ color: palette.text }}>Todos</span>
                <span className="mt-2 text-xs" style={{ color: palette.textMuted }}>
                  {publicProducts.length} produto{publicProducts.length === 1 ? '' : 's'}
                </span>
              </motion.button>
              {categorySummaries.map((category, index) => (
                <motion.button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setActiveCollection(category.name);
                    setActiveMaterial('Todos');
                    setActiveTag('Todos');
                    setActiveTipo('Todos');
                    setActiveOcasião('Todos');
                    setActiveAmbiente('Todos');
                    setActivePublico('Todos');
                  }}
                  className={`flex flex-col items-start rounded-2xl px-5 py-4 text-left shadow-md flex-1 min-w-[100px] max-w-[140px] ${
                    activeCollection === category.name ? 'border-slate-900' : 'border-slate-100'
                  }`}
                  style={{ 
                    backgroundColor: activeCollection === category.name ? primaryColor : palette.cardBg, 
                    borderColor: activeCollection === category.name ? primaryColor : palette.border,
                    color: activeCollection === category.name ? '#fff' : palette.text
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm font-bold">{category.name}</span>
                  <span className="mt-2 text-xs" style={{ color: activeCollection === category.name ? 'rgba(255,255,255,0.8)' : palette.textMuted }}>
                    {category.count} produto{category.count === 1 ? '' : 's'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filtros de tags específicos - aparecem ao selecionar categoria */}
      <AnimatePresence>
        {activeCollection !== 'Todos' && (
          <motion.section 
            className="px-4 py-8 sm:px-6" 
            style={{ backgroundColor: palette.pageBg, borderBottom: `1px solid ${palette.border}` }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto max-w-6xl">
              <motion.h3 
                className="mb-6 text-sm font-black uppercase tracking-[0.2em]" 
                style={{ color: palette.textMuted }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Filtrar por
              </motion.h3>
              
              <div className="flex flex-wrap gap-8">
                {/* Tipo */}
                {(() => {
                  const values = getValuesByCategoryAndField(activeCollection, 'tipo');
                  const hasValues = values.filter(v => v !== 'Todos').length > 0;
                  return hasValues ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Tipo</label>
                      <div className="flex flex-wrap gap-2">
                        {values.map((tag) => (
                          <motion.button
                            key={`tipo-${tag}`}
                            type="button"
                            onClick={() => setActiveTipo(tag)}
                            className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={
                              activeTipo === tag
                                ? { backgroundColor: accent, color: palette.text, borderColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                                : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                            }
                          >
                            {tag}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null;
                })()}

              {/* Ocasião */}
              {(() => {
                const values = getValuesByCategoryAndField(activeCollection, 'ocasião');
                const hasValues = values.filter(v => v !== 'Todos').length > 0;
                return hasValues ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Ocasião</label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((tag) => (
                        <motion.button
                          key={`ocasiao-${tag}`}
                          type="button"
                          onClick={() => setActiveOcasião(tag)}
                          className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={
                            activeOcasião === tag
                              ? { backgroundColor: accent, color: palette.text, borderColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                              : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                          }
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Ambiente */}
              {(() => {
                const values = getValuesByCategoryAndField(activeCollection, 'ambiente');
                const hasValues = values.filter(v => v !== 'Todos').length > 0;
                return hasValues ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Ambiente</label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((tag) => (
                        <motion.button
                          key={`ambiente-${tag}`}
                          type="button"
                          onClick={() => setActiveAmbiente(tag)}
                          className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={
                            activeAmbiente === tag
                              ? { backgroundColor: accent, color: palette.text, borderColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                              : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                          }
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Público */}
              {(() => {
                const values = getValuesByCategoryAndField(activeCollection, 'público');
                const hasValues = values.filter(v => v !== 'Todos').length > 0;
                return hasValues ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Público</label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((tag) => (
                        <motion.button
                          key={`publico-${tag}`}
                          type="button"
                          onClick={() => setActivePublico(tag)}
                          className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={
                            activePublico === tag
                              ? { backgroundColor: accent, color: palette.text, borderColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                              : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                          }
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Material */}
              {materials.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: palette.textMuted }}>Material</label>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((mat) => (
                      <motion.button
                        key={`material-${mat}`}
                        type="button"
                        onClick={() => setActiveMaterial(mat)}
                        className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={
                          activeMaterial === mat
                            ? { backgroundColor: accent, color: palette.text, borderColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                            : { backgroundColor: palette.cardBg, color: palette.textMuted, borderColor: palette.border }
                        }
                      >
                        {mat}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>

      {/* Grid de produtos */}
      <main id="produtos" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filtered.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                primaryColor={primaryColor}
                ctaLabel={ctaLabel}
                index={index}
                palette={palette}
                onOpenDetails={(product) => {
                  setSelectedProduct(product);
                  setDetailsOpen(true);
                }}
                onOpenQuote={(product) => {
                  setSelectedProduct(product);
                  setQuoteOpen(true);
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}20` }}>
              <Filter className="h-10 w-10" style={{ color: accent }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: palette.text }}>Nenhum produto encontrado</p>
            <p className="mt-3 text-lg" style={{ color: palette.textMuted }}>Tente outro filtro ou termo de busca</p>
            {(search || activeCollection !== 'Todos' || activeMaterial !== 'Todos' || activeTag !== 'Todos' || activeTipo !== 'Todos' || activeOcasião !== 'Todos' || activeAmbiente !== 'Todos' || activePublico !== 'Todos') && (
              <motion.button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCollection('Todos');
                  setActiveMaterial('Todos');
                  setActiveTag('Todos');
                  setActiveTipo('Todos');
                  setActiveOcasião('Todos');
                  setActiveAmbiente('Todos');
                  setActivePublico('Todos');
                }}
                className="mt-6 rounded-full px-6 py-3 text-sm font-bold text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: accent }}
              >
                Limpar filtros
              </motion.button>
            )}
          </motion.div>
        )}
      </main>

      {/* Sobre + contato */}
      {(aboutTitle || aboutText || contactHeadline || contactText) && (
        <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
            {(aboutTitle || aboutText) && (
              <div>
                {aboutTitle && <h3 className="text-2xl font-black text-slate-900">{aboutTitle}</h3>}
                {aboutText && <p className="mt-4 text-base leading-relaxed text-slate-600">{aboutText}</p>}
              </div>
            )}
            {(contactHeadline || contactText) && (
              <motion.div 
                className="rounded-3xl p-8 text-white"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {contactHeadline && <h3 className="text-xl font-black">{contactHeadline}</h3>}
                {contactText && <p className="mt-3 text-base leading-relaxed text-white/90">{contactText}</p>}
                {primaryCtaUrl && (
                  <motion.a
                    href={primaryCtaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-900"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {ctaLabel}
                  </motion.a>
                )}
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Rodapé */}
      <footer className="px-6 py-10 text-center text-white" style={{ backgroundColor: primaryColor }}>
        <p className="text-base font-bold">{businessName}</p>
        {footerNote && <p className="mt-2 text-sm text-white/80">{footerNote}</p>}
        <p className="mt-4 text-xs uppercase tracking-widest text-white/50">Catálogo digital</p>
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
