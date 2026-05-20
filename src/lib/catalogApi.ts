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
  folder: string;
};

type CatalogAssetUploadResponse = {
  url: string;
};

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || `Falha na requisição (${response.status}).`);
  }

  return (await response.json()) as T;
}

export function getCatalogAdminData() {
  return requestJson<CatalogAdminSnapshot>('/api/catalog/admin');
}

export function replaceCatalogAdminData(payload: Omit<CatalogAdminSnapshot, 'fileExists'>) {
  return requestJson<CatalogAdminSnapshot>('/api/catalog/admin', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getCatalogPublicData() {
  return requestJson<CatalogPublicSnapshot>('/api/catalog/public');
}

export function saveCatalogSettings(settings: CatalogSettings) {
  return requestJson<CatalogSettings>('/api/catalog/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function saveCatalogProduct(product: Product) {
  return requestJson<Product>(`/api/catalog/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export function deleteCatalogProduct(productId: string) {
  return requestJson<{ success: boolean }>(`/api/catalog/products/${productId}`, {
    method: 'DELETE',
  });
}

export function uploadCatalogAsset(payload: CatalogAssetUploadPayload) {
  return requestJson<CatalogAssetUploadResponse>('/api/catalog/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
