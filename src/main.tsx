import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { StarknetProvider }  from './StarknetProvider.tsx'
import './index.css'
import { ExtendedExchangeProvider } from './contexts/ExtendedExchangeContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StarknetProvider>
      <ExtendedExchangeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>        
      </ExtendedExchangeProvider>
    </StarknetProvider>
  </React.StrictMode>,
)