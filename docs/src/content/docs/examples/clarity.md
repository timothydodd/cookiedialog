---
title: Microsoft Clarity Integration
description: How to integrate CookieDialog with Microsoft Clarity for GDPR-compliant analytics
---

# Microsoft Clarity Integration

This guide shows how to integrate CookieDialog with Microsoft Clarity while maintaining GDPR compliance through proper consent management.

## Prerequisites

1. A Microsoft Clarity account and project ID
2. CookieDialog installed on your website

## Getting Your Clarity Project ID

1. Sign in to [Microsoft Clarity](https://clarity.microsoft.com)
2. Select your project or create a new one
3. Go to Settings → Setup
4. Copy your Project ID (it looks like: `abc123xyz`)

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
    // Your Clarity configuration
    const CLARITY_PROJECT_ID = 'your-project-id'; // Replace with your actual ID
    
    // Initialize analytics with consent management
    window.addEventListener('load', function() {
      initializeAnalyticsWithConsent();
    });
  </script>
</body>
</html>
```

## Complete Integration with Consent Management

This implementation loads Clarity with denied consent by default, then updates based on user choices:

```javascript
const CONFIG = {
  clarityProjectId: 'your-project-id', // Replace with your Clarity Project ID
};

// Initialize Microsoft Clarity with denied consent by default
function initializeMicrosoftClarity() {
  if (window.clarity) {
    console.log('Microsoft Clarity already loaded');
    return;
  }
  
  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    
    t.onload = function() {
      console.log('Microsoft Clarity loaded successfully');
      // Set initial denied state for GDPR compliance
      if (window.clarity) {
        window.clarity('consentv2', {
          ad_storage: 'denied',
          analytics_storage: 'denied'
        });
      }
    };
    
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CONFIG.clarityProjectId);
}

// Update Clarity consent based on user choices
function updateClarityConsent(consent) {
  if (window.clarity && consent && consent.categories) {
    window.clarity('consentv2', {
      ad_storage: consent.categories.marketing ? 'granted' : 'denied',
      analytics_storage: consent.categories.analytics ? 'granted' : 'denied'
    });
    
    console.log('Clarity consent updated:', {
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
        description: 'Microsoft Clarity for user experience insights'
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
      description: 'We use cookies to enhance your experience and gather insights through Microsoft Clarity.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      manageSettings: 'Manage Settings'
    },
    onAccept: function(consent) {
      updateClarityConsent(consent);
    },
    onReject: function(consent) {
      updateClarityConsent(consent);
    },
    onChange: function(consent) {
      updateClarityConsent(consent);
    }
  });
  
  // Load Microsoft Clarity after CookieDialog initialization
  const hasExistingConsent = dialog.hasConsent();
  const existingConsent = hasExistingConsent ? dialog.getConsent() : null;
  
  // Initialize Clarity with current consent state
  initializeMicrosoftClarity(existingConsent);
});
```

## Clarity Consent Properties

Microsoft Clarity supports two consent properties:

| Property | Description | Maps to Category |
|----------|-------------|------------------|
| `analytics_storage` | Controls analytics data collection | `analytics` category |
| `ad_storage` | Controls advertising-related data | `marketing` category |

## Combining with Google Analytics

If you're using both Google Analytics and Microsoft Clarity:

```javascript
const CONFIG = {
  googleAnalyticsId: 'G-XXXXXXXXXX',
  clarityProjectId: 'your-project-id',
};

// Load both analytics tools with denied consent
function initializeAnalytics() {
  initializeGoogleAnalytics();  // Implementation shown in Google Analytics guide
  initializeMicrosoftClarity();
}

// Update all analytics consents
function updateAllConsents(consent) {
  updateGoogleConsent(consent);  // Update Google Analytics
  updateClarityConsent(consent); // Update Microsoft Clarity
}

// Use in CookieDialog callbacks
CookieDialog.init({
  // ... configuration ...
  onAccept: function(consent) {
    updateAllConsents(consent);
  },
  onReject: function(consent) {
    updateAllConsents(consent);
  },
  onChange: function(consent) {
    updateAllConsents(consent);
  }
});
```

## Testing Your Integration

1. **Clear your browser data** to test fresh consent flow
2. **Open browser console** to see consent update logs
3. **Check Clarity dashboard** to verify data collection:
   - With consent: You should see session recordings
   - Without consent: No data should be collected

### Console Verification

When properly configured, you should see these console messages:

```
✅ Microsoft Clarity loaded successfully
✅ Clarity consent updated: {analytics: "granted", advertising: "denied"}
```

## Debugging Tips

### Clarity Not Loading
- Verify your Project ID is correct
- Check for console errors
- Ensure script isn't blocked by ad blockers

### Consent Not Updating
- Verify `window.clarity` exists before calling `consentv2`
- Check that consent object has the expected structure
- Add console logs to debug consent flow

### Testing Consent States

```javascript
// Manually test consent updates in console
window.clarity('consentv2', {
  ad_storage: 'granted',
  analytics_storage: 'granted'
});

// Check if Clarity is recording
console.log('Clarity loaded:', typeof window.clarity !== 'undefined');
```

## Best Practices

1. **Load Clarity immediately** with denied consent - don't wait for user action
2. **Default to denied** - All consent properties should start as 'denied'
3. **Update dynamically** - Use `consentv2` to update consent without reloading
4. **Test thoroughly** - Verify no data is collected before consent is given
5. **Document your setup** - Keep track of your Project ID and configuration

## Privacy Considerations

- **IP Anonymization**: Clarity automatically masks sensitive content
- **Data Retention**: Clarity retains data for 30 days by default
- **User Rights**: Ensure your privacy policy covers Clarity usage
- **Regional Compliance**: Use geolocation to show consent only where required

## Resources

- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Clarity Consent Management](https://docs.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent)
- [CookieDialog API Reference](/features/api)
- [Privacy Policy Template](/examples/privacy-policy)