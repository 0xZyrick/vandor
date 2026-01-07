// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App.tsx'
// import { StarknetProvider }  from './StarknetProvider.tsx'
// import './index.css'
// import { ExtendedExchangeProvider } from './contexts/ExtendedExchangeContext.tsx';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <StarknetProvider>
//       <ExtendedExchangeProvider>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>        
//       </ExtendedExchangeProvider>
//     </StarknetProvider>
//   </React.StrictMode>,
// )

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { StarknetProvider } from './StarknetProvider.tsx'
import './index.css'
import { ExtendedExchangeProvider } from './contexts/ExtendedExchangeContext.tsx'

// NUCLEAR OPTION: Intercept ALL fetches
const originalFetch = window.fetch;

window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;

  // Convert input to string
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = String(input);
  }

  // If it's trying to hit the Extended Exchange API directly, FORCE it through proxy
  if (url.includes('api.starknet.extended.exchange')) {
    const path = url.replace(/^https?:\/\/api\.starknet\.extended\.exchange/, '');
    const proxiedUrl = path.startsWith('/api') ? path : `/api${path}`;
    
    console.log('🚨 BLOCKED DIRECT API CALL');
    console.log('❌ Original:', url);
    console.log('✅ Proxied:', proxiedUrl);
    
    return originalFetch(proxiedUrl, init);
  }

  // All other fetches go through normally
  return originalFetch(input, init);
};

console.log('🛡️ Fetch interceptor installed');

// Render App
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