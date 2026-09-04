import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Unregister Service Worker and clear stale caches in dev/preview environment so Preview updates instantly
if ('serviceWorker' in navigator) {
  const isInsideIframe = window.self !== window.top || window.location.hostname.includes('ais-dev') || window.location.port === '3000';
  if (isInsideIframe || process.env.NODE_ENV !== 'production') {
    // Clear all service workers and caches in dev preview
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name).catch(() => {});
        }
      }).catch(() => {});
    }
  } else {
    // In standalone production PWA, register SW cleanly
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        console.warn('Service Worker registration skipped:', err);
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


