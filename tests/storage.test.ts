import { ConsentStorage } from '../src/storage';

describe('ConsentStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should save and retrieve consent', () => {
    const storage = new ConsentStorage(365);
    
    const categories = {
      necessary: true,
      analytics: false,
      marketing: true
    };

    const consent = storage.saveConsent(categories, 'user_accept');
    
    expect(consent.categories).toEqual(categories);
    expect(consent.reason).toBe('user_accept');
    expect(consent.timestamp).toBeGreaterThan(0);

    // Verify it was saved to localStorage
    const stored = localStorage.getItem('cookiedialog_consent');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.categories).toEqual(categories);
  });

  test('should return null for non-existent consent', () => {
    const storage = new ConsentStorage(365);
    const consent = storage.getConsent();
    
    expect(consent).toBeNull();
  });

  test('should check if consent exists', () => {
    const storage = new ConsentStorage(365);
    
    expect(storage.hasConsent()).toBe(false);
    
    storage.saveConsent({ necessary: true }, 'user_accept');
    
    expect(storage.hasConsent()).toBe(true);
  });

  test('should clear consent', () => {
    const storage = new ConsentStorage(365);
    
    storage.saveConsent({ necessary: true }, 'user_accept');
    expect(storage.hasConsent()).toBe(true);
    
    storage.clearConsent();
    expect(storage.hasConsent()).toBe(false);
  });
});