import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CatalogPublic } from './components/CatalogPublic';

const rootElement = document.getElementById('catalog-root');

if (!rootElement) {
  console.error('Elemento #catalog-root não encontrado!');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <CatalogPublic />
    </StrictMode>,
  );
}
