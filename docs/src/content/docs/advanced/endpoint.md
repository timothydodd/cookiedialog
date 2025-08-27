---
title: Custom Endpoint
description: How to implement and use custom geolocation endpoints with CookieDialog
---

# Custom Endpoint

CookieDialog allows you to specify a custom geolocation endpoint for IP-based location detection instead of the default `ipapi.co` service.

## Basic Custom Endpoint

```javascript
CookieDialog.init({
  enableLocation: true,
  locationEndpoint: 'https://api.mysite.com/geolocation'
});
```

## Required Response Format

Your custom endpoint must return JSON with one of these country code fields:

### Option 1: `country_code` (recommended)
```json
{
  "country_code": "DE"
}
```

### Option 2: `country`
```json
{
  "country": "FR"
}
```

### Option 3: `countryCode`
```json
{
  "countryCode": "ES"
}
```

## Implementation Examples

### Node.js/Express Endpoint

```javascript
const express = require('express');
const geoip = require('geoip-lite');
const app = express();

app.get('/geolocation', (req, res) => {
  // Get client IP
  const clientIP = req.headers['x-forwarded-for'] 
    || req.connection.remoteAddress 
    || req.socket.remoteAddress
    || (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Look up location
  const geo = geoip.lookup(clientIP);
  
  if (geo && geo.country) {
    res.json({ country_code: geo.country });
  } else {
    // Fallback - assume GDPR region
    res.json({ country_code: 'UNKNOWN' });
  }
});

app.listen(3000);
```

