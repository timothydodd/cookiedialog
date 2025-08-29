---
title: Angular Integration
description: How to integrate CookieDialog with Angular applications using modern signals and control flow
---

# Angular Integration

CookieDialog can be integrated into Angular applications using modern signals, standalone components, and the new control flow syntax (@if, @for).

## Modern Service with Signals

```typescript
// services/cookie-consent.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';

interface ConsentData {
  timestamp: number;
  expires: number;
  categories: Record<string, boolean>;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private dialog: any;
  
  // Signals for reactive state management
  private readonly consent = signal<ConsentData | null>(null);
  private readonly isLoading = signal(true);
  
  // Computed signals for specific consent categories
  readonly hasAnalyticsConsent = computed(() => 
    this.consent()?.categories?.analytics || false
  );
  
  readonly hasMarketingConsent = computed(() => 
    this.consent()?.categories?.marketing || false
  );
  
  readonly hasNecessaryConsent = computed(() => 
    this.consent()?.categories?.necessary || false
  );
  
  readonly isDialogReady = computed(() => !this.isLoading());
  readonly currentConsent = this.consent.asReadonly();

  constructor() {
    // Effect to track consent changes
    effect(() => {
      const consentData = this.consent();
      if (consentData) {
        console.log('Consent updated:', consentData.categories);
        this.updateAnalyticsServices(consentData);
      }
    });
  }

  initDialog(config: any = {}) {
    if (this.dialog) return;

    this.dialog = (window as any).CookieDialog.init({
      position: 'bottom',
      theme: 'light',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ],
      ...config,
      onAccept: (consent: ConsentData) => {
        this.consent.set(consent);
      },
      onReject: (consent: ConsentData) => {
        this.consent.set(consent);
      },
      onChange: (consent: ConsentData) => {
        this.consent.set(consent);
      }
    });
    
    // Load analytics after CookieDialog initialization
    const hasExistingConsent = this.dialog.hasConsent();
    const existingConsent = hasExistingConsent ? this.dialog.getConsent() : null;
    
    // Initialize analytics services with current consent
    this.initializeAnalytics(existingConsent);
    
    if (existingConsent) {
      this.consent.set(existingConsent);
    }
    
    this.isLoading.set(false);
  }

  showSettings(): void {
    this.dialog?.show();
  }

  getConsent(): ConsentData | null {
    return this.dialog?.getConsent() || null;
  }

  getCategoryConsent(category: string): boolean {
    return this.dialog?.getCategoryConsent(category) || false;
  }

  resetConsent(): void {
    this.dialog?.resetConsent();
    this.consent.set(null);
  }

  destroy(): void {
    this.dialog?.destroy();
    this.dialog = null;
  }

  private initializeAnalytics(consent: ConsentData | null): void {
    // Initialize Google Analytics with consent state
    this.initializeGoogleAnalytics(consent);
    
    // Initialize Microsoft Clarity with consent state  
    this.initializeMicrosoftClarity(consent);
  }

  private initializeGoogleAnalytics(consent: ConsentData | null): void {
    if (typeof window === 'undefined' || (window as any).gtag) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'; // Replace with your GA4 ID
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      
      gtag('js', new Date());
      
      // Set consent state based on existing consent or default to denied
      const consentState = consent?.categories ? {
        'ad_storage': consent.categories.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.categories.marketing ? 'granted' : 'denied', 
        'ad_personalization': consent.categories.marketing ? 'granted' : 'denied',
        'analytics_storage': consent.categories.analytics ? 'granted' : 'denied'
      } : {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      };
      
      gtag('consent', 'default', {
        ...consentState,
        'wait_for_update': 500
      });
      
      gtag('config', 'GA_MEASUREMENT_ID', { // Replace with your GA4 ID
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=Strict;Secure'
      });
      
      console.log('✅ Google Analytics loaded with consent:', consentState);
    };
  }

  private initializeMicrosoftClarity(consent: ConsentData | null): void {
    if (typeof window === 'undefined' || (window as any).clarity) return;

    (function(c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] = c[a] || function() {
        (c[a].q = c[a].q || []).push(arguments);
      };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      
      t.onload = function() {
        console.log('✅ Microsoft Clarity script loaded');
        
        // Set consent state based on existing consent or default to denied
        setTimeout(() => {
          if ((window as any).clarity) {
            try {
              const consentState = consent?.categories ? {
                ad_storage: consent.categories.marketing ? 'granted' : 'denied',
                analytics_storage: consent.categories.analytics ? 'granted' : 'denied'
              } : {
                ad_storage: 'denied',
                analytics_storage: 'denied'
              };
              
              (window as any).clarity('consentv2', consentState);
              console.log('✅ Clarity consent initialized:', consentState);
            } catch (error) {
              console.error('❌ Error setting Clarity consent:', error);
            }
          }
        }, 100);
      };
      
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', 'YOUR_CLARITY_PROJECT_ID'); // Replace with your Clarity Project ID
  }

  private updateAnalyticsServices(consent: ConsentData): void {
    this.updateGoogleAnalyticsConsent(consent);
    this.updateMicrosoftClarityConsent(consent);
  }

  private updateGoogleAnalyticsConsent(consent: ConsentData): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const consentState = {
        'analytics_storage': consent.categories.analytics ? 'granted' : 'denied',
        'ad_storage': consent.categories.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.categories.marketing ? 'granted' : 'denied',
        'ad_personalization': consent.categories.marketing ? 'granted' : 'denied'
      };
      
      (window as any).gtag('consent', 'update', consentState);
      console.log('✅ Google Analytics consent updated:', consentState);
    }
  }

  private updateMicrosoftClarityConsent(consent: ConsentData): void {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      const consentState = {
        ad_storage: consent.categories.marketing ? 'granted' : 'denied',
        analytics_storage: consent.categories.analytics ? 'granted' : 'denied'
      };
      
      (window as any).clarity('consentv2', consentState);
      console.log('✅ Microsoft Clarity consent updated:', consentState);
    }
  }
}
```

