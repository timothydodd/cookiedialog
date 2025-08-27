---
title: Basic Usage
description: Learn the basics of using CookieDialog in your website
---

# Basic Usage

Once you have CookieDialog [installed](/getting-started/installation), you can start using it with just a few lines of code.

## Simple Initialization

The easiest way to get started is to call `CookieDialog.init()`:

```javascript
// Initialize with default settings
CookieDialog.init();
```

This will:
- Show the cookie dialog on first visit
- Store user preferences in localStorage
- Remember the choice for 365 days

## Basic Configuration

You can customize the dialog with configuration options:

```javascript
CookieDialog.init({
  position: 'bottom',        // 'top', 'bottom', or 'center'
  theme: 'light',           // 'light' or 'dark'
  privacyUrl: '/privacy',   // Link to privacy policy
  expiryDays: 365          // How long to remember choice
});
```

## Cookie Categories

Define what types of cookies your site uses:

```javascript
CookieDialog.init({
  categories: [
    { 
      id: 'necessary', 
      name: 'Essential Cookies', 
      required: true,
      description: 'Required for the website to function'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      required: false,
      description: 'Help us improve our website'
    },
    { 
      id: 'marketing', 
      name: 'Marketing', 
      required: false,
      description: 'Used for advertising and marketing'
    }
  ]
});
```

## Handling User Choices

React to user consent with callbacks:

```javascript
CookieDialog.init({
  onAccept: (consent) => {
    console.log('User accepted cookies:', consent);
    
    // Enable analytics if consented
    if (consent.categories.analytics) {
      // Initialize Google Analytics, etc.
    }
    
    // Enable marketing if consented
    if (consent.categories.marketing) {
      // Initialize marketing pixels, etc.
    }
  },
  
  onReject: (consent) => {
    console.log('User rejected optional cookies:', consent);
    // Only necessary cookies will be enabled
  }
});
```

## Complete Example

Here's a full example showing common usage:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css">
</head>
<body>
  <h1>My Website</h1>
  
  <script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js"></script>
  <script>
    CookieDialog.init({
      position: 'bottom',
      theme: 'light',
      privacyUrl: '/privacy-policy',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ],
      onAccept: (consent) => {
        if (consent.categories.analytics) {
          // Enable Google Analytics
          gtag('config', 'GA_MEASUREMENT_ID');
        }
      }
    });
  </script>
</body>
</html>
```

## Next Steps

- Learn about [Configuration Options](/config/options)
- Explore [Geolocation Features](/features/geolocation)
- See [Framework Examples](/examples/react)