import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Register Service Worker only when not inside an iframe (like AI Studio preview)
if ('serviceWorker' in navigator) {
  const isInsideIframe = window.self !== window.top;
  if (isInsideIframe) {
    // When embedded in AI Studio preview iframe, unregister SW to prevent interference with Vite dev server
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  } else {
    // In standalone PWA or direct browser tab, register SW cleanly
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