## Modern App Component with Signals

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieConsentService } from './services/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app">
      <header>
        <h1>My Angular App</h1>
        <button (click)="showCookieSettings()">Cookie Settings</button>
      </header>
      
      <main>
        <!-- Modern @if control flow syntax -->
        @if (cookieService.isDialogReady()) {
          @if (cookieService.hasAnalyticsConsent()) {
            <app-analytics />
          }
          
          @if (cookieService.hasMarketingConsent()) {
            <app-marketing />
          } @else {
            <div class="marketing-disabled">
              Marketing features are disabled. 
              <button (click)="showCookieSettings()">Enable</button>
            </div>
          }
        } @else {
          <div class="loading">Loading cookie preferences...</div>
        }
        
        <!-- Consent status display -->
        @if (cookieService.currentConsent()) {
          <div class="consent-status">
            <h3>Current Consent Status:</h3>
            <ul>
              @for (item of getConsentItems(); track item.category) {
                <li [class.granted]="item.granted" [class.denied]="!item.granted">
                  {{ item.name }}: {{ item.granted ? 'Granted' : 'Denied' }}
                </li>
              }
            </ul>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .loading {
      padding: 1rem;
      text-align: center;
      color: #666;
    }
    
    .marketing-disabled {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
      margin: 1rem 0;
    }
    
    .consent-status {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .consent-status li.granted {
      color: green;
    }
    
    .consent-status li.denied {
      color: red;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  readonly cookieService = inject(CookieConsentService);

  ngOnInit() {
    this.cookieService.initDialog({
      position: 'bottom',
      theme: 'light',
      enableLocation: false // false: Always show dialog, true: Only show in GDPR regions (requires geolocation)
    });
  }

  ngOnDestroy() {
    this.cookieService.destroy();
  }

  showCookieSettings() {
    this.cookieService.showSettings();
  }

  getConsentItems() {
    const consent = this.cookieService.currentConsent();
    if (!consent) return [];

    return [
      { category: 'necessary', name: 'Essential', granted: consent.categories.necessary || false },
      { category: 'analytics', name: 'Analytics', granted: consent.categories.analytics || false },
      { category: 'marketing', name: 'Marketing', granted: consent.categories.marketing || false }
    ];
  }
}
```

## Conditional Component with Signals

```typescript
// components/conditional-service.component.ts
import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed, signal } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';

@Component({
  selector: 'app-conditional-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (hasConsent()) {
      <ng-content></ng-content>
    } @else {
      @if (showFallback()) {
        <ng-content select="[slot=fallback]"></ng-content>
      } @else {
        <div class="consent-required">
          <p>This feature requires {{ categoryName() }} consent.</p>
          <button (click)="requestConsent()">Enable {{ categoryName() }}</button>
        </div>
      }
    }
  `,
  styles: [`
    .consent-required {
      padding: 1rem;
      border: 2px dashed #ccc;
      border-radius: 4px;
      text-align: center;
      margin: 1rem 0;
    }
  `]
})
export class ConditionalServiceComponent implements OnInit {
  @Input({ required: true }) category!: string;
  @Input() fallback = false;
  
  private readonly cookieService = inject(CookieConsentService);
  private readonly categorySignal = signal<string>('');
  
  readonly hasConsent = computed(() => {
    const consent = this.cookieService.currentConsent();
    return consent?.categories?.[this.categorySignal()] || false;
  });
  
  readonly showFallback = signal(false);
  readonly categoryName = computed(() => 
    this.categorySignal().charAt(0).toUpperCase() + this.categorySignal().slice(1)
  );

  ngOnInit() {
    this.categorySignal.set(this.category);
    this.showFallback.set(this.fallback);
  }

  requestConsent() {
    this.cookieService.showSettings();
  }
}
```

## Analytics Component Example

```typescript
// components/analytics.component.ts
import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieConsentService } from '../services/cookie-consent.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-status">
      @if (cookieService.hasAnalyticsConsent()) {
        <div class="status-active">
          ✅ Analytics Active
          <small>Tracking page views and user interactions</small>
        </div>
      } @else {
        <div class="status-inactive">
          ❌ Analytics Disabled
          <button (click)="enableAnalytics()">Enable Analytics</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-status {
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 4px;
    }
    
    .status-active {
      background: #e8f5e8;
      color: #2d5a2d;
    }
    
    .status-inactive {
      background: #ffeaea;
      color: #5a2d2d;
    }
    
    small {
      display: block;
      font-size: 0.8em;
      margin-top: 0.25rem;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  readonly cookieService = inject(CookieConsentService);

  constructor() {
    // Effect to handle analytics initialization
    effect(() => {
      if (this.cookieService.hasAnalyticsConsent()) {
        this.initializeAnalytics();
      } else {
        this.disableAnalytics();
      }
    });
  }

  ngOnInit() {
    // Component initialization
  }

  enableAnalytics() {
    this.cookieService.showSettings();
  }

  private initializeAnalytics() {
    // This would normally be handled by the service, but showing for demo
    console.log('Analytics component initialized');
    
    // Track page view if analytics is enabled
    if (this.cookieService.hasAnalyticsConsent() && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  private disableAnalytics() {
    console.log('Analytics disabled - no tracking will occur');
    
    // Clear any existing analytics data if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }
}
```

## Usage in Templates

```html
<!-- Modern control flow syntax examples -->

<!-- Basic conditional display -->
@if (cookieService.hasAnalyticsConsent()) {
  <app-google-analytics />
}

<!-- Conditional with else -->
@if (cookieService.hasMarketingConsent()) {
  <app-facebook-pixel />
} @else {
  <div>Marketing features disabled</div>
}

<!-- Using conditional service component -->
<app-conditional-service category="analytics">
  <app-analytics-dashboard />
  <div slot="fallback">Analytics dashboard requires consent</div>
</app-conditional-service>

<!-- Multiple conditions -->
@if (cookieService.hasNecessaryConsent()) {
  <div class="essential-features">
    <!-- Always shown content -->
    
    @if (cookieService.hasAnalyticsConsent()) {
      <app-user-insights />
    }
    
    @if (cookieService.hasMarketingConsent()) {
      <app-recommendations />
    }
  </div>
}

<!-- Loop through consent status -->
@for (item of getConsentItems(); track item.category) {
  <div class="consent-item" [class.granted]="item.granted">
    {{ item.name }}: 
    @if (item.granted) {
      <span class="status-granted">Enabled</span>
    } @else {
      <span class="status-denied">Disabled</span>
    }
  </div>
}
```

## Bootstrap Application

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Other providers
  ]
}).catch(err => console.error(err));
```

## Key Benefits of Modern Angular Approach

1. **Signals**: Reactive state management with automatic change detection
2. **Standalone Components**: No need for NgModule declarations
3. **Control Flow**: Cleaner template syntax with @if, @for, @switch
4. **Computed Values**: Efficient derived state calculations
5. **Effects**: Reactive side effects for analytics initialization
6. **Dependency Injection**: Modern `inject()` function instead of constructor injection

## Migration from RxJS Observables

If you have existing Observable-based code, you can easily convert:

```typescript
// Old RxJS approach
consent$: Observable<ConsentData | null>;