### PHP Endpoint

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function getClientIP() {
    $ipkeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($ipkeys as $key) {
        if (array_key_exists($key, $_SERVER) && !empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (strpos($ip, ',') !== false) {
                $ip = explode(',', $ip)[0];
            }
            if (filter_var(trim($ip), FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return trim($ip);
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

function getCountryFromIP($ip) {
    // Use ipapi.co as fallback
    $response = file_get_contents("https://ipapi.co/{$ip}/json/");
    $data = json_decode($response, true);
    
    return $data['country_code'] ?? 'UNKNOWN';
}

$clientIP = getClientIP();
$country = getCountryFromIP($clientIP);

echo json_encode(['country_code' => $country]);
?>
```

### Python/Flask Endpoint

```python
from flask import Flask, request, jsonify
import geoip2.database
import geoip2.errors

app = Flask(__name__)

# Download GeoLite2 database from MaxMind
reader = geoip2.database.Reader('GeoLite2-Country.mmdb')

@app.route('/geolocation')
def geolocation():
    # Get client IP
    if request.headers.getlist("X-Forwarded-For"):
        client_ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        client_ip = request.remote_addr
    
    try:
        response = reader.country(client_ip)
        country_code = response.country.iso_code
        return jsonify({'country_code': country_code})
    except geoip2.errors.AddressNotFoundError:
        return jsonify({'country_code': 'UNKNOWN'})

if __name__ == '__main__':
    app.run()
```

### Cloudflare Workers Endpoint

```javascript
export default {
  async fetch(request, env, ctx) {
    // Cloudflare provides country in headers
    const country = request.headers.get('CF-IPCountry');
    
    const response = {
      country_code: country || 'UNKNOWN'
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
};
```

## Advanced Response Format

Your endpoint can return additional data:

```json
{
  "country_code": "DE",
  "country_name": "Germany",
  "is_gdpr_region": true,
  "continent": "EU",
  "city": "Berlin",
  "timezone": "Europe/Berlin"
}
```

CookieDialog will only use the country code, but you can access the full response in callbacks:

```javascript
CookieDialog.init({
  enableLocation: true,
  locationEndpoint: 'https://api.mysite.com/geolocation',
  onLocationSuccess: (locationData) => {
    console.log('Full location data:', locationData);
    if (locationData.city) {
      console.log('User is in:', locationData.city);
    }
  }
});
```

## Error Handling

Your endpoint should handle errors gracefully:

```javascript
// Node.js example with error handling
app.get('/geolocation', async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    
    if (!isValidIP(clientIP)) {
      return res.json({ 
        country_code: 'UNKNOWN',
        error: 'Invalid IP address'
      });
    }

    const geo = await lookupLocation(clientIP);
    
    res.json({
      country_code: geo.country || 'UNKNOWN',
      success: true
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    
    // Return UNKNOWN to trigger dialog display (fail-safe)
    res.json({
      country_code: 'UNKNOWN',
      error: 'Location lookup failed',
      success: false
    });
  }
});
```

## Caching Strategies

### Server-side Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

app.get('/geolocation', (req, res) => {
  const clientIP = getClientIP(req);
  const cacheKey = `geo_${clientIP}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Lookup and cache result
  const geo = geoip.lookup(clientIP);
  const result = { country_code: geo?.country || 'UNKNOWN' };
  
  cache.set(cacheKey, result);
  res.json(result);
});
```

### CDN/Edge Caching

```javascript
// Add cache headers
app.get('/geolocation', (req, res) => {
  const geo = performLookup(req);
  
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'X-Forwarded-For'
  });
  
  res.json({ country_code: geo.country });
});
```

## Security Considerations

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/geolocation', limiter);
```

### Input Validation

```javascript
function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

app.get('/geolocation', (req, res) => {
  const clientIP = getClientIP(req);
  
  if (!isValidIP(clientIP)) {
    return res.status(400).json({
      error: 'Invalid IP address',
      country_code: 'UNKNOWN'
    });
  }
  
  // Continue with lookup...
});
```

## Testing Your Endpoint

### Test with Different IPs

```bash
# Test with German IP
curl "https://api.yoursite.com/geolocation" \
  -H "X-Forwarded-For: 93.184.216.34"

# Test with US IP  
curl "https://api.yoursite.com/geolocation" \
  -H "X-Forwarded-For: 8.8.8.8"
```

### Automated Testing

```javascript
// Test script
const axios = require('axios');

const testIPs = {
  'German IP': '93.184.216.34',
  'US IP': '8.8.8.8',
  'UK IP': '81.2.69.142'
};

async function testEndpoint() {
  for (const [name, ip] of Object.entries(testIPs)) {
    try {
      const response = await axios.get('https://api.yoursite.com/geolocation', {
        headers: { 'X-Forwarded-For': ip }
      });
      
      console.log(`${name}: ${response.data.country_code}`);
    } catch (error) {
      console.error(`${name}: Error - ${error.message}`);
    }
  }
}

testEndpoint();
```

## Fallback Chains

Implement multiple fallback services:

```javascript
const endpoints = [
  'https://api.mysite.com/geolocation',
  'https://backup.mysite.com/geo',
  'https://ipapi.co/json/'
];

async function getLocationWithFallback() {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.country_code || data.country) {
        return data;
      }
    } catch (error) {
      console.warn(`Endpoint ${endpoint} failed:`, error);
    }
  }
  
  // All endpoints failed
  return { country_code: 'UNKNOWN' };
}

// Use with CookieDialog
CookieDialog.init({
  enableLocation: true,
  customLocationFunction: getLocationWithFallback
});
```

## Performance Optimization

### Lazy Loading

Only load geolocation when needed:

```javascript
let locationPromise = null;

function getLocation() {
  if (!locationPromise) {
    locationPromise = fetch('https://api.mysite.com/geolocation')
      .then(response => response.json());
  }
  return locationPromise;
}
```

### Preloading

Preload location data:

```html
<link rel="preload" href="https://api.mysite.com/geolocation" as="fetch" crossorigin>
```

## Compliance Considerations

### GDPR Compliance

Your endpoint should:
- Not store IP addresses longer than necessary
- Include appropriate privacy notices
- Handle data subject requests

### Example Privacy-First Implementation

```javascript
app.get('/geolocation', (req, res) => {
  const clientIP = getClientIP(req);
  
  // Perform lookup without storing IP
  const geo = geoip.lookup(clientIP);
  
  // Log anonymized request (optional)
  console.log(`Location request from ${anonymizeIP(clientIP)}: ${geo?.country}`);
  
  res.json({ 
    country_code: geo?.country || 'UNKNOWN',
    privacy_notice: 'IP address used only for location determination and not stored'
  });
});

function anonymizeIP(ip) {
  // Anonymize last octet for IPv4
  return ip.replace(/\.\d+$/, '.xxx');
}
```