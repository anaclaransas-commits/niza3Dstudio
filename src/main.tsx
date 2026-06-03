import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/design-tokens.css';
import { StoreProvider } from './store';
import { ThemeProvider } from './contexts/ThemeContext';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error)
      })
  })
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Elemento #root não encontrado!');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
