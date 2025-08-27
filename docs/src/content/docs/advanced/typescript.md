---
title: TypeScript Support
description: Complete TypeScript integration guide for CookieDialog
---

# TypeScript Support

CookieDialog provides comprehensive TypeScript support with full type definitions and interfaces.

## Installation with Types

When installing via NPM, TypeScript definitions are included:

```bash
npm install cookiedialog
```

## Type Definitions

### Core Interfaces

```typescript
// Basic configuration interface
interface CookieDialogConfig {
  position?: 'top' | 'bottom' | 'center';
  theme?: 'light' | 'dark';
  enableLocation?: boolean;
  locationEndpoint?: string;
  forceShow?: boolean;
  showSettingsButton?: boolean;
  expiryDays?: number;
  storageKey?: string;
  privacyUrl?: string;
  categories?: CookieCategory[];
  texts?: DialogTexts;
  onAccept?: (consent: ConsentData) => void;
  onReject?: (consent: ConsentData) => void;
  onChange?: (consent: ConsentData) => void;
  onInit?: (hasExistingConsent: boolean) => void;
}

// Cookie category interface
interface CookieCategory {
  id: string;
  name: string;
  required: boolean;
  description?: string;
}

// Consent data interface
interface ConsentData {
  timestamp: number;
  expires: number;
  categories: Record<string, boolean>;
  version: string;
}

// Text customization interface
interface DialogTexts {
  title?: string;
  description?: string;
  acceptAll?: string;
  rejectAll?: string;
  manageSettings?: string;
  save?: string;
  close?: string;
  necessary?: string;
  analytics?: string;
  marketing?: string;
  privacyPolicy?: string;
}

// Main CookieDialog class interface
interface CookieDialogInstance {
  show(): CookieDialogInstance;
  hide(): CookieDialogInstance;
  getConsent(): ConsentData | null;
  hasConsent(): boolean;
  getCategoryConsent(categoryId: string): boolean;
  resetConsent(): CookieDialogInstance;
  destroy(): void;
  isVisible(): boolean;
  on(event: DialogEvent, callback: EventCallback): CookieDialogInstance;
  off(event: DialogEvent, callback: EventCallback): CookieDialogInstance;
}

// Event types
type DialogEvent = 'accept' | 'reject' | 'change' | 'show' | 'hide';
type EventCallback = (data: ConsentData) => void;
```

### Static Interface

```typescript
interface CookieDialogStatic {
  init(config?: CookieDialogConfig): CookieDialogInstance;
  version: string;
  isInitialized(): boolean;
}

declare global {
  interface Window {
    CookieDialog: CookieDialogStatic;
  }
}
```

## Basic TypeScript Usage

### Simple Implementation

```typescript
import CookieDialog from 'cookiedialog';
import type { CookieDialogConfig, ConsentData } from 'cookiedialog';

const config: CookieDialogConfig = {
  position: 'bottom',
  theme: 'light',
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false },
    { id: 'marketing', name: 'Marketing', required: false }
  ],
  onAccept: (consent: ConsentData) => {
    console.log('Consent accepted:', consent);
    handleConsentChange(consent);
  }
};

const dialog = CookieDialog.init(config);

function handleConsentChange(consent: ConsentData): void {
  if (consent.categories.analytics) {
    enableAnalytics();
  }
  
  if (consent.categories.marketing) {
    enableMarketing();
  }
}
```

### React with TypeScript

