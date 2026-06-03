/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EcommercePlatform = 'shopify' | 'mercadolivre' | 'custom';

export interface EcommerceConfig {
  platform: EcommercePlatform;
  apiKey?: string;
  storeUrl?: string;
  enabled: boolean;
}

export interface ProductSync {
  productId: string;
  externalId?: string;
  syncedAt?: Date;
  status: 'synced' | 'pending' | 'error';
}

/**
 * Sincroniza produto com plataforma de e-commerce
 */
export async function syncProductToEcommerce(
  product: any,
  config: EcommerceConfig
): Promise<ProductSync> {
  if (!config.enabled) {
    return {
      productId: product.id,
      status: 'pending',
    };
  }

  try {
    switch (config.platform) {
      case 'shopify':
        return await syncToShopify(product, config);
      case 'mercadolivre':
        return await syncToMercadoLivre(product, config);
      default:
        throw new Error('Plataforma não suportada');
    }
  } catch (error) {
    console.error('Erro ao sincronizar produto:', error);
    return {
      productId: product.id,
      status: 'error',
    };
  }
}

/**
 * Sincroniza com Shopify
 */
async function syncToShopify(product: any, config: EcommerceConfig): Promise<ProductSync> {
  // Implementação básica para Shopify API
  // Em produção, isso usaria a Shopify REST Admin API
  const response = await fetch(`${config.storeUrl}/admin/api/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.apiKey || '',
    },
    body: JSON.stringify({
      product: {
        title: product.name,
        body_html: product.description,
        vendor: 'Niza3D Studio',
        product_type: product.materialType,
        variants: [
          {
            price: product.basePrice || 0,
            sku: product.id,
            inventory_quantity: 999,
          },
        ],
        images: product.imageUrl ? [{ src: product.imageUrl }] : [],
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar com Shopify');
  }

  const data = await response.json();
  return {
    productId: product.id,
    externalId: data.product.id.toString(),
    syncedAt: new Date(),
    status: 'synced',
  };
}

/**
 * Sincroniza com Mercado Livre
 */
async function syncToMercadoLivre(product: any, config: EcommerceConfig): Promise<ProductSync> {
  // Implementação básica para Mercado Livre API
  // Em produção, isso usaria a API do Mercado Livre
  const response = await fetch('https://api.mercadolibre.com/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      title: product.name,
      description: product.description,
      price: product.basePrice || 0,
      currency_id: 'BRL',
      available_quantity: 999,
      buying_mode: 'buy_it_now',
      listing_type_id: 'gold_special',
      condition: 'new',
      pictures: product.imageUrl ? [{ source: product.imageUrl }] : [],
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar com Mercado Livre');
  }

  const data = await response.json();
  return {
    productId: product.id,
    externalId: data.id.toString(),
    syncedAt: new Date(),
    status: 'synced',
  };
}

/**
 * Exporta catálogo para formato CSV compatível com e-commerce
 */
export function exportCatalogForEcommerce(products: any[]): string {
  const headers = ['ID', 'Nome', 'Descrição', 'Preço', 'Material', 'Coleção', 'Imagem', 'Tags'];
  const rows = products.map(product => [
    product.id,
    product.name,
    product.description || '',
    product.basePrice || 0,
    product.materialType,
    product.collection || '',
    product.imageUrl || '',
    product.tags || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
