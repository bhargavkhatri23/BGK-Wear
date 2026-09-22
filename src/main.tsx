import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAdMob } from './services/adService';

initializeAdMob();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA compatibility & offline caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('BGK WEAR PWA Service Worker active:', registration.scope);
          
          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New BGK WEAR version available for offline use.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('BGK WEAR Service Worker registration note:', error);
        });
    } catch (e) {
      console.warn('Service Worker registration skipped:', e);
    }
  });
}

