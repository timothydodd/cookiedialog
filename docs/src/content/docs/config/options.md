---
title: Configuration Options
description: Complete reference of all CookieDialog configuration options
---

# Configuration Options

CookieDialog accepts a configuration object with the following options:

## Basic Options

### `position`
- **Type:** `'top' | 'bottom' | 'center'`
- **Default:** `'bottom'`
- **Description:** Where to display the cookie dialog

```javascript
CookieDialog.init({
  position: 'center'
});
```

### `theme`
- **Type:** `'light' | 'dark'`
- **Default:** `'light'`
- **Description:** Visual theme of the dialog

```javascript
CookieDialog.init({
  theme: 'dark'
});
```

### `privacyUrl`
- **Type:** `string`
- **Default:** `null`
- **Description:** URL to your privacy policy page

```javascript
CookieDialog.init({
  privacyUrl: '/privacy-policy'
});
```

## Storage Options

### `expiryDays`
- **Type:** `number`
- **Default:** `365`
- **Description:** How many days to remember user's choice

```javascript
CookieDialog.init({
  expiryDays: 90  // Remember for 90 days
});
```

### `storageKey`
- **Type:** `string`
- **Default:** `'cookiedialog_consent'`
- **Description:** LocalStorage key for storing consent data

```javascript
CookieDialog.init({
  storageKey: 'my_custom_consent_key'
});
```

## Display Options

### `forceShow`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Always show dialog, ignoring stored consent

```javascript
CookieDialog.init({
  forceShow: true  // Useful for testing
});
```

### `showSettingsButton`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show the "Manage Settings" button

```javascript
CookieDialog.init({
  showSettingsButton: false
});
```

## Geolocation Options

### `enableLocation`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Only show dialog to users in GDPR regions

```javascript
CookieDialog.init({
  enableLocation: true
});
```

### `locationEndpoint`
- **Type:** `string`
- **Default:** `'https://ipapi.co/json/'`
- **Description:** API endpoint for IP-based location detection

```javascript
CookieDialog.init({
  enableLocation: true,
  locationEndpoint: 'https://my-custom-geo-api.com/location'
});
```

## Text Customization

### `texts`
- **Type:** `object`
- **Description:** Customize dialog text and translations

```javascript
CookieDialog.init({
  texts: {
    title: 'Cookie Preferences',
    description: 'We use cookies to enhance your experience.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    manageSettings: 'Manage Settings',
    save: 'Save Preferences',
    necessary: 'Necessary',
    analytics: 'Analytics',
    marketing: 'Marketing'
  }
});
```

## Callback Functions

### `onAccept`
- **Type:** `(consent: ConsentData) => void`
- **Description:** Called when user accepts cookies

```javascript
CookieDialog.init({
  onAccept: (consent) => {
    console.log('Accepted:', consent);
  }
});
```

### `onReject`
- **Type:** `(consent: ConsentData) => void`
- **Description:** Called when user rejects optional cookies

```javascript
CookieDialog.init({
  onReject: (consent) => {
    console.log('Rejected:', consent);
  }
});
```

### `onChange`
- **Type:** `(consent: ConsentData) => void`
- **Description:** Called whenever consent settings change

```javascript
CookieDialog.init({
  onChange: (consent) => {
    console.log('Settings changed:', consent);
  }
});
```

## Complete Example

```javascript
CookieDialog.init({
  // Basic options
  position: 'bottom',
  theme: 'light',
  privacyUrl: '/privacy',
  
  // Storage
  expiryDays: 365,
  storageKey: 'my_consent',
  
  // Display
  forceShow: false,
  showSettingsButton: true,
  
  // Geolocation
  enableLocation: true,
  
  // Categories
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ],
  
  // Callbacks
  onAccept: (consent) => {
    if (consent.categories.analytics) {
      // Enable analytics
    }
  }
});
```