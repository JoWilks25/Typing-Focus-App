import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css'; // Import fonts before App
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
