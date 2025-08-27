import './styles.css';
import { CookieDialogConfig, ConsentState, CookieCategory, Translations } from './types';
import { ConsentStorage } from './storage';
import { GeolocationService } from './geolocation';

export class CookieDialog {
  private config: CookieDialogConfig;
  private storage: ConsentStorage;
  private geolocation: GeolocationService | null = null;
  private dialogElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private settingsOpen: boolean = false;
  private categories: CookieCategory[];
  private translations: Translations;

  constructor(config: Partial<CookieDialogConfig> = {}) {
    this.config = this.mergeConfig(config);
    this.storage = new ConsentStorage(this.config.expiryDays);
    this.translations = this.config.translations || this.getDefaultTranslations();
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
      ...userConfig
    };
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
      title: 'Cookie Settings',
      description: 'We use cookies to enhance your browsing experience and analyze our traffic. Please choose your preferences.',
      acceptButton: 'Accept All',
      rejectButton: 'Reject All',
      settingsButton: 'Cookie Settings',
      closeButton: 'Save Settings',
      privacyLink: 'Privacy Policy',
      cookiePolicyLink: 'Cookie Policy',
      necessaryCategory: 'Necessary',
      necessaryDescription: 'Essential cookies for the website to function properly'
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
      console.log('🌍 CookieDialog: Checking geolocation for GDPR requirements...');
      
