---
title: API Methods
description: Complete reference of all CookieDialog API methods and properties
---

# API Methods

CookieDialog provides a comprehensive API for programmatic control of the cookie consent dialog.

## Initialization

### `CookieDialog.init(options)`

Initialize CookieDialog with optional configuration:

```javascript
const dialog = CookieDialog.init({
  position: 'bottom',
  theme: 'light',
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ]
});
```

**Returns:** CookieDialog instance

## Dialog Control

### `show()`

Manually show the cookie dialog:

```javascript
const dialog = CookieDialog.init();
dialog.show();
```

**Use cases:**
- Show settings when user clicks "Cookie Settings" link
- Force display during testing
- Re-display when consent expires

### `hide()`

Hide the cookie dialog:

```javascript
const dialog = CookieDialog.init();
dialog.hide();
```

**Note:** Dialog will still show on next page load if no consent is stored

## Consent Management

### `getConsent()`

Get the current consent data:

```javascript
const dialog = CookieDialog.init();
const consent = dialog.getConsent();

if (consent) {
  console.log('Consent timestamp:', consent.timestamp);
  console.log('Categories:', consent.categories);
  console.log('Expires:', new Date(consent.expires));
}
```

**Returns:** Consent object or `null` if no consent exists

**Consent object structure:**
```javascript
{
  timestamp: 1640995200000,
  expires: 1672531200000,
  categories: {
    necessary: true,
    analytics: false,
    marketing: true
  },
  version: "1.0.0"
}
```

### `hasConsent()`

Check if valid consent exists:

```javascript
const dialog = CookieDialog.init();

if (dialog.hasConsent()) {
  console.log('User has already made a choice');
  // Don't show dialog
} else {
  console.log('No consent found');
  // Dialog will be shown
}
```

**Returns:** `boolean`

### `getCategoryConsent(categoryId)`

Check consent for a specific category:

```javascript
const dialog = CookieDialog.init();

if (dialog.getCategoryConsent('analytics')) {
  // Enable Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
}

if (dialog.getCategoryConsent('marketing')) {
  // Enable marketing pixels
  fbq('init', 'PIXEL_ID');
}
```

**Parameters:**
- `categoryId` (string): The ID of the category to check

**Returns:** `boolean` - `true` if consent is given for the category

### `resetConsent()`

Clear stored consent data:

```javascript
const dialog = CookieDialog.init();

// Clear consent - dialog will show on next page load
dialog.resetConsent();

// Or show dialog immediately after reset
dialog.resetConsent();
dialog.show();
```

**Effect:** Removes consent from localStorage and makes dialog appear on next initialization

## Configuration Methods

### `updateConfig(options)`

Update configuration after initialization:

```javascript
const dialog = CookieDialog.init();

// Change theme dynamically
dialog.updateConfig({
  theme: 'dark',
  position: 'top'
});
```

**Parameters:**
- `options` (object): Configuration options to update

### `getConfig()`

Get current configuration:

```javascript
const dialog = CookieDialog.init();
const config = dialog.getConfig();

console.log('Current theme:', config.theme);
console.log('Current position:', config.position);
```

**Returns:** Current configuration object

## Static Methods

### `CookieDialog.version`

Get the library version:

```javascript
console.log('CookieDialog version:', CookieDialog.version);
```

### `CookieDialog.isInitialized()`

Check if CookieDialog has been initialized:

```javascript
if (CookieDialog.isInitialized()) {
  console.log('CookieDialog is already initialized');
} else {
  CookieDialog.init();
}
```

**Returns:** `boolean`

## Event Methods

### `on(event, callback)`

Add event listener:

```javascript
const dialog = CookieDialog.init();

dialog.on('accept', (consent) => {
  console.log('User accepted:', consent);
});

dialog.on('reject', (consent) => {
  console.log('User rejected:', consent);
});

dialog.on('change', (consent) => {
  console.log('Settings changed:', consent);
});
```