```typescript
// hooks/useCookieConsent.ts
import { useState, useEffect, useCallback } from 'react';
import CookieDialog from 'cookiedialog';
import type { 
  CookieDialogConfig, 
  ConsentData, 
  CookieDialogInstance 
} from 'cookiedialog';

interface UseCookieConsentReturn {
  consent: ConsentData | null;
  isLoading: boolean;
  showSettings: () => void;
  resetConsent: () => void;
  getCategoryConsent: (category: string) => boolean;
  hasConsent: boolean;
}

export function useCookieConsent(
  config: CookieDialogConfig = {}
): UseCookieConsentReturn {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dialog, setDialog] = useState<CookieDialogInstance | null>(null);

  useEffect(() => {
    const cookieDialog = CookieDialog.init({
      ...config,
      onAccept: (consentData: ConsentData) => {
        setConsent(consentData);
        config.onAccept?.(consentData);
      },
      onReject: (consentData: ConsentData) => {
        setConsent(consentData);
        config.onReject?.(consentData);
      },
      onChange: (consentData: ConsentData) => {
        setConsent(consentData);
        config.onChange?.(consentData);
      },
      onInit: (hasExistingConsent: boolean) => {
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

  const showSettings = useCallback((): void => {
    dialog?.show();
  }, [dialog]);

  const resetConsent = useCallback((): void => {
    dialog?.resetConsent();
    setConsent(null);
  }, [dialog]);

  const getCategoryConsent = useCallback((category: string): boolean => {
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

### Service Class Pattern

```typescript
// services/CookieConsentService.ts
import CookieDialog from 'cookiedialog';
import type { 
  CookieDialogConfig, 
  ConsentData, 
  CookieDialogInstance,
  CookieCategory 
} from 'cookiedialog';

export class CookieConsentService {
  private dialog: CookieDialogInstance | null = null;
  private listeners: Map<string, Set<(consent: ConsentData) => void>> = new Map();

  constructor(private defaultConfig: CookieDialogConfig = {}) {}

  public init(config: CookieDialogConfig = {}): void {
    if (this.dialog) {
      console.warn('CookieDialog already initialized');
      return;
    }

    const mergedConfig: CookieDialogConfig = {
      ...this.defaultConfig,
      ...config,
      onAccept: (consent: ConsentData) => {
        this.notifyListeners('accept', consent);
        config.onAccept?.(consent);
      },
      onReject: (consent: ConsentData) => {
        this.notifyListeners('reject', consent);
        config.onReject?.(consent);
      },
      onChange: (consent: ConsentData) => {
        this.notifyListeners('change', consent);
        config.onChange?.(consent);
      }
    };

    this.dialog = CookieDialog.init(mergedConfig);
  }

  public addEventListener(
    event: string, 
    callback: (consent: ConsentData) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public removeEventListener(
    event: string, 
    callback: (consent: ConsentData) => void
  ): void {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, consent: ConsentData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(consent));
    }
  }

  public showSettings(): void {
    this.dialog?.show();
  }

  public getConsent(): ConsentData | null {
    return this.dialog?.getConsent() || null;
  }

  public getCategoryConsent(categoryId: string): boolean {
    return this.dialog?.getCategoryConsent(categoryId) || false;
  }

  public hasConsent(): boolean {
    return this.dialog?.hasConsent() || false;
  }

  public resetConsent(): void {
    this.dialog?.resetConsent();
  }

  public destroy(): void {
    this.dialog?.destroy();
    this.dialog = null;
    this.listeners.clear();
  }
}

// Usage
const cookieService = new CookieConsentService({
  position: 'bottom',
  theme: 'light'
});

cookieService.addEventListener('accept', (consent) => {
  console.log('User accepted cookies:', consent);
});

cookieService.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ]
});
```

## Advanced Type Patterns

### Generic Service Manager

```typescript
interface Service {
  enable(): void | Promise<void>;
  disable(): void | Promise<void>;
}

class ServiceManager<T extends Record<string, Service>> {
  private services: T;

  constructor(services: T) {
    this.services = services;
  }

  async enableService<K extends keyof T>(key: K): Promise<void> {
    await this.services[key].enable();
  }

  async disableService<K extends keyof T>(key: K): Promise<void> {
    await this.services[key].disable();
  }

  async applyConsent(consent: ConsentData): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [key, service] of Object.entries(this.services)) {
      if (consent.categories[key]) {
        promises.push(service.enable());
      } else {
        promises.push(service.disable());
      }
    }

    await Promise.all(promises);
  }
}

// Usage
const serviceManager = new ServiceManager({
  analytics: {
    enable: async () => {
      const { gtag } = await import('./analytics');
      gtag('config', 'GA_MEASUREMENT_ID');
    },
    disable: () => {
      console.log('Analytics disabled');
    }
  },
  marketing: {
    enable: async () => {
      const { fbq } = await import('./marketing');
      fbq('init', 'PIXEL_ID');
    },
    disable: () => {
      console.log('Marketing disabled');
    }
  }
});

