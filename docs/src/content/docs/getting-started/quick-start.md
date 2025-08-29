---
title: Quick Start
description: Get up and running with CookieDialog in minutes
---

# Quick Start Guide

Get CookieDialog up and running on your website in less than 5 minutes.

## 1. Choose Your Installation Method

### Option A: CDN (Easiest)

Add these two lines to your HTML `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js"></script>
```

### Option B: NPM

Install via npm:

```bash
npm install cookiedialog
```

Then import in your JavaScript:

```javascript
import CookieDialog from 'cookiedialog';
import 'cookiedialog/dist/cookiedialog.min.css';
```

## 2. Initialize CookieDialog

Add this JavaScript to your page:

```javascript
// Basic initialization
CookieDialog.init();

// Or with configuration
CookieDialog.init({
  enableLocation: false, // false: Always show dialog, true: Only show in GDPR regions (requires geolocation)
  privacyUrl: '/privacy-policy',
  theme: 'dark',
  position: 'bottom',
  onAccept: (consent) => {
    console.log('User accepted cookies:', consent);
    // Enable your analytics, marketing tools, etc.
  },
  onReject: () => {
    console.log('User rejected cookies');
    // Disable non-essential cookies
  }
});
```

## 3. That's It!

The cookie dialog will now:
- Automatically appear for new visitors
- Remember user preferences in localStorage
- Only show in GDPR regions if geolocation is enabled
- Provide callbacks for handling consent

## Complete Example

Here's a complete HTML page with CookieDialog:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  
  <!-- CookieDialog CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css">
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- CookieDialog JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js"></script>
  
  <script>
    // Initialize CookieDialog
    const dialog = CookieDialog.init({
      enableLocation: true,
      privacyUrl: '/privacy',
      categories: [
        {
          id: 'necessary',
          name: 'Essential',
          description: 'Required for the site to work',
          required: true
        },
        {
          id: 'analytics',
          name: 'Analytics',
          description: 'Helps us improve our site',
          required: false
        }
      ],
      onAccept: (consent) => {
        // Check which categories were accepted
        if (consent.categories.analytics) {
          // Initialize Google Analytics
          console.log('Analytics enabled');
        }
      }
    });
  </script>
</body>
</html>
```

## Next Steps

- [Learn about configuration options](/config/options)
- [Customize the appearance](/config/themes)
- [Add translations](/config/translations)
- [Set up geolocation](/features/geolocation)