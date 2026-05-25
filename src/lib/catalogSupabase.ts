import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

export type CatalogAssetUploadPayload = {
  dataUrl: string;
  fileName: string;
  folder?: string;
};

type CatalogProductRow = {
  id: string;
  payload: Product;
  updated_at?: string | null;
};

type CatalogSettingsRow = {
  id: string;
  payload: CatalogSettings;
  updated_at?: string | null;
};

const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
  businessName: 'Niza3D Studio',
  tagline: 'Peças impressas em 3D com acabamento premium e produção sob medida.',
  primaryColor: '#22271b',
  accentColor: '#8b9964',
  logoUrl: '',
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

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const SUPABASE_PRODUCTS_TABLE = (import.meta.env.VITE_SUPABASE_PRODUCTS_TABLE ?? 'catalog_products').trim();
const SUPABASE_SETTINGS_TABLE = (import.meta.env.VITE_SUPABASE_SETTINGS_TABLE ?? 'catalog_settings').trim();
const SUPABASE_STORAGE_BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'catalog-assets').trim();
const SUPABASE_SETTINGS_ROW_ID = 'default';

let supabaseClient: SupabaseClient | null | undefined;

function isPlaceholderSupabaseUrl(value: string) {
  return /(?:SEU|seu)-PROJETO|seu-projeto/i.test(value);
}

function isPlaceholderSupabaseAnonKey(value: string) {
  return /(?:SUA|sua)-CHAVE-ANON|sua-chave-anon/i.test(value);
}

function hasUsableSupabaseConfig() {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !isPlaceholderSupabaseUrl(SUPABASE_URL) &&
    !isPlaceholderSupabaseAnonKey(SUPABASE_ANON_KEY),
  );
}

function sanitizeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeOptionalText(value: unknown) {
  const normalizedValue = sanitizeText(value);
  return normalizedValue || undefined;
}

function sanitizeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function sanitizeBoolean(value: unknown, fallback = true) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeCatalogSettings(input: Partial<CatalogSettings> = {}): CatalogSettings {
  return {
    ...DEFAULT_CATALOG_SETTINGS,
    ...input,
    businessName: sanitizeText(input.businessName, DEFAULT_CATALOG_SETTINGS.businessName),
    tagline: sanitizeText(input.tagline, DEFAULT_CATALOG_SETTINGS.tagline),
    primaryColor: sanitizeText(input.primaryColor, DEFAULT_CATALOG_SETTINGS.primaryColor),
    accentColor: sanitizeText(input.accentColor, DEFAULT_CATALOG_SETTINGS.accentColor),
    logoUrl: sanitizeText(input.logoUrl),
    coverImageUrl: sanitizeText(input.coverImageUrl),
    announcementText: sanitizeText(input.announcementText),
    heroDescription: sanitizeText(input.heroDescription),
    highlightOne: sanitizeText(input.highlightOne),
    highlightTwo: sanitizeText(input.highlightTwo),
    highlightThree: sanitizeText(input.highlightThree),
    catalogHeadline: sanitizeText(input.catalogHeadline),
    catalogSubheadline: sanitizeText(input.catalogSubheadline),
    aboutTitle: sanitizeText(input.aboutTitle),
    aboutText: sanitizeText(input.aboutText),
    contactHeadline: sanitizeText(input.contactHeadline),
    contactText: sanitizeText(input.contactText),
    primaryCtaLabel: sanitizeText(input.primaryCtaLabel),
    primaryCtaUrl: sanitizeText(input.primaryCtaUrl),
    secondaryCtaLabel: sanitizeText(input.secondaryCtaLabel),
    secondaryCtaUrl: sanitizeText(input.secondaryCtaUrl),
    whatsapp: sanitizeText(input.whatsapp),
    instagram: sanitizeText(input.instagram),
    email: sanitizeText(input.email),
    footerNote: sanitizeText(input.footerNote),
  };
}

