---
title: Storage & Persistence
description: How CookieDialog stores and manages user consent preferences
---

# Storage & Persistence

CookieDialog uses localStorage to persist user consent preferences across browser sessions.

## Default Storage Behavior

By default, CookieDialog:
- Stores consent in `localStorage` under the key `'cookiedialog_consent'`
- Remembers preferences for 365 days
- Includes timestamp and category-specific choices

## Storage Configuration

### Custom Storage Key

```javascript
CookieDialog.init({
  storageKey: 'my_custom_consent_key'
});
```

### Custom Expiry Period

```javascript
CookieDialog.init({
  expiryDays: 90  // Remember for 90 days instead of 365
});
```

## Stored Data Structure

The consent data stored in localStorage has this structure:

```json
{
  "timestamp": 1640995200000,
  "expires": 1672531200000,
  "categories": {
    "necessary": true,
    "analytics": false,
    "marketing": true
  },
  "version": "1.0.0"
}
```

### Properties Explained

- **`timestamp`**: When consent was given (Unix timestamp)
- **`expires`**: When consent expires (Unix timestamp)  
- **`categories`**: Object with consent status for each category
- **`version`**: Library version (for migration compatibility)

## Reading Stored Consent

### Get Current Consent

```javascript
const dialog = CookieDialog.init();
const consent = dialog.getConsent();

if (consent) {
  console.log('Consent given on:', new Date(consent.timestamp));
  console.log('Expires on:', new Date(consent.expires));
  console.log('Analytics enabled:', consent.categories.analytics);
}
```

### Check if Consent Exists

```javascript
const dialog = CookieDialog.init();

if (dialog.hasConsent()) {
  console.log('User has already made a choice');
} else {
  console.log('No consent found - dialog will be shown');
}
```

### Check Specific Categories

```javascript
const dialog = CookieDialog.init();

// Check individual category
if (dialog.getCategoryConsent('analytics')) {
  // Enable Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
}

if (dialog.getCategoryConsent('marketing')) {
  // Enable marketing pixels
  fbq('init', 'PIXEL_ID');
}
```

## Managing Stored Data

### Reset Consent

Force the dialog to show again by clearing stored consent:

```javascript
const dialog = CookieDialog.init();

// Clear stored consent - dialog will show on next page load
dialog.resetConsent();

// Or show dialog immediately
dialog.show();
```

### Manual Storage Management

Direct localStorage access (advanced usage):

```javascript
// Get raw stored data
const rawConsent = localStorage.getItem('cookiedialog_consent');
const consentData = rawConsent ? JSON.parse(rawConsent) : null;

// Manually update specific category
if (consentData) {
  consentData.categories.analytics = false;
  localStorage.setItem('cookiedialog_consent', JSON.stringify(consentData));
}

// Remove consent entirely
localStorage.removeItem('cookiedialog_consent');
```

## Storage Events

Listen for storage changes across browser tabs:

```javascript
// Listen for consent changes in other tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'cookiedialog_consent') {
    const newConsent = event.newValue ? JSON.parse(event.newValue) : null;
    
    if (newConsent) {
      console.log('Consent updated in another tab:', newConsent);
      // Re-initialize or update based on new consent
    }
  }
});
```

## Migration & Versioning

### Handling Version Changes

```javascript
const dialog = CookieDialog.init({
  // ... your configuration ...
});

// Check for version migration after initialization
const consent = dialog.getConsent();
if (consent && consent.version !== '1.0.0') {
  // Handle migration from older version
  console.log('Migrating from version:', consent.version);
  
  // Reset consent to show dialog again
  dialog.resetConsent();
}
```

### Automatic Migration

```javascript
function migrateConsent() {
  const consent = localStorage.getItem('cookiedialog_consent');
  
  if (consent) {
    const data = JSON.parse(consent);
    
    // Migrate old structure to new
    if (!data.version) {
      data.version = '1.0.0';
      
      // Add new categories if they don't exist
      if (!data.categories.personalization) {
        data.categories.personalization = false;
      }
      
      localStorage.setItem('cookiedialog_consent', JSON.stringify(data));
    }
  }
}

// Run migration before initializing
migrateConsent();
CookieDialog.init();
```

## Cross-Subdomain Sharing

For sharing consent across subdomains, you need custom implementation:

```javascript
// Custom storage functions for cross-subdomain support
const storage = {
  get: (key) => {
    // Try localStorage first
    let value = localStorage.getItem(key);
    
    if (!value) {
      // Fallback to reading from cookie
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(key + '='));
      
      if (cookie) {
        value = decodeURIComponent(cookie.split('=')[1]);
      }
    }
    
    return value;
  },
  
  set: (key, value, domain = window.location.hostname) => {
    // Store in localStorage
    localStorage.setItem(key, value);
    
    // Also store in cookie for cross-subdomain access
    const expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; domain=.${domain}; path=/; SameSite=Lax`;
  }
};

// Use custom storage with CookieDialog
// (Requires custom implementation - not built-in feature)
```

## Privacy Considerations

### Data Minimization

Only store necessary consent information:

```javascript
// Minimal consent storage
const minimalConsent = {
  timestamp: Date.now(),
  analytics: true,
  marketing: false
};

localStorage.setItem('minimal_consent', JSON.stringify(minimalConsent));
```

### Secure Storage

For sensitive implementations, consider:

```javascript
// Encrypt consent data (example using crypto-js)
function encryptConsent(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

function decryptConsent(encrypted, key) {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Store encrypted consent
const encryptedData = encryptConsent(consentData, userKey);
localStorage.setItem('secure_consent', encryptedData);
```

## Testing Storage

### Clear All Test Data

```javascript
// Clear all CookieDialog related storage
function clearTestData() {
  localStorage.removeItem('cookiedialog_consent');
  localStorage.removeItem('user_country');
  localStorage.removeItem('country_cache_time');
  
  // Clear any custom keys
  Object.keys(localStorage)
    .filter(key => key.startsWith('cookiedialog_'))
    .forEach(key => localStorage.removeItem(key));
}

// Use in development/testing
if (window.location.hostname === 'localhost') {
  window.clearCookieDialogData = clearTestData;
}
```

### Storage Size Monitoring

```javascript
function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

console.log('LocalStorage usage:', getStorageSize(), 'characters');
```

## Best Practices

1. **Regular cleanup**: Periodically remove expired consent data
2. **Error handling**: Always wrap localStorage access in try-catch blocks
3. **Fallbacks**: Have a plan for when localStorage is unavailable
4. **Size limits**: Be aware of localStorage size limits (usually 5-10MB)
5. **Privacy**: Only store necessary consent information