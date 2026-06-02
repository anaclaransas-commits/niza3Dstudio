import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/design-tokens.css';
import { StoreProvider } from './store';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Elemento #root não encontrado!');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <StoreProvider>
        <App />
      </StoreProvider>
    </StrictMode>,
  );
}
