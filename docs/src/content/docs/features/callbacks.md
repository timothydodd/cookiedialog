---
title: Callbacks & Events
description: Learn how to respond to user actions with CookieDialog callbacks
---

# Callbacks & Events

CookieDialog provides several callback functions to help you respond to user actions and consent changes.

## Available Callbacks

### `onAccept`

Triggered when the user accepts cookies (either all or selective):

```javascript
CookieDialog.init({
  onAccept: (consent) => {
    console.log('User accepted cookies:', consent);
    
    // Access consent data
    console.log('Timestamp:', consent.timestamp);
    console.log('Categories:', consent.categories);
    
    // Enable services based on consent
    if (consent.categories.analytics) {
      enableAnalytics();
    }
    
    if (consent.categories.marketing) {
      enableMarketing();
    }
  }
});
```

### `onReject`

Triggered when the user rejects optional cookies:

```javascript
CookieDialog.init({
  onReject: (consent) => {
    console.log('User rejected optional cookies:', consent);
    
    // Only necessary cookies will be enabled
    // Disable optional services
    disableAnalytics();
    disableMarketing();
  }
});
```

### `onChange`

Triggered whenever consent settings are modified:

```javascript
CookieDialog.init({
  onChange: (consent) => {
    console.log('Consent settings changed:', consent);
    
    // Update services based on new consent
    updateServicesBasedOnConsent(consent);
  }
});
```


## Consent Data Structure

All callbacks receive a consent object with this structure:

```javascript
{
  timestamp: 1640995200000,    // When consent was given
  expires: 1672531200000,      // When consent expires
  categories: {                // Consent status for each category
    necessary: true,
    analytics: false,
    marketing: true,
    personalization: false
  },
  version: "1.0.0"            // Library version
}
```

## Practical Examples

### Google Analytics Integration (GA4 with Consent Mode)

```javascript
// Load GA4 with denied consent by default
function initializeGoogleAnalytics() {
  if (window.gtag) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(script);

  script.onload = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    
    // Set default consent state (denied for GDPR compliance)
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500
    });
    
    gtag('config', 'GA_MEASUREMENT_ID', {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=Strict;Secure'
    });
  };
}

// Update consent based on user choices
function updateGoogleConsent(consent) {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.categories.analytics ? 'granted' : 'denied',
      'ad_storage': consent.categories.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.categories.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.categories.marketing ? 'granted' : 'denied'
    });
  }
}

// Initialize on page load
window.addEventListener('load', function() {
  // Initialize CookieDialog first
  const dialog = CookieDialog.init({
    enableLocation: false, // false: Always show dialog, true: Only show in GDPR regions (requires geolocation)
    categories: [
      { id: 'necessary', name: 'Essential', required: true },
      { id: 'analytics', name: 'Analytics', required: false },
      { id: 'marketing', name: 'Marketing', required: false }
    ],
    
    onAccept: (consent) => {
      updateGoogleConsent(consent);
      
      // Track consent event
      if (consent.categories.analytics && window.gtag) {
        gtag('event', 'cookie_consent', {
          'consent_action': 'accept',
          'analytics_consent': 'granted',
          'marketing_consent': consent.categories.marketing ? 'granted' : 'denied'
        });
      }
    },
    
    onReject: (consent) => {
      updateGoogleConsent(consent);
    },
    
    onChange: (consent) => {
      updateGoogleConsent(consent);
    },
  });
  
  // Load Google Analytics after CookieDialog initialization
  const hasExistingConsent = dialog.hasConsent();
  const existingConsent = hasExistingConsent ? dialog.getConsent() : null;
  
  // Initialize GA with current consent state
  initializeGoogleAnalytics(existingConsent);
});
```

For a complete guide, see [Google Analytics Integration](/examples/google-analytics) or [Microsoft Clarity Integration](/examples/clarity).

### Marketing Pixels Integration

```javascript
CookieDialog.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'marketing', name: 'Marketing', required: false }
  ],
  
  onAccept: (consent) => {
    if (consent.categories.marketing) {
      // Initialize Facebook Pixel
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    }
  },
  
  onChange: (consent) => {
    if (!consent.categories.marketing && typeof fbq !== 'undefined') {
      // Disable Facebook Pixel if consent withdrawn
      fbq('consent', 'revoke');
    }
  }
});
```

### Chat Widget Integration