function normalizeProduct(input: Partial<Product> = {}): Product {
  return {
    id: sanitizeText(input.id, crypto.randomUUID()),
    name: sanitizeText(input.name, 'Produto sem nome'),
    materialType: sanitizeText(input.materialType, 'PLA'),
    description: sanitizeText(input.description),
    collection: sanitizeOptionalText(input.collection),
    sourcePath: sanitizeOptionalText(input.sourcePath),
    imageUrl: sanitizeOptionalText(input.imageUrl),
    defaultWeightG: sanitizeNumber(input.defaultWeightG),
    basePrice: sanitizeNumber(input.basePrice),
    stlUrl: sanitizeOptionalText(input.stlUrl),
    referenceUrl: sanitizeOptionalText(input.referenceUrl),
    avgPrintTimeHours: sanitizeNumber(input.avgPrintTimeHours),
    tags: sanitizeOptionalText(input.tags),
    isPublic: sanitizeBoolean(input.isPublic, true),
  };
}

function sanitizeFolderPath(folder = '') {
  return folder
    .split(/[\\/]+/)
    .map((segment) =>
      segment
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase(),
    )
    .filter(Boolean);
}

function getFileExtension(fileName = '') {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : '';
}

function inferExtension(fileName: string, mimeType: string) {
  const fileExtension = getFileExtension(fileName);
  if (fileExtension) {
    return `.${fileExtension}`;
  }

  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/avif':
      return '.avif';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.bin';
  }
}

function dataUrlToFile(dataUrl: string, fileName: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Formato de arquivo inválido para upload.');
  }

  const [, mimeType, encodedContent] = match;
  const binaryContent = atob(encodedContent);
  const bytes = Uint8Array.from(binaryContent, (character) => character.charCodeAt(0));

  return new File([bytes], fileName || 'asset', { type: mimeType });
}

function getSupabaseClient() {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  if (!hasUsableSupabaseConfig()) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

function requireSupabaseClient() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(
      'Supabase não configurado para o catálogo. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY válidos no build do frontend.',
    );
  }

  return client;
}

