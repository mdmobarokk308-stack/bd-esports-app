import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Force purge any old Service Workers or stale browser caches so updates appear instantly
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  } catch {}

  if ('caches' in window) {
    try {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name).catch(() => {});
        }
      }).catch(() => {});
    } catch {}
  }
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


