---
title: Angular Integration
description: How to integrate CookieDialog with Angular applications
---

# Angular Integration

CookieDialog can be integrated into Angular applications using services, components, and guards.

## Basic Service

```typescript
// services/cookie-consent.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private consentSubject = new BehaviorSubject<ConsentData | null>(null);
  
  public consent$: Observable<ConsentData | null> = this.consentSubject.asObservable();

  initDialog(config: any = {}) {
    if (this.dialog) return;

    this.dialog = (window as any).CookieDialog.init({
      ...config,
      onAccept: (consent: ConsentData) => {
        this.consentSubject.next(consent);
      },
      onReject: (consent: ConsentData) => {
        this.consentSubject.next(consent);
      },
      onChange: (consent: ConsentData) => {
        this.consentSubject.next(consent);
      },
      onInit: (hasExistingConsent: boolean) => {
        if (hasExistingConsent) {
          const existingConsent = this.dialog.getConsent();
          this.consentSubject.next(existingConsent);
        }
      }
    });
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
    this.consentSubject.next(null);
  }

  destroy(): void {
    this.dialog?.destroy();
    this.dialog = null;
  }
}
```

## App Component Integration

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieConsentService } from './services/cookie-consent.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <header>
        <h1>My Angular App</h1>
        <button (click)="showCookieSettings()">Cookie Settings</button>
      </header>
      
      <main>
        <app-analytics *ngIf="hasAnalyticsConsent$ | async"></app-analytics>
        <app-marketing *ngIf="hasMarketingConsent$ | async"></app-marketing>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  hasAnalyticsConsent$ = this.cookieService.consent$.pipe(
    map(consent => consent?.categories?.analytics || false)
  );
  
  hasMarketingConsent$ = this.cookieService.consent$.pipe(
    map(consent => consent?.categories?.marketing || false)
  );

  constructor(private cookieService: CookieConsentService) {}

  ngOnInit() {
    this.cookieService.initDialog({
      position: 'bottom',
      theme: 'light',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ]
    });
  }

  ngOnDestroy() {
    this.cookieService.destroy();
  }

  showCookieSettings() {
    this.cookieService.showSettings();
  }
}
```

## Conditional Component

```typescript
// components/conditional-service.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CookieConsentService } from '../services/cookie-consent.service';

@Component({
  selector: 'app-conditional-service',
  template: `
    <ng-content *ngIf="hasConsent$ | async; else fallback"></ng-content>
    <ng-template #fallback>
      <ng-content select="[slot=fallback]"></ng-content>
    </ng-template>
  `
})
export class ConditionalServiceComponent implements OnInit {
  @Input() category!: string;
  
  hasConsent$!: Observable<boolean>;

  constructor(private cookieService: CookieConsentService) {}

  ngOnInit() {
    this.hasConsent$ = this.cookieService.consent$.pipe(
      map(consent => consent?.categories?.[this.category] || false)
    );
  }
}
```

Usage:

```html
<app-conditional-service category="analytics">
  <app-google-analytics></app-google-analytics>
  <div slot="fallback">Analytics disabled by user preference</div>
</app-conditional-service>
```

## Guard for Route Protection

```typescript
// guards/consent.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { CookieConsentService } from '../services/cookie-consent.service';

@Injectable({
  providedIn: 'root'
})
export class ConsentGuard implements CanActivate {
  constructor(
    private cookieService: CookieConsentService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.cookieService.consent$.pipe(
      take(1),
      map(consent => {
        if (!consent) {
          // Redirect to home if no consent
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
```

## Directive for Conditional Display

```typescript
// directives/if-consent.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CookieConsentService } from '../services/cookie-consent.service';

@Directive({
  selector: '[appIfConsent]'
})
export class IfConsentDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;
  private hasView = false;

  @Input() set appIfConsent(category: string) {
    this.category = category;
    this.updateView();
  }

  private category!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private cookieService: CookieConsentService
  ) {}

  ngOnInit() {
    this.subscription = this.cookieService.consent$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateView() {
    const hasConsent = this.cookieService.getCategoryConsent(this.category);

    if (hasConsent && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasConsent && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
```

Usage:

```html
<div *appIfConsent="'analytics'">
  Google Analytics is enabled
</div>

<app-facebook-pixel *appIfConsent="'marketing'"></app-facebook-pixel>
```

## Module Setup

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ConditionalServiceComponent } from './components/conditional-service.component';
import { IfConsentDirective } from './directives/if-consent.directive';
import { CookieConsentService } from './services/cookie-consent.service';

@NgModule({
  declarations: [
    AppComponent,
    ConditionalServiceComponent,
    IfConsentDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    CookieConsentService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```