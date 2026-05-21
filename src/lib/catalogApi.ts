import type { CatalogSettings, Product } from '../types';

export type CatalogAdminSnapshot = {
  fileExists: boolean;
  catalogSettings: CatalogSettings;
  products: Product[];
};

export type CatalogPublicSnapshot = {
  catalogSettings: CatalogSettings;
  products: Product[];
};

type CatalogAssetUploadPayload = {
  dataUrl: string;
  fileName: string;
  folder?: string;
};

type CatalogAssetUploadResponse = {
  url: string;
};

const API_BASE_URL = (import.meta.env.VITE_CATALOG_API_URL ?? '').trim().replace(/\/+$/, '');

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
  };
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: resolveCatalogAssetUrl(product.imageUrl),
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

  return (await response.json()) as T;
}

export async function getCatalogAdminData() {
  const snapshot = await requestJson<CatalogAdminSnapshot>('/api/catalog/admin');
  return normalizeCatalogSnapshot(snapshot);
}

export async function replaceCatalogAdminData(payload: Omit<CatalogAdminSnapshot, 'fileExists'>) {
  const snapshot = await requestJson<CatalogAdminSnapshot>('/api/catalog/admin', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return normalizeCatalogSnapshot(snapshot);
}

export async function getCatalogPublicData() {
  const snapshot = await requestJson<CatalogPublicSnapshot>('/api/catalog/public');
  return normalizeCatalogSnapshot(snapshot);
}

export async function saveCatalogSettings(settings: CatalogSettings) {
  const savedSettings = await requestJson<CatalogSettings>('/api/catalog/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });

  return normalizeCatalogSettings(savedSettings);
}

export async function saveCatalogProduct(product: Product) {
  const savedProduct = await requestJson<Product>(`/api/catalog/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });

  return normalizeProduct(savedProduct);
}

export function deleteCatalogProduct(productId: string) {
  return requestJson<{ success: boolean }>(`/api/catalog/products/${productId}`, {
    method: 'DELETE',
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

  const uploadedAsset = await requestJson<CatalogAssetUploadResponse>('/api/catalog/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    url: resolveCatalogAssetUrl(uploadedAsset.url) ?? uploadedAsset.url,
  };
}
