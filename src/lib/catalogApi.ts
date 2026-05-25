import type { CatalogSettings, Product } from '../types';
import {
  deleteCatalogProductOnSupabase,
  getCatalogAdminDataFromSupabase,
  getCatalogPublicDataFromSupabase,
  getSupabaseCatalogDebugInfo,
  isSupabaseCatalogConfigured,
  replaceCatalogAdminDataOnSupabase,
  saveCatalogProductOnSupabase,
  saveCatalogSettingsOnSupabase,
  uploadCatalogAssetToSupabase,
  type CatalogAdminSnapshot,
  type CatalogAssetUploadPayload,
  type CatalogPublicSnapshot,
} from './catalogSupabase';

type CatalogAssetUploadResponse = {
  url: string;
};

const API_BASE_URL = (import.meta.env.VITE_CATALOG_API_URL ?? '').trim().replace(/\/+$/, '');

export function getCatalogBackendDebugInfo() {
  const supabase = getSupabaseCatalogDebugInfo();

  return {
    supabase,
    apiBaseUrl: API_BASE_URL || undefined,
    sharedBackendAvailable: supabase.configured || Boolean(API_BASE_URL),
  };
}

function createCatalogBackendError(operation: string, errors: unknown[]) {
  if (errors.length === 0) {
    return new Error(
      `Nenhum backend compartilhado do catálogo está disponível para ${operation}. Configure o Supabase ou rode a API Node do catálogo.`,
    );
  }

  const messages = errors
    .map((error) => (error instanceof Error ? error.message : String(error)))
    .filter(Boolean);

  const uniqueMessages = Array.from(new Set(messages));

  return new Error(
    uniqueMessages.length > 0
      ? uniqueMessages.join(' | ')
      : `Falha ao ${operation} no catálogo compartilhado.`,
  );
}

async function runCatalogOperation<T>(
  operation: string,
  options: {
    supabase?: () => Promise<T>;
    api?: () => Promise<T>;
    fallback?: () => Promise<T> | T;
  },
) {
  const errors: unknown[] = [];

  if (isSupabaseCatalogConfigured() && options.supabase) {
    try {
      return await options.supabase();
    } catch (error) {
      errors.push(error);
    }
  }

  if (options.api) {
    try {
      return await options.api();
    } catch (error) {
      errors.push(error);
    }
  }

  if (options.fallback) {
    return await options.fallback();
  }

  throw createCatalogBackendError(operation, errors);
}

function buildApiUrl(input: RequestInfo | URL) {
  if (typeof input !== 'string') {
    return input;
  }

  if (!input.startsWith('/') || /^https?:\/\//i.test(input)) {
    return input;
  }

  return API_BASE_URL ? `${API_BASE_URL}${input}` : input;
}

export function resolveCatalogAssetUrl(url?: string) {
  if (!url) {
    return url;
  }

  if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }

  if (url.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  }

  return API_BASE_URL ? `${API_BASE_URL}/${url.replace(/^\/+/, '')}` : url;
}

function normalizeCatalogSettings(settings: CatalogSettings): CatalogSettings {
  return {
    ...settings,
    logoUrl: resolveCatalogAssetUrl(settings.logoUrl),
    coverImageUrl: resolveCatalogAssetUrl(settings.coverImageUrl),
  };
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: resolveCatalogAssetUrl(product.imageUrl),
    imageUrls: product.imageUrls?.map((url) => resolveCatalogAssetUrl(url) ?? url).filter(Boolean) as string[] | undefined,
  };
}

function normalizeCatalogSnapshot<T extends { catalogSettings: CatalogSettings; products: Product[] }>(snapshot: T): T {
  return {
    ...snapshot,
    catalogSettings: normalizeCatalogSettings(snapshot.catalogSettings),
    products: snapshot.products.map(normalizeProduct),
  };
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(input), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || `Falha na requisição (${response.status}).`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'A rota do catálogo não respondeu JSON. Se o site estiver estático, configure o Supabase ou a URL da API do catálogo.',
    );
  }

  return (await response.json()) as T;
}

export async function getCatalogAdminData() {
  const snapshot = await runCatalogOperation('carregar o catálogo administrativo', {
    supabase: () => getCatalogAdminDataFromSupabase(),
    api: () => requestJson<CatalogAdminSnapshot>('/api/catalog/admin'),
  });

  return normalizeCatalogSnapshot(snapshot);
}

export async function replaceCatalogAdminData(payload: Omit<CatalogAdminSnapshot, 'fileExists'>) {
  const snapshot = await runCatalogOperation('publicar o catálogo administrativo', {
    supabase: () => replaceCatalogAdminDataOnSupabase(payload),
    api: () =>
      requestJson<CatalogAdminSnapshot>('/api/catalog/admin', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  });

  return normalizeCatalogSnapshot(snapshot);
}

export async function getCatalogPublicData() {
  const snapshot = await runCatalogOperation('carregar o catálogo público', {
    supabase: () => getCatalogPublicDataFromSupabase(),
    api: () => requestJson<CatalogPublicSnapshot>('/api/catalog/public'),
  });

  return normalizeCatalogSnapshot(snapshot);
}

export async function saveCatalogSettings(settings: CatalogSettings) {
  const savedSettings = await runCatalogOperation('salvar as configurações do catálogo', {
    supabase: () => saveCatalogSettingsOnSupabase(settings),
    api: () =>
      requestJson<CatalogSettings>('/api/catalog/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  });

  return normalizeCatalogSettings(savedSettings);
}

export async function saveCatalogProduct(product: Product) {
  const savedProduct = await runCatalogOperation('salvar o produto no catálogo', {
    supabase: () => saveCatalogProductOnSupabase(product),
    api: () =>
      requestJson<Product>(`/api/catalog/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
  });

  return normalizeProduct(savedProduct);
}

export function deleteCatalogProduct(productId: string) {
  return runCatalogOperation('remover o produto do catálogo', {
    supabase: () => deleteCatalogProductOnSupabase(productId),
    api: () =>
      requestJson<{ success: boolean }>(`/api/catalog/products/${productId}`, {
        method: 'DELETE',
      }),
  });
}

export function uploadCatalogAsset(payload: CatalogAssetUploadPayload): Promise<CatalogAssetUploadResponse>;
export function uploadCatalogAsset(dataUrl: string, fileName: string, folder?: string): Promise<CatalogAssetUploadResponse>;

export async function uploadCatalogAsset(
  payloadOrDataUrl: CatalogAssetUploadPayload | string,
  fileName?: string,
  folder = 'shared',
) {
  const payload = typeof payloadOrDataUrl === 'string'
    ? {
        dataUrl: payloadOrDataUrl,
        fileName: fileName ?? 'asset',
        folder,
      }
    : payloadOrDataUrl;

  const asset = await runCatalogOperation('enviar a imagem do catálogo', {
    supabase: () => uploadCatalogAssetToSupabase(payload),
    api: () =>
      requestJson<CatalogAssetUploadResponse>('/api/catalog/assets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    fallback: () => ({
      url: payload.dataUrl,
    }),
  });

  return {
    url: resolveCatalogAssetUrl(asset.url) ?? asset.url,
  };
}
