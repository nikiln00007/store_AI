import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
