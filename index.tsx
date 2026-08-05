
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Telegram Mini App init (ixtiyoriy) ---
// Sayt Telegram bot tugmasi orqali ochilsa, Telegram WebApp obyekti mavjud bo'ladi.
// Oddiy brauzerda (domeningiz orqali) ochilganda bu blok shunchaki hech narsa qilmaydi.
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    tg.setHeaderColor?.('#050505');
    tg.setBackgroundColor?.('#050505');
  } catch (e) {
    console.warn('Telegram WebApp init warning:', e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
