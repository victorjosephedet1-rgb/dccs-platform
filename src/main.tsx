import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

function AppWrapper() {
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
      }, 100);
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
