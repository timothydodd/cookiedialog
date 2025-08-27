---
title: Geolocation Detection
description: Learn how to use IP-based geolocation to show the cookie dialog only in GDPR regions
---

# Geolocation Detection

CookieDialog can automatically detect user location and only show the cookie dialog to visitors from GDPR regions (EU/EEA countries).

## Basic Usage

Enable geolocation detection by setting `enableLocation: true`:

```javascript
CookieDialog.init({
  enableLocation: true
});
```

When enabled, the dialog will:
1. Make an API call to detect the user's country
2. Only show if the user is in a GDPR region
3. Fall back to showing the dialog if location detection fails

## GDPR Regions

The following regions are considered GDPR regions where the dialog will be shown:

**European Union (EU):**
- Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic
- Denmark, Estonia, Finland, France, Germany, Greece
- Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg
- Malta, Netherlands, Poland, Portugal, Romania, Slovakia
- Slovenia, Spain, Sweden

**European Economic Area (EEA):**
- Iceland, Liechtenstein, Norway

**Additional:**
- United Kingdom (post-Brexit GDPR compliance)

## Custom Location Endpoint

By default, CookieDialog uses `ipapi.co` for location detection. You can specify a custom endpoint:

```javascript
CookieDialog.init({
  enableLocation: true,
  locationEndpoint: 'https://api.my-site.com/location'
});
```

### Expected Response Format

Your custom endpoint should return JSON with a country code:

```json
{
  "country_code": "DE"
}
```

Alternative supported formats:
```json
{
  "country": "DE"
}
```

```json
{
  "countryCode": "DE"  
}
```

## Error Handling

If location detection fails, CookieDialog will show the dialog by default (fail-safe approach):

```javascript
CookieDialog.init({
  enableLocation: true,
  onLocationError: (error) => {
    console.log('Location detection failed:', error);
    // Dialog will still be shown
  }
});
```

## Testing Geolocation

### Force Show for Testing

Use `forceShow: true` to always display the dialog regardless of location:

```javascript
CookieDialog.init({
  enableLocation: true,
  forceShow: true  // Always show for testing
});
```

### Mock Location Response

For development, you can mock the location response:

```javascript
// Mock fetch for testing
if (window.location.hostname === 'localhost') {
  const originalFetch = window.fetch;
  window.fetch = (url) => {
    if (url.includes('ipapi.co')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ country_code: 'DE' }) // Mock German location
      });
    }
    return originalFetch(url);
  };
}

CookieDialog.init({
  enableLocation: true
});
```

## Privacy Considerations

### IP Address Processing

When using geolocation:
- The user's IP address is sent to the location service
- Consider mentioning this in your privacy policy
- IP addresses are typically not stored by reputable services

### GDPR Compliance

```javascript
// Example privacy-friendly implementation
CookieDialog.init({
  enableLocation: true,
  texts: {
    description: 'We use cookies to improve your experience. Your IP address is used only to determine if this notice is required by law and is not stored.',
  },
  privacyUrl: '/privacy-policy'
});
```

## Custom Location Logic

For more control, implement your own location detection:

```javascript
async function checkIfGDPRRegion() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const gdprCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB'
    ];
    
    return gdprCountries.includes(data.country_code);
  } catch (error) {
    console.warn('Location check failed:', error);
    return true; // Show dialog on error (fail-safe)
  }
}

// Only initialize if in GDPR region
checkIfGDPRRegion().then(isGDPRRegion => {
  if (isGDPRRegion) {
    CookieDialog.init({
      // Your configuration
    });
  }
});
```

## Performance Optimization

### Caching Location Results

Cache location results to avoid repeated API calls:

```javascript
async function getCachedLocation() {
  const cached = localStorage.getItem('user_country');
  const cacheTime = localStorage.getItem('country_cache_time');
  
  // Use cache if less than 24 hours old
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 24 * 60 * 60 * 1000) {
    return cached;
  }
  
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Cache the result
    localStorage.setItem('user_country', data.country_code);
    localStorage.setItem('country_cache_time', Date.now().toString());
    
    return data.country_code;
  } catch (error) {
    return cached || 'UNKNOWN'; // Return cached value or unknown
  }
}
```

### Timeout Configuration

Set a timeout for location requests:

```javascript
function fetchWithTimeout(url, timeout = 3000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Custom implementation with timeout
fetchWithTimeout('https://ipapi.co/json/', 2000)
  .then(response => response.json())
  .then(data => {
    if (['DE', 'FR', 'ES'].includes(data.country_code)) {
      CookieDialog.init();
    }
  })
  .catch(() => {
    // Show dialog on timeout/error
    CookieDialog.init();
  });
```

## Alternative Services

Popular IP geolocation services you can use:

- **ipapi.co** (default): Free tier available
- **ipinfo.io**: `https://ipinfo.io/json`  
- **ip-api.com**: `http://ip-api.com/json/`
- **freegeoip.app**: `https://freegeoip.app/json/`

Always check the service's privacy policy and terms of use before implementation.