CookieDialog.init({
  onAccept: (consent) => serviceManager.applyConsent(consent)
});
```

### Strict Type Checking

```typescript
// Define specific category types
type CookieCategories = 'necessary' | 'analytics' | 'marketing' | 'personalization';

interface StrictConsentData {
  timestamp: number;
  expires: number;
  categories: Record<CookieCategories, boolean>;
  version: string;
}

interface StrictCookieCategory {
  id: CookieCategories;
  name: string;
  required: boolean;
  description?: string;
}

interface StrictCookieDialogConfig extends Omit<CookieDialogConfig, 'categories' | 'onAccept' | 'onReject' | 'onChange'> {
  categories?: StrictCookieCategory[];
  onAccept?: (consent: StrictConsentData) => void;
  onReject?: (consent: StrictConsentData) => void;
  onChange?: (consent: StrictConsentData) => void;
}

// Usage with strict typing
const strictConfig: StrictCookieDialogConfig = {
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
    // TypeScript will error if you use an invalid category ID
  ],
  onAccept: (consent) => {
    // consent.categories is now strictly typed
    if (consent.categories.analytics) {
      // This is type-safe
    }
    // consent.categories.invalidCategory would cause a TypeScript error
  }
};
```

## Declaration File

If you need to create your own declaration file:

```typescript
// types/cookiedialog.d.ts
declare module 'cookiedialog' {
  export interface CookieDialogConfig {
    position?: 'top' | 'bottom' | 'center';
    theme?: 'light' | 'dark';
    enableLocation?: boolean;
    locationEndpoint?: string;
    forceShow?: boolean;
    showSettingsButton?: boolean;
    expiryDays?: number;
    storageKey?: string;
    privacyUrl?: string;
    categories?: CookieCategory[];
    texts?: DialogTexts;
    onAccept?: (consent: ConsentData) => void;
    onReject?: (consent: ConsentData) => void;
    onChange?: (consent: ConsentData) => void;
    onInit?: (hasExistingConsent: boolean) => void;
  }

  export interface CookieCategory {
    id: string;
    name: string;
    required: boolean;
    description?: string;
  }

  export interface ConsentData {
    timestamp: number;
    expires: number;
    categories: Record<string, boolean>;
    version: string;
  }

  export interface DialogTexts {
    title?: string;
    description?: string;
    acceptAll?: string;
    rejectAll?: string;
    manageSettings?: string;
    save?: string;
    close?: string;
    necessary?: string;
    analytics?: string;
    marketing?: string;
    privacyPolicy?: string;
  }

  export interface CookieDialogInstance {
    show(): CookieDialogInstance;
    hide(): CookieDialogInstance;
    getConsent(): ConsentData | null;
    hasConsent(): boolean;
    getCategoryConsent(categoryId: string): boolean;
    resetConsent(): CookieDialogInstance;
    destroy(): void;
    isVisible(): boolean;
  }

  export interface CookieDialogStatic {
    init(config?: CookieDialogConfig): CookieDialogInstance;
    version: string;
    isInitialized(): boolean;
  }

  const CookieDialog: CookieDialogStatic;
  export default CookieDialog;
}
```

## Best Practices

1. **Use strict typing**: Define specific category types instead of strings
2. **Generic patterns**: Create reusable, type-safe service managers
3. **Null safety**: Always check for null/undefined values
4. **Error handling**: Use proper TypeScript error handling patterns
5. **Documentation**: Use TSDoc comments for better IDE support

```typescript
/**
 * Initializes cookie consent dialog with type safety
 * @param config - Configuration options for the dialog
 * @returns Promise that resolves when user makes a choice
 */
async function initializeCookieConsent(
  config: CookieDialogConfig
): Promise<ConsentData> {
  return new Promise((resolve, reject) => {
    try {
      CookieDialog.init({
        ...config,
        onAccept: resolve,
        onReject: resolve
      });
    } catch (error) {
      reject(error);
    }
  });
}
```