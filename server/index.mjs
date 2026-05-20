import path from 'node:path';
import { existsSync } from 'node:fs';
import express from 'express';
import {
  getUploadsRootDirectory,
  mergeCatalogSettings,
  readCatalogSnapshot,
  removeCatalogProduct,
  replaceCatalogSnapshot,
  saveCatalogAsset,
  upsertCatalogProduct,
} from './catalogStore.mjs';

const app = express();
const port = Number(process.env.PORT || 4000);
const distDirectory = path.resolve(process.cwd(), 'dist');

app.use(express.json({ limit: '40mb' }));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/catalog/admin', async (_request, response, next) => {
  try {
    const snapshot = await readCatalogSnapshot();
    response.json(snapshot);
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/admin', async (request, response, next) => {
  try {
    const snapshot = await replaceCatalogSnapshot(request.body || {});
    response.json(snapshot);
  } catch (error) {
    next(error);
  }
});

app.get('/api/catalog/public', async (_request, response, next) => {
  try {
    const snapshot = await readCatalogSnapshot();
    response.json({
      catalogSettings: snapshot.catalogSettings,
      products: snapshot.products.filter((product) => product.isPublic !== false),
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/settings', async (request, response, next) => {
  try {
    const settings = await mergeCatalogSettings(request.body || {});
    response.json(settings);
  } catch (error) {
    next(error);
  }
});

app.put('/api/catalog/products/:productId', async (request, response, next) => {
  try {
    const product = await upsertCatalogProduct({
      ...(request.body || {}),
      id: request.params.productId,
    });
    response.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/catalog/products/:productId', async (request, response, next) => {
  try {
    const result = await removeCatalogProduct(request.params.productId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/catalog/assets', async (request, response, next) => {
  try {
    const asset = await saveCatalogAsset(request.body || {});
    response.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

app.use('/uploads', express.static(getUploadsRootDirectory()));

if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory));

  app.get(['/catalogo', '/catalogo.html'], (_request, response) => {
    response.sendFile(path.join(distDirectory, 'catalogo.html'));
  });

  app.get('*', (_request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);

  const message = error instanceof Error ? error.message : 'Erro interno no servidor.';
  response.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`Catálogo público disponível em http://localhost:${port}/catalogo`);
});
