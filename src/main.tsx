import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

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
      <App />
    </Auth0Provider>
  </React.StrictMode>
)
