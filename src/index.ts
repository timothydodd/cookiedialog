import './styles.css';
import { CookieDialogConfig, ConsentState, CookieCategory, Translations, ConsentReason } from './types';
import { ConsentStorage } from './storage';
import { GeolocationService } from './geolocation';

let instanceCounter = 0;

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function escapeHtml(value: string | undefined): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class CookieDialog {
  private config: CookieDialogConfig;
  private storage: ConsentStorage;
  private geolocation: GeolocationService | null = null;
  private dialogElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private settingsOpen: boolean = false;
  private categories: CookieCategory[];
  private translations: Translations;
  private readonly uid: string;
  private previouslyFocused: HTMLElement | null = null;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(config: Partial<CookieDialogConfig> = {}) {
    this.uid = `cookie-dialog-${++instanceCounter}`;
    this.config = this.mergeConfig(config);
    this.storage = new ConsentStorage(this.config.expiryDays);
    this.translations = { ...this.getDefaultTranslations(), ...(this.config.translations || {}) };
    this.categories = this.config.categories || this.getDefaultCategories();

    if (this.config.enableLocation) {
      this.geolocation = new GeolocationService(this.config.geolocationEndpoint);
    }
  }

  private mergeConfig(userConfig: Partial<CookieDialogConfig>): CookieDialogConfig {
    return {
      enableLocation: false,
      autoShow: true,
      position: 'bottom',
      theme: 'light',
      expiryDays: 365,
      forceShow: false,
      debug: false,
      ...userConfig
    };
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('CookieDialog:', ...args);
    }
  }

  private getDefaultCategories(): CookieCategory[] {
    return [
      {
        id: 'necessary',
        name: this.translations.necessaryCategory || 'Necessary',
        description: this.translations.necessaryDescription || 'Essential cookies for the website to function properly',
        required: true
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Cookies to understand how visitors interact with the website',
        required: false
      },
      {
        id: 'marketing',
        name: 'Marketing',
        description: 'Cookies to deliver personalized advertisements',
        required: false
      }
    ];
  }

  private getDefaultTranslations(): Translations {
    return {
      title: 'We value your privacy',
      description: 'We use cookies to enhance your browsing experience and analyze our traffic. You can accept all cookies, reject the optional ones, or choose which categories to allow.',
      acceptButton: 'Accept all',
      rejectButton: 'Reject all',
      settingsButton: 'Manage preferences',
      saveButton: 'Save preferences',
      privacyLink: 'Privacy Policy',
      cookiePolicyLink: 'Cookie Policy',
      necessaryCategory: 'Necessary',
      necessaryDescription: 'Essential cookies for the website to function properly',
      alwaysActive: 'Always active',
      settingsTitle: 'Cookie preferences'
    };
  }

  async init(): Promise<void> {
    // Check if consent already exists and not forced to show
    if (!this.config.forceShow && this.storage.hasConsent()) {
      const consent = this.storage.getConsent();
      if (consent && this.config.onAccept) {
        this.config.onAccept(consent);
      }
      return;
    }

    // Check geolocation if enabled
    if (this.config.enableLocation && this.geolocation) {
      this.log('Checking geolocation for GDPR requirements...');

      try {
        const locationData = await this.geolocation.checkLocation();
        this.log('Location detected:', {
          country: locationData.country,
          region: locationData.region,
          inEU: locationData.inEU
        });

        if (!locationData.inEU && !this.config.forceShow) {
          this.log('Visitor is not in a GDPR region - consent not required');

          const consent: { [key: string]: boolean } = {};
          this.categories.forEach(cat => {
            consent[cat.id] = true; // Accept all cookies when consent not required
          });

          const consentState = this.storage.saveConsent(
            consent,
            'location_not_required',
            {
              country: locationData.country,
              region: locationData.region,
              inEU: locationData.inEU,
              detectionMethod: 'ip_geolocation'
            }
          );

          if (this.config.onLocationNotRequired) {
            this.config.onLocationNotRequired({
              country: locationData.country,
              region: locationData.region,
              inEU: locationData.inEU
            });
          }

          if (this.config.onAccept) {
            this.config.onAccept(consentState);
          }

          return;
        }

        this.log('Visitor is in a GDPR region - consent dialog required');
      } catch (error) {
        console.warn('CookieDialog: Geolocation check failed, showing dialog as fallback:', error);
      }
    }

    if (this.config.autoShow) {
      this.show();
    }
  }

  show(): void {
    if (!this.dialogElement) {
      this.render();
    }
    const dialog = this.dialogElement!;

    this.syncToggles();
    this.setSettingsOpen(false);

    this.previouslyFocused = document.activeElement as HTMLElement | null;

    // Force a reflow so the entrance transition runs on first render
    void dialog.offsetHeight;
    dialog.classList.add('show');
    dialog.removeAttribute('aria-hidden');
    this.overlayElement?.classList.add('show');

    this.keydownHandler = (event: KeyboardEvent) => this.onKeydown(event);
    document.addEventListener('keydown', this.keydownHandler);

    const first = dialog.querySelector<HTMLElement>('.cookie-dialog-button-accept');
    first?.focus({ preventScroll: true });
  }

  hide(): void {
    if (this.dialogElement) {
      this.dialogElement.classList.remove('show');
      this.dialogElement.setAttribute('aria-hidden', 'true');
    }
    this.overlayElement?.classList.remove('show');

    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }

    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus({ preventScroll: true });
    }
    this.previouslyFocused = null;
  }

  destroy(): void {
    this.hide();
    this.dialogElement?.remove();
    this.dialogElement = null;
    this.overlayElement?.remove();
    this.overlayElement = null;
  }

  private render(): void {
    const themeClass = `theme-${this.config.theme || 'light'}`;

    if (this.config.position === 'center') {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = `cookie-dialog-overlay ${themeClass}`;
      this.overlayElement.addEventListener('click', () => this.hide());
      document.body.appendChild(this.overlayElement);
    }

    const t = this.translations;
    const titleId = `${this.uid}-title`;
    const descId = `${this.uid}-desc`;
    const settingsId = `${this.uid}-settings`;

    const links: string[] = [];
    if (this.config.privacyUrl) {
      links.push(`<a href="${escapeHtml(this.config.privacyUrl)}" class="cookie-dialog-link" target="_blank" rel="noopener">${escapeHtml(t.privacyLink)}</a>`);
    }
    if (this.config.cookiePolicyUrl) {
      links.push(`<a href="${escapeHtml(this.config.cookiePolicyUrl)}" class="cookie-dialog-link" target="_blank" rel="noopener">${escapeHtml(t.cookiePolicyLink)}</a>`);
    }

    const dialog = document.createElement('div');
    dialog.className = `cookie-dialog position-${this.config.position} ${themeClass}`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.setAttribute('aria-describedby', descId);
    dialog.setAttribute('aria-hidden', 'true');
    if (this.config.position === 'center') {
      dialog.setAttribute('aria-modal', 'true');
    }

    dialog.innerHTML = `
      <div class="cookie-dialog-container">
        <div class="cookie-dialog-content">
          <h2 class="cookie-dialog-title" id="${titleId}">${escapeHtml(t.title)}</h2>
          <p class="cookie-dialog-description" id="${descId}">${escapeHtml(t.description)}</p>
          ${links.length ? `<div class="cookie-dialog-links">${links.join('')}</div>` : ''}
        </div>
        <div class="cookie-dialog-buttons">
          <button type="button" class="cookie-dialog-button cookie-dialog-button-accept" data-cd-action="accept">${escapeHtml(t.acceptButton)}</button>
          <button type="button" class="cookie-dialog-button cookie-dialog-button-reject" data-cd-action="reject">${escapeHtml(t.rejectButton)}</button>
          <button type="button" class="cookie-dialog-button cookie-dialog-button-settings" data-cd-action="settings" aria-expanded="false" aria-controls="${settingsId}">${escapeHtml(t.settingsButton)}</button>
        </div>
      </div>
      <div class="cookie-dialog-settings" id="${settingsId}" role="group" aria-label="${escapeHtml(t.settingsTitle)}">
        <div class="cookie-dialog-categories">${this.renderCategories()}</div>
        <div class="cookie-dialog-buttons">
          <button type="button" class="cookie-dialog-button cookie-dialog-button-accept" data-cd-action="save">${escapeHtml(t.saveButton || t.closeButton)}</button>
          <button type="button" class="cookie-dialog-button cookie-dialog-button-reject" data-cd-action="accept">${escapeHtml(t.acceptButton)}</button>
          <button type="button" class="cookie-dialog-button cookie-dialog-button-reject" data-cd-action="reject">${escapeHtml(t.rejectButton)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    this.dialogElement = dialog;
    this.attachEventListeners();
  }

  private renderCategories(): string {
    const t = this.translations;
    return this.categories.map(category => {
      const inputId = `${this.uid}-cat-${category.id}`;
      const descId = `${inputId}-desc`;
      const control = category.required
        ? `<span class="cookie-dialog-badge">${escapeHtml(t.alwaysActive)}</span>`
        : `<span class="cookie-dialog-toggle">
             <input type="checkbox" id="${inputId}" data-category="${escapeHtml(category.id)}" aria-describedby="${descId}">
             <span class="cookie-dialog-toggle-slider" aria-hidden="true"></span>
           </span>`;
      const nameTag = category.required ? 'span' : `label for="${inputId}"`;
      const nameClose = category.required ? 'span' : 'label';

      return `
        <div class="cookie-dialog-category">
          <div class="cookie-dialog-category-text">
            <${nameTag} class="cookie-dialog-category-name">${escapeHtml(category.name)}</${nameClose}>
            <p class="cookie-dialog-category-description" id="${descId}">${escapeHtml(category.description)}</p>
          </div>
          ${control}
        </div>
      `;
    }).join('');
  }

  private attachEventListeners(): void {
    this.dialogElement?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-cd-action]');
      if (!target) return;
      switch (target.dataset.cdAction) {
        case 'accept': this.acceptAll(); break;
        case 'reject': this.rejectAll(); break;
        case 'save': this.saveSettings(); break;
        case 'settings': this.setSettingsOpen(!this.settingsOpen); break;
      }
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    const dialog = this.dialogElement;
    if (!dialog || !dialog.classList.contains('show')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
      return;
    }

    // Trap focus inside the dialog when it is modal
    if (event.key === 'Tab' && this.config.position === 'center') {
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  private setSettingsOpen(open: boolean): void {
    const dialog = this.dialogElement;
    if (!dialog) return;
    this.settingsOpen = open;
    dialog.classList.toggle('settings-open', open);
    dialog.querySelector('[data-cd-action="settings"]')?.setAttribute('aria-expanded', String(open));

    if (open) {
      const firstInput = dialog.querySelector<HTMLElement>('.cookie-dialog-settings input, .cookie-dialog-settings button');
      firstInput?.focus({ preventScroll: true });
    }
  }

  /** Reflect stored consent in the toggles so re-opening the dialog shows the current state. */
  private syncToggles(): void {
    const stored = this.storage.getConsent();
    this.dialogElement?.querySelectorAll<HTMLInputElement>('input[data-category]').forEach(input => {
      const id = input.dataset.category!;
      input.checked = stored ? stored.categories[id] === true : false;
    });
  }

  private acceptAll(): void {
    const consent: { [key: string]: boolean } = {};
    this.categories.forEach(cat => {
      consent[cat.id] = true;
    });

    const state = this.storage.saveConsent(consent, 'user_accept');
    this.hide();
    this.config.onAccept?.(state);
  }

  private rejectAll(): void {
    const consent: { [key: string]: boolean } = {};
    this.categories.forEach(cat => {
      consent[cat.id] = cat.required;
    });

    const state = this.storage.saveConsent(consent, 'user_reject');
    this.hide();
    this.config.onReject?.(state);
  }

  private saveSettings(): void {
    const consent: { [key: string]: boolean } = {};
    this.categories.forEach(cat => {
      consent[cat.id] = cat.required;
    });

    this.dialogElement?.querySelectorAll<HTMLInputElement>('input[data-category]').forEach(checkbox => {
      const categoryId = checkbox.dataset.category;
      if (categoryId) {
        consent[categoryId] = checkbox.checked;
      }
    });

    const anyOptionalAccepted = this.categories.some(cat => !cat.required && consent[cat.id]);
    const reason: ConsentReason = anyOptionalAccepted ? 'user_accept' : 'user_reject';

    const state = this.storage.saveConsent(consent, reason);
    this.hide();

    this.config.onChange?.(state);
    if (anyOptionalAccepted) {
      this.config.onAccept?.(state);
    } else {
      this.config.onReject?.(state);
    }
  }

  getConsent(): ConsentState | null {
    return this.storage.getConsent();
  }

  resetConsent(): void {
    this.storage.clearConsent();
  }

  hasConsent(): boolean {
    return this.storage.hasConsent();
  }

  getCategoryConsent(categoryId: string): boolean {
    return this.storage.getCategoryConsent(categoryId);
  }
}

// Create the API object that will be exported
const CookieDialogAPI = {
  init: (config?: Partial<CookieDialogConfig>) => {
    const instance = new CookieDialog(config);
    // Call init() asynchronously but return instance immediately
    instance.init().catch(error => {
      console.error('CookieDialog initialization error:', error);
    });
    return instance;
  },
  create: (config?: Partial<CookieDialogConfig>) => {
    return new CookieDialog(config);
  },
  CookieDialog
};

// For CDN usage, attach to window if available
if (typeof window !== 'undefined') {
  (window as any).CookieDialog = CookieDialogAPI;
}

// Export for module usage
export default CookieDialogAPI;
export * from './types';
