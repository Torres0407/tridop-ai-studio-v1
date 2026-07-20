import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// OAuth popup window callback listener: if running inside an OAuth popup window, post message to parent and close window
if (typeof window !== 'undefined' && window.opener) {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    try {
      window.opener.postMessage({ type: 'OAUTH_CODE', code }, window.location.origin);
      window.close();
    } catch (e) {
      console.error('OAuth popup message error:', e);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
