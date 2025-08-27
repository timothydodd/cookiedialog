---
title: React Integration
description: How to integrate CookieDialog with React applications
---

# React Integration

CookieDialog can be easily integrated into React applications with hooks and components.

## Basic Integration

### Using useEffect Hook

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize CookieDialog when component mounts
    const dialog = CookieDialog.init({
      position: 'bottom',
      theme: 'light',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ],
      onAccept: (consent) => {
        console.log('Consent accepted:', consent);
      }
    });

    // Cleanup on unmount
    return () => {
      dialog.destroy();
    };
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Your app content */}
    </div>
  );
}
```

## Custom Hook

Create a reusable hook for cookie consent:

```jsx
// hooks/useCookieConsent.js
import { useState, useEffect, useCallback } from 'react';

export function useCookieConsent(config = {}) {
  const [consent, setConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const cookieDialog = CookieDialog.init({
      ...config,
      onAccept: (consentData) => {
        setConsent(consentData);
        config.onAccept?.(consentData);
      },
      onReject: (consentData) => {
        setConsent(consentData);
        config.onReject?.(consentData);
      },
      onChange: (consentData) => {
        setConsent(consentData);
        config.onChange?.(consentData);
      },
      onInit: (hasExistingConsent) => {
        if (hasExistingConsent) {
          setConsent(cookieDialog.getConsent());
        }
        setIsLoading(false);
        config.onInit?.(hasExistingConsent);
      }
    });

    setDialog(cookieDialog);

    return () => {
      cookieDialog.destroy();
    };
  }, []);

  const showSettings = useCallback(() => {
    dialog?.show();
  }, [dialog]);

  const resetConsent = useCallback(() => {
    dialog?.resetConsent();
    setConsent(null);
  }, [dialog]);

  const getCategoryConsent = useCallback((category) => {
    return dialog?.getCategoryConsent(category) || false;
  }, [dialog]);

  return {
    consent,
    isLoading,
    showSettings,
    resetConsent,
    getCategoryConsent,
    hasConsent: consent !== null
  };
}
```

### Using the Custom Hook

```jsx
// components/App.js
import { useCookieConsent } from '../hooks/useCookieConsent';
import GoogleAnalytics from './GoogleAnalytics';

function App() {
  const { consent, isLoading, showSettings, getCategoryConsent } = useCookieConsent({
    position: 'bottom',
    theme: 'light',
    categories: [
      { id: 'necessary', name: 'Essential', required: true },
      { id: 'analytics', name: 'Analytics', required: false }
    ]
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header>
        <h1>My App</h1>
        <button onClick={showSettings}>
          Cookie Settings
        </button>
      </header>

      <main>
        {/* Conditionally render analytics component */}
        {getCategoryConsent('analytics') && <GoogleAnalytics />}
        
        {/* Your app content */}
      </main>
    </div>
  );
}
```

## React Context Provider

Create a context for managing cookie consent across your app:

```jsx
// context/CookieConsentContext.js
import { createContext, useContext, useProvider } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookieConsentContext = createContext();

export function CookieConsentProvider({ children, config }) {
  const cookieConsent = useCookieConsent(config);

  return (
    <CookieConsentContext.Provider value={cookieConsent}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsentContext() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider');
  }
  return context;
}
```

### Using the Context

```jsx
// App.js
import { CookieConsentProvider } from './context/CookieConsentContext';
import MainApp from './components/MainApp';

function App() {
  const cookieConfig = {
    position: 'bottom',
    theme: 'light',
    enableLocation: true,
    categories: [
      { id: 'necessary', name: 'Essential', required: true },
      { id: 'analytics', name: 'Analytics', required: false },
      { id: 'marketing', name: 'Marketing', required: false }
    ]
  };

  return (
    <CookieConsentProvider config={cookieConfig}>
      <MainApp />
    </CookieConsentProvider>
  );
}

// components/MainApp.js
import { useCookieConsentContext } from '../context/CookieConsentContext';

function MainApp() {
  const { consent, showSettings, getCategoryConsent } = useCookieConsentContext();

  return (
    <div>
      <nav>
        <button onClick={showSettings}>Cookie Preferences</button>
      </nav>
      
      {getCategoryConsent('analytics') && (
        <AnalyticsComponent />
      )}
      
      {getCategoryConsent('marketing') && (
        <MarketingComponent />
      )}
    </div>
  );
}
```

## Component-Based Approach

Create dedicated components for different services:

```jsx
// components/ConditionalService.js
import { useCookieConsentContext } from '../context/CookieConsentContext';

function ConditionalService({ category, fallback = null, children }) {
  const { getCategoryConsent } = useCookieConsentContext();

  if (getCategoryConsent(category)) {
    return children;
  }

  return fallback;
}

// components/GoogleAnalytics.js
function GoogleAnalytics() {
  useEffect(() => {
    // Initialize Google Analytics
    gtag('config', 'GA_MEASUREMENT_ID');
  }, []);

  return null; // This component doesn't render anything
}

// Usage in your app
function App() {
  return (
    <div>
      <ConditionalService 
        category="analytics"
        fallback={<div>Analytics disabled</div>}
      >
        <GoogleAnalytics />
      </ConditionalService>

      <ConditionalService category="marketing">
        <FacebookPixel />
        <GoogleAds />
      </ConditionalService>
    </div>
  );
}
```

## Next.js Integration

For Next.js applications:

```jsx
// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const dialog = CookieDialog.init({
      position: 'bottom',
      theme: 'light',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false }
      ],
      onAccept: (consent) => {
        if (consent.categories.analytics) {
          // Initialize analytics for Next.js
          import('gtag').then(({ gtag }) => {
            gtag('config', 'GA_MEASUREMENT_ID');
          });
        }
      }
    });

    return () => dialog.destroy();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

## TypeScript Support

For TypeScript projects:

```typescript
// types/cookie-consent.ts
interface ConsentData {
  timestamp: number;
  expires: number;
  categories: Record<string, boolean>;
  version: string;
}

interface CookieDialogConfig {
  position?: 'top' | 'bottom' | 'center';
  theme?: 'light' | 'dark';
  enableLocation?: boolean;
  categories?: Array<{
    id: string;
    name: string;
    required: boolean;
    description?: string;
  }>;
  onAccept?: (consent: ConsentData) => void;
  onReject?: (consent: ConsentData) => void;
  onChange?: (consent: ConsentData) => void;
}

// hooks/useCookieConsent.ts
import { useState, useEffect, useCallback } from 'react';

export function useCookieConsent(config: CookieDialogConfig = {}) {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ... rest of the hook implementation with proper types
}
```

## Testing

Test your React integration:

```jsx
// __tests__/CookieConsent.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { useCookieConsent } from '../hooks/useCookieConsent';

// Mock CookieDialog
jest.mock('cookiedialog', () => ({
  init: jest.fn(() => ({
    getConsent: jest.fn(() => ({
      categories: { analytics: true, marketing: false }
    })),
    show: jest.fn(),
    destroy: jest.fn(),
    getCategoryConsent: jest.fn((category) => category === 'analytics')
  }))
}));

function TestComponent() {
  const { getCategoryConsent, showSettings } = useCookieConsent();
  
  return (
    <div>
      <div data-testid="analytics-status">
        {getCategoryConsent('analytics') ? 'enabled' : 'disabled'}
      </div>
      <button onClick={showSettings}>Settings</button>
    </div>
  );
}

test('should show analytics status based on consent', () => {
  render(<TestComponent />);
  
  expect(screen.getByTestId('analytics-status')).toHaveTextContent('enabled');
});
```