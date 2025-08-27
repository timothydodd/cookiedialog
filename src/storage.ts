import { ConsentState } from './types';

const STORAGE_KEY = 'cookiedialog_consent';
const STORAGE_VERSION = '1.0.0';

export class ConsentStorage {
  private expiryDays: number;

  constructor(expiryDays: number = 365) {
    this.expiryDays = expiryDays;
  }

  getConsent(): ConsentState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const consent = JSON.parse(stored) as ConsentState;
      
      // Check if consent has expired
      const expiryTime = consent.timestamp + (this.expiryDays * 24 * 60 * 60 * 1000);
      if (Date.now() > expiryTime) {
        this.clearConsent();
        return null;
      }

      // Check version compatibility
      if (consent.version !== STORAGE_VERSION) {
        this.clearConsent();
        return null;
      }

      return consent;
    } catch (error) {
      console.error('Error reading consent from storage:', error);
      return null;
    }
  }

  saveConsent(categories: { [key: string]: boolean }, reason: 'user_accept' | 'user_reject' | 'location_not_required' = 'user_accept', locationData?: { country?: string; region?: string; inEU: boolean; detectionMethod: string }): ConsentState {
    const consent: ConsentState = {
      timestamp: Date.now(),
      categories,
      version: STORAGE_VERSION,
      reason,
      locationData
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (error) {
      console.error('Error saving consent to storage:', error);
    }

    return consent;
  }

  clearConsent(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing consent from storage:', error);
    }
  }

  hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  getCategoryConsent(categoryId: string): boolean {
    const consent = this.getConsent();
    if (!consent) return false;
    return consent.categories[categoryId] === true;
  }

  updateCategoryConsent(categoryId: string, value: boolean): ConsentState | null {
    const consent = this.getConsent();
    if (!consent) return null;

    consent.categories[categoryId] = value;
    consent.timestamp = Date.now();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      return consent;
    } catch (error) {
      console.error('Error updating consent in storage:', error);
      return null;
    }
  }
}