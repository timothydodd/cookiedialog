---
title: Google Analytics Integration
description: How to integrate CookieDialog with Google Analytics 4 (GA4) for GDPR-compliant tracking
---

# Google Analytics Integration

This guide shows how to integrate CookieDialog with Google Analytics 4 (GA4) while maintaining GDPR compliance through proper consent management.

## Prerequisites

1. A Google Analytics 4 property and Measurement ID
2. CookieDialog installed on your website

## Getting Your GA4 Measurement ID

1. Sign in to [Google Analytics](https://analytics.google.com)
2. Select your property or create a new one
3. Go to Admin → Data Streams
4. Select your web stream
5. Copy your Measurement ID (it looks like: `G-XXXXXXXXXX`)

## Basic Integration

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <!-- CookieDialog CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.css">
</head>
<body>
  <!-- Your content -->
  
  <!-- CookieDialog JS -->
  <script src="https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.js"></script>
  
  <!-- Integration Script -->
  <script>
    // Your Google Analytics configuration
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual ID
    
    // Initialize analytics with consent management
    window.addEventListener('load', function() {
      initializeAnalyticsWithConsent();
    });
  </script>
</body>
</html>
```

## Complete Integration with Consent Management

This implementation loads Google Analytics with denied consent by default, then updates based on user choices:

```javascript
const CONFIG = {
  googleAnalyticsId: 'G-XXXXXXXXXX', // Replace with your GA4 Measurement ID
};

// Initialize Google Analytics with denied consent by default
function initializeGoogleAnalytics() {
  if (window.gtag) {
    console.log('Google Analytics already loaded');
    return;
  }
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.googleAnalyticsId}`;
  document.head.appendChild(script);

  script.onload = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    
    // Set default consent state - everything denied for GDPR compliance
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500 // Wait 500ms for consent update
    });
    
    // Initialize GA4 with privacy-friendly settings
    gtag('config', CONFIG.googleAnalyticsId, {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=Strict;Secure'
    });
    
    console.log('Google Analytics loaded with default denied consent');
  };
}

// Update Google Analytics consent based on user choices
function updateGoogleConsent(consent) {
  if (window.gtag && consent && consent.categories) {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.categories.analytics ? 'granted' : 'denied',
      'ad_storage': consent.categories.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.categories.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.categories.marketing ? 'granted' : 'denied'
    });
    
    console.log('GA4 consent updated:', {
      analytics: consent.categories.analytics ? 'granted' : 'denied',
      advertising: consent.categories.marketing ? 'granted' : 'denied'
    });
  }
}

// Initialize everything on page load
window.addEventListener('load', function() {
  // Initialize CookieDialog first
  const dialog = CookieDialog.init({
    position: 'bottom',
    theme: 'light',
    privacyUrl: '/privacy-policy/',
    enableLocation: false, // false: Always show dialog, true: Only show in GDPR regions (requires geolocation)
    categories: [
      {
        id: 'necessary',
        name: 'Essential',
        required: true,
        description: 'Required for the website to function'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        required: false,
        description: 'Google Analytics for website insights'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        required: false,
        description: 'Marketing and advertising cookies'
      }
    ],
    texts: {
      title: 'We use cookies',
      description: 'We use cookies to enhance your experience and analyze site traffic with Google Analytics.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      manageSettings: 'Manage Settings'
    },
    onAccept: function(consent) {
      updateGoogleConsent(consent);
    },
    onReject: function(consent) {
      updateGoogleConsent(consent);
    },
    onChange: function(consent) {
      updateGoogleConsent(consent);
    }
  });
  
  // Load Google Analytics after CookieDialog initialization
  const hasExistingConsent = dialog.hasConsent();
  const existingConsent = hasExistingConsent ? dialog.getConsent() : null;
  
  // Initialize Google Analytics with current consent state
  initializeGoogleAnalytics(existingConsent);
});
```

## Google Analytics Consent Properties

GA4 supports four consent properties:

| Property | Description | Maps to Category |
|----------|-------------|------------------|
| `analytics_storage` | Controls analytics cookies and data | `analytics` category |
| `ad_storage` | Controls advertising cookies | `marketing` category |
| `ad_user_data` | Controls user data for advertising | `marketing` category |
| `ad_personalization` | Controls personalized advertising | `marketing` category |

## Advanced Configuration

### Custom Events Based on Consent

Track consent changes as events in GA4:

```javascript
function trackConsentEvent(action, categories) {
  if (window.gtag) {
    gtag('event', 'consent_update', {
      'consent_action': action,
      'analytics_consent': categories.analytics ? 'granted' : 'denied',
      'marketing_consent': categories.marketing ? 'granted' : 'denied'
    });
  }
}

// Use in CookieDialog callbacks
CookieDialog.init({
  onAccept: function(consent) {
    updateGoogleConsent(consent);
    trackConsentEvent('accept', consent.categories);
  },
  onReject: function(consent) {
    updateGoogleConsent(consent);
    trackConsentEvent('reject', consent.categories);
  }
});
```

### Region-Specific Default Consent

Set different default consent based on user region:

```javascript
// Set region-specific defaults
function setRegionalDefaults() {
  // Get user's region (implement your own detection)
  const userRegion = detectUserRegion();
  
  if (userRegion === 'EU') {
    // Strict defaults for EU
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'region': ['EU']
    });
  } else if (userRegion === 'US') {
    // More permissive defaults for US
    gtag('consent', 'default', {
      'ad_storage': 'granted',
      'analytics_storage': 'granted',
      'region': ['US']
    });
  }
}
```

## Testing Your Integration

### 1. Verify Consent Mode

Open your browser's developer console and check for consent messages:

```javascript
// Check if gtag is loaded
console.log('gtag loaded:', typeof window.gtag !== 'undefined');

// Manually test consent updates
window.gtag('consent', 'update', {
  'analytics_storage': 'granted',
  'ad_storage': 'granted'
});
```

### 2. Use Google Tag Assistant

1. Install the [Google Tag Assistant Chrome extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Navigate to your website
3. Check that consent mode is working correctly

### 3. Check Real-Time Reports

1. Go to Google Analytics → Reports → Real-time
2. Test with consent granted - you should see your session
3. Test with consent denied - no data should appear

## Debugging Tips

### Common Issues and Solutions

**GA not loading:**
```javascript
// Check for script blocking
if (!window.gtag) {
  console.error('Google Analytics failed to load');
  // Check for ad blockers or network issues
}
```

**Consent not updating:**
```javascript
// Add debug logging
window.gtag('event', 'consent_debug', {
  'consent_state': JSON.stringify({
    analytics: consent.categories.analytics,
    marketing: consent.categories.marketing
  })
});
```

**Events not tracking:**
```javascript
// Ensure consent is granted before tracking
if (consent.categories.analytics) {
  gtag('event', 'custom_event', {
    'event_category': 'engagement',
    'event_label': 'method'
  });
}
```

## Best Practices

1. **Always start with denied consent** - Never assume consent
2. **Use `wait_for_update`** - Give time for consent to be retrieved
3. **Anonymize IP addresses** - Add extra privacy protection
4. **Use secure cookie flags** - Enhance cookie security
5. **Test in incognito mode** - Ensure fresh consent flow works
6. **Document consent flows** - Keep records for compliance

## Cookieless Tracking (Consent Mode v2)

Google's Consent Mode v2 allows basic measurements without cookies when consent is denied:

```javascript
// Enable consent mode v2 with URL passthrough
gtag('config', CONFIG.googleAnalyticsId, {
  'anonymize_ip': true,
  'cookie_flags': 'SameSite=Strict;Secure',
  'url_passthrough': true, // Pass click information via URL
  'ads_data_redaction': true // Redact ads data when consent denied
});
```

This provides:
- Basic page view counts
- Session counts by country
- Conversion modeling
- No cookies or persistent identifiers

## Complete Example with Both GA4 and Clarity

```javascript
const CONFIG = {
  googleAnalyticsId: 'G-XXXXXXXXXX',
  microsoftClarityId: 'your-clarity-id'
};

// Load both analytics tools
function initializeAllAnalytics() {
  initializeGoogleAnalytics();
  initializeMicrosoftClarity();
}

// Update all analytics consents
function updateAllAnalyticsConsent(consent) {
  updateGoogleConsent(consent);
  updateClarityConsent(consent);
}

// Single initialization
window.addEventListener('load', function() {
  // Configure CookieDialog first
  const dialog = CookieDialog.init({
    enableLocation: false, // false: Always show dialog, true: Only show in GDPR regions
    // ... your configuration ...
    onAccept: updateAllAnalyticsConsent,
    onReject: updateAllAnalyticsConsent,
    onChange: updateAllAnalyticsConsent
  });
  
  // Load analytics after CookieDialog initialization
  const hasExistingConsent = dialog.hasConsent();
  const existingConsent = hasExistingConsent ? dialog.getConsent() : null;
  
  // Initialize all analytics with current consent state
  initializeAllAnalytics(existingConsent);
});
```

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics)
- [Consent Mode Documentation](https://support.google.com/analytics/answer/9976101)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [CookieDialog API Reference](/features/api)
- [Microsoft Clarity Integration](/examples/clarity)