```javascript
CookieDialog.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'functional', name: 'Functional', required: false }
  ],
  
  onAccept: (consent) => {
    if (consent.categories.functional) {
      // Load chat widget
      loadChatWidget();
    }
  },
  
  onReject: (consent) => {
    // Remove chat widget if present
    removeChatWidget();
  }
});

function loadChatWidget() {
  if (document.getElementById('chat-widget')) return;
  
  const script = document.createElement('script');
  script.id = 'chat-widget';
  script.src = 'https://widget.intercom.io/widget/app_id';
  script.async = true;
  document.head.appendChild(script);
}

function removeChatWidget() {
  const widget = document.getElementById('chat-widget');
  if (widget) widget.remove();
  
  // Clear Intercom data
  if (window.Intercom) {
    window.Intercom('shutdown');
  }
}
```

## Advanced Callback Patterns

### Service Manager Pattern

```javascript
class ServiceManager {
  constructor() {
    this.services = new Map();
  }
  
  register(category, service) {
    if (!this.services.has(category)) {
      this.services.set(category, []);
    }
    this.services.get(category).push(service);
  }
  
  enable(category) {
    const services = this.services.get(category) || [];
    services.forEach(service => service.enable());
  }
  
  disable(category) {
    const services = this.services.get(category) || [];
    services.forEach(service => service.disable());
  }
}

const serviceManager = new ServiceManager();

// Register services
serviceManager.register('analytics', {
  enable: () => gtag('config', 'GA_MEASUREMENT_ID'),
  disable: () => gtag('remove')
});

serviceManager.register('marketing', {
  enable: () => fbq('init', 'PIXEL_ID'),
  disable: () => fbq('consent', 'revoke')
});

// Use with CookieDialog
CookieDialog.init({
  onAccept: (consent) => {
    Object.keys(consent.categories).forEach(category => {
      if (consent.categories[category]) {
        serviceManager.enable(category);
      } else {
        serviceManager.disable(category);
      }
    });
  }
});
```

### Async Service Initialization

```javascript
CookieDialog.init({
  onAccept: async (consent) => {
    const promises = [];
    
    if (consent.categories.analytics) {
      promises.push(initializeAnalytics());
    }
    
    if (consent.categories.marketing) {
      promises.push(initializeMarketing());
    }
    
    if (consent.categories.personalization) {
      promises.push(initializePersonalization());
    }
    
    try {
      await Promise.all(promises);
      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }
});

async function initializeAnalytics() {
  // Load Google Analytics script
  await loadScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID');
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### Event Emitter Pattern

```javascript
class CookieConsentEmitter extends EventTarget {
  constructor() {
    super();
    this.init();
  }
  
  init() {
    CookieDialog.init({
      onAccept: (consent) => {
        this.dispatchEvent(new CustomEvent('consent:accept', {
          detail: consent
        }));
      },
      
      onReject: (consent) => {
        this.dispatchEvent(new CustomEvent('consent:reject', {
          detail: consent
        }));
      },
      
      onChange: (consent) => {
        this.dispatchEvent(new CustomEvent('consent:change', {
          detail: consent
        }));
      }
    });
  }
}

const consentEmitter = new CookieConsentEmitter();

// Listen for events anywhere in your application
consentEmitter.addEventListener('consent:accept', (event) => {
  const consent = event.detail;
  console.log('Consent accepted:', consent);
});

consentEmitter.addEventListener('consent:change', (event) => {
  const consent = event.detail;
  console.log('Consent changed:', consent);
});
```

## Error Handling in Callbacks

```javascript
CookieDialog.init({
  onAccept: (consent) => {
    try {
      if (consent.categories.analytics) {
        initializeAnalytics();
      }
      
      if (consent.categories.marketing) {
        initializeMarketing();
      }
    } catch (error) {
      console.error('Error in onAccept callback:', error);
      
      // Report error to monitoring service
      if (typeof Sentry !== 'undefined') {
        Sentry.captureException(error);
      }
    }
  },
  
  onReject: (consent) => {
    try {
      // Cleanup services
      cleanupOptionalServices();
    } catch (error) {
      console.error('Error in onReject callback:', error);
    }
  }
});
```

## Best Practices

1. **Keep callbacks lightweight**: Avoid heavy operations that might block the UI
2. **Handle errors gracefully**: Wrap callback code in try-catch blocks
3. **Use async patterns**: For service initialization that involves network requests
4. **Clean up properly**: Remove event listeners and clear data when consent is withdrawn
5. **Test thoroughly**: Ensure callbacks work correctly in all scenarios