      try {
        const locationData = await this.geolocation.checkLocation();
        console.log('🌍 CookieDialog: Location detected:', {
          country: locationData.country,
          region: locationData.region,
          inEU: locationData.inEU
        });

        if (!locationData.inEU && !this.config.forceShow) {
          console.log('✅ CookieDialog: User is not in GDPR region - consent not required');
          
          // Create consent state for location-based acceptance
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

          // Call the new callback for location-based consent
          if (this.config.onLocationNotRequired) {
            this.config.onLocationNotRequired({
              country: locationData.country,
              region: locationData.region,
              inEU: locationData.inEU
            });
          }

          // Still call onAccept but with location reason
          if (this.config.onAccept) {
            this.config.onAccept(consentState);
          }

          return;
        } else {
          console.log('⚠️ CookieDialog: User is in GDPR region - consent dialog required');
        }
      } catch (error) {
        console.warn('⚠️ CookieDialog: Geolocation check failed, showing dialog as fallback:', error);
      }
    }

    // Show dialog if auto-show is enabled
    if (this.config.autoShow) {
      this.show();
    }
  }

  show(): void {
    if (this.dialogElement) {
      this.dialogElement.classList.add('show');
      if (this.overlayElement && this.config.position === 'center') {
        this.overlayElement.classList.add('show');
      }
      return;
    }

    this.render();
  }

  hide(): void {
    if (this.dialogElement) {
      this.dialogElement.classList.remove('show');
    }
    if (this.overlayElement) {
      this.overlayElement.classList.remove('show');
    }
  }

  destroy(): void {
    if (this.dialogElement) {
      this.dialogElement.remove();
      this.dialogElement = null;
    }
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  private render(): void {
    // Create overlay for center position
    if (this.config.position === 'center') {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = 'cookie-dialog-overlay show';
      this.overlayElement.addEventListener('click', () => this.hide());
      document.body.appendChild(this.overlayElement);
    }

    // Create main dialog
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = `cookie-dialog show position-${this.config.position} theme-${this.config.theme}`;
    
    const html = `
      <div class="cookie-dialog-container">
        <div class="cookie-dialog-content">
          <h2 class="cookie-dialog-title">${this.translations.title}</h2>
          <p class="cookie-dialog-description">
            ${this.translations.description}
            ${this.config.privacyUrl ? `<a href="${this.config.privacyUrl}" class="cookie-dialog-link" target="_blank">${this.translations.privacyLink}</a>` : ''}
            ${this.config.cookiePolicyUrl ? `<a href="${this.config.cookiePolicyUrl}" class="cookie-dialog-link" target="_blank">${this.translations.cookiePolicyLink}</a>` : ''}
          </p>
        </div>
        <div class="cookie-dialog-buttons">
          <button class="cookie-dialog-button cookie-dialog-button-accept" id="cookieAcceptAll">
            ${this.translations.acceptButton}
          </button>
          <button class="cookie-dialog-button cookie-dialog-button-reject" id="cookieRejectAll">
            ${this.translations.rejectButton}
          </button>
          <button class="cookie-dialog-button cookie-dialog-button-settings" id="cookieSettings">
            ${this.translations.settingsButton}
          </button>
        </div>
      </div>
      <div class="cookie-dialog-settings" id="cookieSettingsPanel">
        ${this.renderCategories()}
        <div class="cookie-dialog-buttons">
          <button class="cookie-dialog-button cookie-dialog-button-accept" id="cookieSaveSettings">
            ${this.translations.closeButton}
          </button>
        </div>
      </div>
    `;

    this.dialogElement.innerHTML = html;
    document.body.appendChild(this.dialogElement);

    // Attach event listeners
    this.attachEventListeners();
  }

  private renderCategories(): string {
    return this.categories.map(category => `
      <div class="cookie-dialog-category">
        <div class="cookie-dialog-category-header">
          <div>
            <div class="cookie-dialog-category-name">${category.name}</div>
            <div class="cookie-dialog-category-description">${category.description}</div>
          </div>
          <label class="cookie-dialog-toggle">
            <input type="checkbox" 
              data-category="${category.id}" 
              ${category.required ? 'checked disabled' : ''}
              ${this.storage.getCategoryConsent(category.id) ? 'checked' : ''}>
            <span class="cookie-dialog-toggle-slider"></span>
          </label>
        </div>
      </div>
    `).join('');
  }

  private attachEventListeners(): void {
    const acceptBtn = document.getElementById('cookieAcceptAll');
    const rejectBtn = document.getElementById('cookieRejectAll');
    const settingsBtn = document.getElementById('cookieSettings');
    const saveBtn = document.getElementById('cookieSaveSettings');

    acceptBtn?.addEventListener('click', () => this.acceptAll());
    rejectBtn?.addEventListener('click', () => this.rejectAll());
    settingsBtn?.addEventListener('click', () => this.toggleSettings());
    saveBtn?.addEventListener('click', () => this.saveSettings());
  }

  private toggleSettings(): void {
    const panel = document.getElementById('cookieSettingsPanel');
    if (panel) {
      this.settingsOpen = !this.settingsOpen;
      panel.classList.toggle('show', this.settingsOpen);
    }
  }

  private acceptAll(): void {
    const consent: { [key: string]: boolean } = {};
    this.categories.forEach(cat => {
      consent[cat.id] = true;
    });

    const state = this.storage.saveConsent(consent, 'user_accept');
    this.hide();
    
    if (this.config.onAccept) {
      this.config.onAccept(state);
    }
  }

  private rejectAll(): void {
    const consent: { [key: string]: boolean } = {};
    this.categories.forEach(cat => {
      consent[cat.id] = cat.required;
    });

    this.storage.saveConsent(consent, 'user_reject');
    this.hide();
    
    if (this.config.onReject) {
      this.config.onReject();
    }
  }

  private saveSettings(): void {
    const consent: { [key: string]: boolean } = {};
    const checkboxes = this.dialogElement?.querySelectorAll<HTMLInputElement>('input[data-category]');
    
    checkboxes?.forEach(checkbox => {
      const categoryId = checkbox.dataset.category;
      if (categoryId) {
        consent[categoryId] = checkbox.checked;
      }
    });

    const state = this.storage.saveConsent(consent, 'user_accept');
    this.hide();
    
    if (this.config.onChange) {
      this.config.onChange(state);
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