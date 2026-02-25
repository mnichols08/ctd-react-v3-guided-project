import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './index.css';
import App from './App.jsx';
import { TodosProvider } from './context/TodosContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TodosProvider>
        <App />
      </TodosProvider>
    </BrowserRouter>
  </StrictMode>
);
