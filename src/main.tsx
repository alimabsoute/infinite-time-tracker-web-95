
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🔍 Main - React imported successfully:', !!React);
console.log('🔍 Main - React hooks available:', !!React.useState, !!React.useEffect);

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
