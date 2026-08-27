import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PublicClientApplication, EventType} from '@azure/msal-browser';
import {MsalProvider} from '@azure/msal-react';
import App from './App.tsx';
import {msalConfig} from './authConfig.ts';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

// Keep MSAL's "active account" pointed at whoever just signed in, so
// acquireTokenSilent() in LiveChatInterface knows who to get a token for.
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    // @ts-ignore - payload is AuthenticationResult on login success
    msalInstance.setActiveAccount(event.payload.account);
  }
});

const existingAccounts = msalInstance.getAllAccounts();
if (existingAccounts.length > 0) {
  msalInstance.setActiveAccount(existingAccounts[0]);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
);