async function readSettingsRow(client: SupabaseClient) {
  const { data, error } = await client
    .from(SUPABASE_SETTINGS_TABLE)
    .select('id, payload, updated_at')
    .eq('id', SUPABASE_SETTINGS_ROW_ID)
    .maybeSingle<CatalogSettingsRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function readProductRows(client: SupabaseClient) {
  const { data, error } = await client
    .from(SUPABASE_PRODUCTS_TABLE)
    .select('id, payload, updated_at')
    .order('updated_at', { ascending: false })
    .returns<CatalogProductRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

function mapProductRowsToProducts(rows: CatalogProductRow[]) {
  return rows.map((row) => normalizeProduct(row.payload));
}

function mapProductToRow(product: Product): CatalogProductRow {
  return {
    id: product.id,
    payload: normalizeProduct(product),
    updated_at: new Date().toISOString(),
  };
}

export function isSupabaseCatalogConfigured() {
  return Boolean(getSupabaseClient());
}

export function getSupabaseCatalogDebugInfo() {
  let projectHost: string | undefined;

  if (hasUsableSupabaseConfig()) {
    try {
      projectHost = new URL(SUPABASE_URL).host;
    } catch {
      projectHost = SUPABASE_URL;
    }
  }

  return {
    configured: hasUsableSupabaseConfig(),
    projectHost,
    productsTable: SUPABASE_PRODUCTS_TABLE,
    settingsTable: SUPABASE_SETTINGS_TABLE,
    storageBucket: SUPABASE_STORAGE_BUCKET,
  };
}

export async function getCatalogAdminDataFromSupabase(): Promise<CatalogAdminSnapshot> {
  const client = requireSupabaseClient();
  const [settingsRow, productRows] = await Promise.all([
    readSettingsRow(client),
    readProductRows(client),
  ]);

  return {
    fileExists: Boolean(settingsRow) || productRows.length > 0,
    catalogSettings: normalizeCatalogSettings(settingsRow?.payload),
    products: mapProductRowsToProducts(productRows),
  };
}

export async function replaceCatalogAdminDataOnSupabase(
  payload: Omit<CatalogAdminSnapshot, 'fileExists'>,
): Promise<CatalogAdminSnapshot> {
  const client = requireSupabaseClient();
  const normalizedSettings = normalizeCatalogSettings(payload.catalogSettings);
  const normalizedProducts = (payload.products ?? []).map(normalizeProduct);

  const { error: settingsError } = await client
    .from(SUPABASE_SETTINGS_TABLE)
    .upsert(
      {
        id: SUPABASE_SETTINGS_ROW_ID,
        payload: normalizedSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

  if (settingsError) {
    throw settingsError;
  }

  const currentRows = await readProductRows(client);
  const currentIds = new Set(currentRows.map((row) => row.id));
  const nextIds = new Set(normalizedProducts.map((product) => product.id));
  const removedIds = Array.from(currentIds).filter((id) => !nextIds.has(id));

  if (normalizedProducts.length > 0) {
    const { error: productsError } = await client
      .from(SUPABASE_PRODUCTS_TABLE)
      .upsert(normalizedProducts.map(mapProductToRow), { onConflict: 'id' });

    if (productsError) {
      throw productsError;
    }
  }

  if (removedIds.length > 0) {
    const { error: deleteError } = await client
      .from(SUPABASE_PRODUCTS_TABLE)
      .delete()
      .in('id', removedIds);

    if (deleteError) {
      throw deleteError;
    }
  }

  return {
    fileExists: true,
    catalogSettings: normalizedSettings,
    products: normalizedProducts,
  };
}

export async function getCatalogPublicDataFromSupabase(): Promise<CatalogPublicSnapshot> {
  const snapshot = await getCatalogAdminDataFromSupabase();

  return {
    catalogSettings: snapshot.catalogSettings,
    products: snapshot.products.filter((product) => product.isPublic !== false),
  };
}

export async function saveCatalogSettingsOnSupabase(settings: CatalogSettings) {
  const client = requireSupabaseClient();
  const normalizedSettings = normalizeCatalogSettings(settings);

  const { error } = await client
    .from(SUPABASE_SETTINGS_TABLE)
    .upsert(
      {
        id: SUPABASE_SETTINGS_ROW_ID,
        payload: normalizedSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

  if (error) {
    throw error;
  }

  return normalizedSettings;
}

export async function saveCatalogProductOnSupabase(product: Product) {
  const client = requireSupabaseClient();
  const normalizedProduct = normalizeProduct(product);

  const { error } = await client
    .from(SUPABASE_PRODUCTS_TABLE)
    .upsert(mapProductToRow(normalizedProduct), { onConflict: 'id' });

  if (error) {
    throw error;
  }

  return normalizedProduct;
}

export async function deleteCatalogProductOnSupabase(productId: string) {
  const client = requireSupabaseClient();
  const { error } = await client
    .from(SUPABASE_PRODUCTS_TABLE)
    .delete()
    .eq('id', productId);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function uploadCatalogAssetToSupabase({
  dataUrl,
  fileName,
  folder = 'shared',
}: CatalogAssetUploadPayload) {
  const client = requireSupabaseClient();
  const file = dataUrlToFile(dataUrl, fileName);
  const folderSegments = sanitizeFolderPath(folder);
  const assetDirectory = folderSegments.length > 0 ? folderSegments.join('/') : 'shared';
  const extension = inferExtension(fileName, file.type);
  const filePath = `${assetDirectory}/${crypto.randomUUID()}${extension}`;

  const { error: uploadError } = await client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = client.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error('Supabase não retornou uma URL pública para o arquivo enviado.');
  }

  return {
    url: data.publicUrl,
  };
}
