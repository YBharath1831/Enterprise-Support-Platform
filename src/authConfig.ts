// Entra ID (Azure AD) config for the fde-frontend-ui SPA app registration.
// Values here are not secret (public client IDs) - safe to ship in the bundle.
import { Configuration, PopupRequest } from '@azure/msal-browser';

const TENANT_ID = import.meta.env.VITE_ENTRA_TENANT_ID || '4020cb3d-7a97-47db-a7cf-405934fdefd8';
const FRONTEND_CLIENT_ID = import.meta.env.VITE_ENTRA_FRONTEND_CLIENT_ID || '062f2032-dc9b-4d8a-9220-98a2aad645a4';
const BACKEND_CLIENT_ID = import.meta.env.VITE_ENTRA_BACKEND_CLIENT_ID || '5c31d847-4715-4e6c-83a7-22fa51eec76c';

export const msalConfig: Configuration = {
  auth: {
    clientId: FRONTEND_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

// Scope for the backend API (fde-backend-api) - this is what gets sent as the
// bearer token audience so the backend can validate it.
export const backendApiScope = `api://${BACKEND_CLIENT_ID}/access_as_user`;

export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', backendApiScope],
};

export const tokenRequest: PopupRequest = {
  scopes: [backendApiScope],
};
