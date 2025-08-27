import { ConsentStorage } from '../src/storage';

describe('ConsentStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});