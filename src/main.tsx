import Secured from '@/components/common/Secured'
import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'preline'

import App from './App'
import './index.css'
import ColorSchemeContextProvider from '@/context/ColorSchemeContext'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain="mimir.au.auth0.com"
      clientId="5bnYWyx1ZHS2zjkfIKDx3H87GNDy7gvK"
      authorizationParams={{
        audience: `https://api.mimir`,
        scope: 'write:chatgpt',
        redirect_uri: window.location.origin
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Secured>
          <ColorSchemeContextProvider>
            <App />
          </ColorSchemeContextProvider>
        </Secured>
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
)