**Available events:**
- `'accept'`: User accepted cookies
- `'reject'`: User rejected optional cookies
- `'change'`: Consent settings changed
- `'show'`: Dialog was shown
- `'hide'`: Dialog was hidden

### `off(event, callback)`

Remove event listener:

```javascript
const dialog = CookieDialog.init();

function handleAccept(consent) {
  console.log('Accepted:', consent);
}

// Add listener
dialog.on('accept', handleAccept);

// Remove listener
dialog.off('accept', handleAccept);
```

## Utility Methods

### `isVisible()`

Check if dialog is currently visible:

```javascript
const dialog = CookieDialog.init();

if (dialog.isVisible()) {
  console.log('Dialog is currently shown');
} else {
  console.log('Dialog is hidden');
}
```

**Returns:** `boolean`

### `destroy()`

Completely remove CookieDialog:

```javascript
const dialog = CookieDialog.init();

// Remove dialog from DOM and clean up
dialog.destroy();
```

**Effect:** Removes dialog element, clears event listeners, and resets initialization state

## Chaining Methods

Most methods return the dialog instance, allowing for method chaining:

```javascript
const dialog = CookieDialog.init({
  position: 'bottom'
})
.show()
.on('accept', (consent) => {
  console.log('Accepted:', consent);
});
```

## Promise-based API

Some methods support promises for async operations:

```javascript
const dialog = CookieDialog.init();

// Wait for user decision
dialog.waitForConsent()
  .then(consent => {
    console.log('User made a choice:', consent);
    initializeServices(consent);
  })
  .catch(error => {
    console.error('Error waiting for consent:', error);
  });
```

## Advanced Usage Examples

### Conditional Initialization

```javascript
async function initializeCookieDialog() {
  // Only initialize if not already done
  if (!CookieDialog.isInitialized()) {
    const dialog = CookieDialog.init({
      enableLocation: false, // false: Always show dialog, true: Only show in GDPR regions (requires geolocation)
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ]
    });

    // Set up event listeners
    dialog
      .on('accept', handleAccept)
      .on('reject', handleReject)
      .on('change', handleChange);

    return dialog;
  }
  
  return CookieDialog.getInstance();
}
```

### Service Integration Helper

```javascript
class CookieDialogHelper {
  constructor(config) {
    this.dialog = CookieDialog.init(config);
    this.services = new Map();
  }
  
  registerService(category, service) {
    if (!this.services.has(category)) {
      this.services.set(category, []);
    }
    this.services.get(category).push(service);
  }
  
  applyConsent() {
    const consent = this.dialog.getConsent();
    
    if (consent) {
      this.services.forEach((services, category) => {
        if (consent.categories[category]) {
          services.forEach(service => service.enable());
        } else {
          services.forEach(service => service.disable());
        }
      });
    }
  }
  
  showSettings() {
    this.dialog.show();
  }
}

// Usage
const helper = new CookieDialogHelper({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ]
});

helper.registerService('analytics', {
  enable: () => gtag('config', 'GA_MEASUREMENT_ID'),
  disable: () => console.log('Analytics disabled')
});
```

## Error Handling

API methods that can fail will throw errors or return error objects:

```javascript
try {
  const dialog = CookieDialog.init({
    invalidOption: true  // This might throw an error
  });
} catch (error) {
  console.error('Initialization failed:', error);
}

// Or with async operations
dialog.waitForConsent()
  .catch(error => {
    console.error('Failed to get consent:', error);
  });
```

## Best Practices

1. **Check initialization**: Use `CookieDialog.isInitialized()` before calling methods
2. **Handle errors**: Wrap API calls in try-catch blocks
3. **Clean up**: Call `destroy()` when removing dialog from SPA
4. **Use events**: Prefer event listeners over callbacks for better organization
5. **Chain methods**: Use method chaining for cleaner code