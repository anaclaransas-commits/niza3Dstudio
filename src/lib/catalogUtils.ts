import type { CatalogSettings, Product } from '../types';

/** Lista única de imagens do produto (capa + galeria). */
export function getProductImages(product: Product): string[] {
  const urls = [
    product.imageUrl,
    ...(product.imageUrls ?? []),
  ].filter((url): url is string => Boolean(url?.trim()));

  return [...new Set(urls)];
}

export function sanitizeWhatsAppPhone(phone?: string): string | undefined {
  if (!phone?.trim()) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  return digits.startsWith('55') || digits.length > 11 ? digits : `55${digits}`;
}

export function createWhatsappUrl(phone?: string, productName?: string, extraNote?: string) {
  const sanitized = sanitizeWhatsAppPhone(phone);
  if (!sanitized) return undefined;

  let message = productName
    ? `Olá! Tenho interesse no produto: *${productName}*`
    : 'Olá! Vi seu catálogo e gostaria de conversar.';

  if (extraNote?.trim()) {
    message += `\n\n${extraNote.trim()}`;
  }

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}

export function getPrimaryCtaUrl(settings: CatalogSettings): string | undefined {
  if (settings.primaryCtaUrl?.trim()) {
    return settings.primaryCtaUrl.trim();
  }
  return createWhatsappUrl(settings.whatsapp);
}

export function getSecondaryCtaUrl(settings: CatalogSettings): string | undefined {
  if (settings.secondaryCtaUrl?.trim()) {
    return settings.secondaryCtaUrl.trim();
  }
  const ig = settings.instagram?.trim();
  if (ig) {
    const handle = ig.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '');
    return `https://instagram.com/${handle}`;
  }
  if (settings.email?.trim()) {
    return `mailto:${settings.email.trim()}`;
  }
  return undefined;
}

export function lightenHex(hex: string, amount = 0.92) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return '#f1f5f9';
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

export function formatCurrencyBRL(value: number) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

export const MATERIAL_BADGE: Record<string, string> = {
  PLA: '#22c55e',
  ABS: '#f97316',
  PETG: '#3b82f6',
  TPU: '#a855f7',
  Resina: '#ec4899',
  SLA: '#ec4899',
};
