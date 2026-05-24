import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_ROOT_DIR = path.resolve(process.cwd(), 'uploads');
const CATALOG_UPLOADS_DIR = path.join(UPLOADS_ROOT_DIR, 'catalog');
const CATALOG_FILE_PATH = path.join(DATA_DIR, 'catalog.json');

const DEFAULT_CATALOG_SETTINGS = {
  businessName: 'Niza3D Studio',
  tagline: 'Impressão 3D com qualidade e precisão',
  primaryColor: '#1e293b',
  accentColor: '#3b82f6',
  logoUrl: '',
  coverImageUrl: '',
  announcementText: 'Projetos personalizados, produção sob demanda e acabamento profissional.',
  heroDescription: 'Transformamos ideias em peças impressas em 3D com acabamento limpo, orientação técnica e atendimento próximo.',
  highlightOne: 'Modelos decorativos e funcionais',
  highlightTwo: 'Orçamento rápido pelo WhatsApp',
  highlightThree: 'Produção sob demanda',
  catalogHeadline: 'Coleções em destaque',
  catalogSubheadline: 'Escolha uma categoria, explore os modelos e fale com a gente para personalizar medidas, cor e acabamento.',
  aboutTitle: 'Por que escolher nossa empresa',
  aboutText: 'Apresente aqui o diferencial da sua empresa, materiais disponíveis, tempo médio de produção e o tipo de projeto que vocês atendem melhor.',
  contactHeadline: 'Vamos tirar seu projeto do papel',
  contactText: 'Use os botões de contato para pedir orçamento, confirmar prazo ou falar sobre personalização.',
  primaryCtaLabel: 'Solicitar orçamento',
  primaryCtaUrl: '',
  secondaryCtaLabel: 'Ver Instagram',
  secondaryCtaUrl: '',
  whatsapp: '',
  instagram: '',
  email: '',
  footerNote: '',
};

const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

function sanitizeText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeOptionalText(value) {
  const normalized = sanitizeText(value);
  return normalized || undefined;
}

function sanitizeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function sanitizeBoolean(value, fallback = true) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeCatalogSettings(input = {}) {
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

function normalizeProduct(product = {}) {
  return {
    id: sanitizeText(product.id, crypto.randomUUID()),
    name: sanitizeText(product.name, 'Produto sem nome'),
    materialType: sanitizeText(product.materialType, 'PLA'),
    description: sanitizeText(product.description),
    collection: sanitizeOptionalText(product.collection),
    sourcePath: sanitizeOptionalText(product.sourcePath),
    imageUrl: sanitizeOptionalText(product.imageUrl),
    defaultWeightG: sanitizeNumber(product.defaultWeightG),
    basePrice: sanitizeNumber(product.basePrice),
    stlUrl: sanitizeOptionalText(product.stlUrl),
    referenceUrl: sanitizeOptionalText(product.referenceUrl),
    avgPrintTimeHours: sanitizeNumber(product.avgPrintTimeHours),
    tags: sanitizeOptionalText(product.tags),
    isPublic: sanitizeBoolean(product.isPublic, true),
  };
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function writeCatalogSnapshot(snapshot) {
  const normalizedSnapshot = {
    catalogSettings: normalizeCatalogSettings(snapshot.catalogSettings),
    products: Array.isArray(snapshot.products) ? snapshot.products.map(normalizeProduct) : [],
    updatedAt: new Date().toISOString(),
  };

  await ensureDirectory(DATA_DIR);

  const tempFilePath = `${CATALOG_FILE_PATH}.tmp`;
  await fs.writeFile(tempFilePath, JSON.stringify(normalizedSnapshot, null, 2), 'utf8');
  await fs.rename(tempFilePath, CATALOG_FILE_PATH);

  return normalizedSnapshot;
}

export async function readCatalogSnapshot() {
  try {
    const rawCatalog = await fs.readFile(CATALOG_FILE_PATH, 'utf8');
    const parsedCatalog = JSON.parse(rawCatalog);

    return {
      fileExists: true,
      catalogSettings: normalizeCatalogSettings(parsedCatalog.catalogSettings),
      products: Array.isArray(parsedCatalog.products)
        ? parsedCatalog.products.map(normalizeProduct)
        : [],
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {
        fileExists: false,
        catalogSettings: { ...DEFAULT_CATALOG_SETTINGS },
        products: [],
      };
    }

    throw error;
  }
}

export async function replaceCatalogSnapshot(snapshot = {}) {
  const writtenSnapshot = await writeCatalogSnapshot(snapshot);

  return {
    fileExists: true,
    catalogSettings: writtenSnapshot.catalogSettings,
    products: writtenSnapshot.products,
  };
}

export async function upsertCatalogProduct(product) {
  const currentSnapshot = await readCatalogSnapshot();
  const normalizedProduct = normalizeProduct(product);

  const nextProducts = currentSnapshot.products.some((currentProduct) => currentProduct.id === normalizedProduct.id)
    ? currentSnapshot.products.map((currentProduct) =>
        currentProduct.id === normalizedProduct.id ? normalizedProduct : currentProduct,
      )
    : [normalizedProduct, ...currentSnapshot.products];

  await writeCatalogSnapshot({
    catalogSettings: currentSnapshot.catalogSettings,
    products: nextProducts,
  });

  return normalizedProduct;
}

export async function removeCatalogProduct(productId) {
  const currentSnapshot = await readCatalogSnapshot();
  const nextProducts = currentSnapshot.products.filter((product) => product.id !== productId);

  await writeCatalogSnapshot({
    catalogSettings: currentSnapshot.catalogSettings,
    products: nextProducts,
  });

  return { success: true };
}

export async function mergeCatalogSettings(partialSettings = {}) {
  const currentSnapshot = await readCatalogSnapshot();
  const nextSettings = {
    ...currentSnapshot.catalogSettings,
    ...partialSettings,
  };

  const writtenSnapshot = await writeCatalogSnapshot({
    catalogSettings: nextSettings,
    products: currentSnapshot.products,
  });

  return writtenSnapshot.catalogSettings;
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

function inferExtension(fileName, mimeType) {
  const parsedExtension = path.extname(fileName || '').toLowerCase();
  if (parsedExtension) {
    return parsedExtension;
  }

  return MIME_EXTENSION_MAP[mimeType] || '.bin';
}

export async function saveCatalogAsset({ dataUrl, fileName, folder = 'shared' }) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Formato de arquivo inválido para upload.');
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Falha ao interpretar o arquivo enviado.');
  }

  const [, mimeType, encodedContent] = match;
  const folderSegments = sanitizeFolderPath(folder);
  const resolvedFolderSegments = folderSegments.length > 0 ? folderSegments : ['shared'];
  const relativeFolder = resolvedFolderSegments.join('/');
  const extension = inferExtension(fileName, mimeType);
  const assetName = `${crypto.randomUUID()}${extension}`;

  const absoluteDirectory = path.join(CATALOG_UPLOADS_DIR, ...resolvedFolderSegments);
  const absoluteFilePath = path.join(absoluteDirectory, assetName);

  await ensureDirectory(absoluteDirectory);
  await fs.writeFile(absoluteFilePath, Buffer.from(encodedContent, 'base64'));

  return {
    url: `/uploads/catalog/${relativeFolder}/${assetName}`.replace(/\\/g, '/'),
  };
}

export function getUploadsRootDirectory() {
  return UPLOADS_ROOT_DIR;
}