// New Signals approach  
consent = signal<ConsentData | null>(null);
readonly currentConsent = this.consent.asReadonly();

// Converting computed values
// Old: consent$.pipe(map(c => c?.categories?.analytics || false))
// New: computed(() => this.consent()?.categories?.analytics || false)
```

This modern approach provides better performance, simpler state management, and cleaner template syntax while maintaining full compatibility with CookieDialog's consent management system.

## Configuration Setup

To use the examples above, you need to configure your analytics IDs:

### 1. Google Analytics Setup

Replace `'GA_MEASUREMENT_ID'` with your actual Google Analytics 4 measurement ID:

```typescript
// In your service
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Your actual GA4 ID
gtag('config', 'G-XXXXXXXXXX', { // Your actual GA4 ID
  'anonymize_ip': true,
  'cookie_flags': 'SameSite=Strict;Secure'
});
```

### 2. Microsoft Clarity Setup

Replace `'YOUR_CLARITY_PROJECT_ID'` with your actual Clarity project ID:

```typescript
// In your service - last parameter is your Clarity project ID  
})(window, document, 'clarity', 'script', 'abc123def'); // Your actual Clarity Project ID
```

## Complete Working Example

Here's a minimal working example you can copy and paste:

```typescript
// app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app">
      <h1>My Angular App with CookieDialog</h1>
      <button (click)="showSettings()">Cookie Settings</button>
      
      @if (consentService.isDialogReady()) {
        <div class="consent-status">
          <h3>Analytics Status:</h3>
          @if (consentService.hasAnalyticsConsent()) {
            <span class="enabled">✅ Analytics Enabled</span>
          } @else {
            <span class="disabled">❌ Analytics Disabled</span>
          }
          
          <h3>Marketing Status:</h3>
          @if (consentService.hasMarketingConsent()) {
            <span class="enabled">✅ Marketing Enabled</span>
          } @else {
            <span class="disabled">❌ Marketing Disabled</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .app { padding: 2rem; }
    .consent-status { margin-top: 2rem; padding: 1rem; border: 1px solid #ccc; }
    .enabled { color: green; }
    .disabled { color: red; }
  `]
})
export class AppComponent implements OnInit {
  consentService = inject(CookieConsentService);

  ngOnInit() {
    this.consentService.initDialog();
  }

  showSettings() {
    this.consentService.showSettings();
  }
}
```

## Testing the Integration

1. **Open browser developer tools** to see console messages
2. **Accept cookies** and look for:
   ```
   ✅ Google Analytics loaded with consent: {analytics_storage: "granted"}
   ✅ Clarity consent initialized: {analytics_storage: "granted"}
   ```
3. **Change settings** and verify consent updates:
   ```
   ✅ Google Analytics consent updated: {analytics_storage: "denied"}
   ✅ Microsoft Clarity consent updated: {analytics_storage: "denied"}
   ```
4. **Check network tab** to verify scripts load only with appropriate consent

## Environment Configuration

For different environments, you can configure analytics IDs:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  googleAnalyticsId: 'G-XXXXXXXXXX', // Development GA4 ID
  clarityProjectId: 'abc123dev'        // Development Clarity ID
};

// environments/environment.prod.ts  
export const environment = {
  production: true,
  googleAnalyticsId: 'G-YYYYYYYYYY', // Production GA4 ID
  clarityProjectId: 'xyz789prod'       // Production Clarity ID
};

// Use in service
import { environment } from '../environments/environment';

private initializeGoogleAnalytics(consent: ConsentData | null): void {
  // ...
  script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsId}`;
  // ...
  gtag('config', environment.googleAnalyticsId, {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=Strict;Secure'
  });
}
```

This setup ensures your Angular application properly integrates with both Google Analytics and Microsoft Clarity while respecting user consent preferences through CookieDialog.