<div align="center">
  <img src="logo.png" alt="CookieDialog Logo" width="120" height="120">
  <h1>CookieDialog</h1>
  <p>A lightweight, customizable GDPR cookie consent dialog with built-in geolocation support. Zero dependencies, easy integration via CDN or NPM.</p>
</div>

[![npm version](https://img.shields.io/npm/v/cookiedialog.svg)](https://www.npmjs.com/package/cookiedialog)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/cookiedialog)](https://bundlephobia.com/package/cookiedialog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Less than 20KB gzipped
- 📍 **Geolocation Detection** - Automatically detect if GDPR compliance is required
- 💾 **Local Storage** - Persistent consent management
- 🎨 **Customizable** - Multiple themes and full translation support
- 📱 **Responsive** - Mobile-friendly design
- 🔧 **Zero Dependencies** - Pure JavaScript, no external libraries required
- ⚡ **Easy Integration** - Simple CDN or NPM installation

## Quick Start

### CDN Installation

Add these lines to your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js"></script>

<script>
  CookieDialog.init({
    enableLocation: true,
    privacyUrl: '/privacy',
    onAccept: (consent) => {
      console.log('Consent given:', consent);
    }
  });
</script>
```

### NPM Installation

```bash
npm install cookiedialog
```

```javascript
import CookieDialog from 'cookiedialog';
import 'cookiedialog/dist/cookiedialog.min.css';

const dialog = new CookieDialog({
  enableLocation: true,
  theme: 'dark',
  position: 'bottom'
});

dialog.init();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableLocation` | boolean | false | Enable geolocation detection for GDPR regions |
| `autoShow` | boolean | true | Automatically show dialog on page load |
| `position` | string | 'bottom' | Dialog position: 'bottom', 'top', or 'center' |
| `theme` | string | 'light' | Theme: 'light' or 'dark' |
| `privacyUrl` | string | undefined | URL to your privacy policy |
| `cookiePolicyUrl` | string | undefined | URL to your cookie policy |
| `expiryDays` | number | 365 | Consent expiry in days |
| `forceShow` | boolean | false | Always show dialog regardless of consent |
| `categories` | array | [...] | Cookie categories configuration |
| `translations` | object | {...} | Custom translations |
| `onAccept` | function | undefined | Callback when user accepts (includes reason and location data) |
| `onReject` | function | undefined | Callback when user rejects |
| `onChange` | function | undefined | Callback when settings change |
| `onLocationNotRequired` | function | undefined | Callback when geolocation determines consent not needed |

## API Methods

```javascript
const dialog = CookieDialog.init(config);

// Show/hide dialog
dialog.show();
dialog.hide();

// Get consent status
const consent = dialog.getConsent();
// Returns: { 
//   timestamp: 123456789, 
//   categories: { necessary: true, analytics: false }, 
//   version: '1.0.0',
//   reason: 'user_accept' | 'user_reject' | 'location_not_required',
//   locationData?: { country: 'US', region: 'California', inEU: false, detectionMethod: 'ip_geolocation' }
// }

// Check if consent exists
const hasConsent = dialog.hasConsent(); // boolean

// Get specific category consent
const analyticsConsent = dialog.getCategoryConsent('analytics'); // boolean

// Reset consent
dialog.resetConsent();

// Destroy dialog
dialog.destroy();
```

## Custom Categories

```javascript
CookieDialog.init({
  categories: [
    {
      id: 'necessary',
      name: 'Essential Cookies',
      description: 'Required for the website to function',
      required: true
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand how you use our site',
      required: false
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Used for targeted advertising',
      required: false
    }
  ]
});
```

## Custom Translations

```javascript
CookieDialog.init({
  translations: {
    title: 'Cookie Preferences',
    description: 'We use cookies to improve your experience',
    acceptButton: 'Accept All',
    rejectButton: 'Reject All',
    settingsButton: 'Manage Settings',
    privacyLink: 'Privacy Policy',
    // ... more translations
  }
});
```

## Geolocation Detection

When `enableLocation` is enabled, the dialog will automatically detect if the user is in a GDPR-required region (EU/EEA) and only show the dialog if necessary.

```javascript
CookieDialog.init({
  enableLocation: true,
  geolocationEndpoint: 'https://your-api.com/location', // Optional custom endpoint
  onLocationNotRequired: (locationData) => {
    console.log('GDPR not required for:', locationData);
    // User is not in EU/EEA - all cookies automatically accepted
  },
  onAccept: (consent) => {
    if (consent.reason === 'location_not_required') {
      console.log('Auto-accepted due to location:', consent.locationData);
    } else if (consent.reason === 'user_accept') {
      console.log('User manually accepted cookies');
    }
  }
});
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Opera 74+

## Development

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Run tests
npm test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Documentation

📚 **Full documentation available at:**

**Docker (Self-hosted)**:
```bash
docker run -p 8080:80 timdoddcool/cookiedialog:latest
# Visit http://localhost:8080
```

**Online**: [cookiedialog.com](https://cookiedialog.com)

See [DOCKER.md](DOCKER.md) for detailed deployment instructions.

## Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/timothydodd/cookiedialog/issues).