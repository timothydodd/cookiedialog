---
title: Cookie Categories
description: Learn how to configure cookie categories for granular consent management
---

# Cookie Categories

CookieDialog supports organizing cookies into categories, allowing users to make granular choices about what types of cookies they want to allow.

## Default Categories

If no categories are specified, CookieDialog uses these defaults:

```javascript
[
  { id: 'necessary', name: 'Necessary', required: true },
  { id: 'analytics', name: 'Analytics', required: false },
  { id: 'marketing', name: 'Marketing', required: false }
]
```

## Category Properties

Each category object supports these properties:

### `id` (required)
- **Type:** `string`
- **Description:** Unique identifier for the category
- Used in code to check consent status

### `name` (required)
- **Type:** `string`
- **Description:** Display name shown to users

### `required` (required)
- **Type:** `boolean`
- **Description:** Whether this category is mandatory
- Required categories cannot be disabled by users

### `description`
- **Type:** `string`
- **Description:** Detailed explanation of what the category includes

## Basic Example

```javascript
CookieDialog.init({
  categories: [
    {
      id: 'necessary',
      name: 'Essential Cookies',
      required: true,
      description: 'Required for the website to function properly'
    },
    {
      id: 'performance',
      name: 'Performance Cookies',
      required: false,
      description: 'Help us understand how visitors use our website'
    },
    {
      id: 'targeting',
      name: 'Targeting Cookies',
      required: false,
      description: 'Used to deliver relevant advertisements'
    }
  ]
});
```

## Checking Category Consent

After initialization, you can check if users have consented to specific categories:

```javascript
const dialog = CookieDialog.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false },
    { id: 'marketing', name: 'Marketing', required: false }
  ]
});

// Check specific category
if (dialog.getCategoryConsent('analytics')) {
  // Enable Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
}

if (dialog.getCategoryConsent('marketing')) {
  // Enable Facebook Pixel
  fbq('init', 'PIXEL_ID');
}
```

## Practical Examples

### E-commerce Site

```javascript
CookieDialog.init({
  categories: [
    {
      id: 'necessary',
      name: 'Essential',
      required: true,
      description: 'Required for shopping cart, checkout, and security features'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      required: false,
      description: 'Google Analytics to understand visitor behavior'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      required: false,
      description: 'Facebook Pixel and Google Ads for personalized advertising'
    },
    {
      id: 'personalization',
      name: 'Personalization',
      required: false,
      description: 'Remember your preferences and provide personalized content'
    }
  ],
  
  onAccept: (consent) => {
    if (consent.categories.analytics) {
      // Initialize analytics
    }
    if (consent.categories.marketing) {
      // Initialize marketing tools
    }
    if (consent.categories.personalization) {
      // Enable personalization features
    }
  }
});
```

### Content Site

```javascript
CookieDialog.init({
  categories: [
    {
      id: 'necessary',
      name: 'Necessary',
      required: true,
      description: 'Essential for website functionality and security'
    },
    {
      id: 'performance',
      name: 'Performance',
      required: false,
      description: 'Measure website performance and loading times'
    },
    {
      id: 'social',
      name: 'Social Media',
      required: false,
      description: 'Enable social media sharing and embedded content'
    }
  ]
});
```

### Minimal Setup

For simple sites, you might only need basic categories:

```javascript
CookieDialog.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'optional', name: 'Optional', required: false }
  ]
});
```

## Dynamic Category Management

You can check and update category consent programmatically:

```javascript
const dialog = CookieDialog.init({
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ]
});

// Get all consent data
const consent = dialog.getConsent();
console.log(consent.categories);
// Output: { necessary: true, analytics: false }

// Check specific category
if (dialog.getCategoryConsent('analytics')) {
  // Analytics is enabled
}

// Force show settings to let user change preferences
dialog.show();
```

## Best Practices

1. **Keep it simple:** Don't overwhelm users with too many categories
2. **Clear descriptions:** Explain what each category actually does
3. **Logical grouping:** Group related cookies together
4. **Required categories:** Only mark truly essential cookies as required
5. **Consistent naming:** Use clear, user-friendly category names

## Common Category Types

Here are some commonly used cookie categories:

- **Necessary/Essential:** Login, shopping cart, security
- **Analytics/Performance:** Google Analytics, site performance monitoring
- **Marketing/Advertising:** Ad targeting, conversion tracking
- **Social Media:** Social sharing, embedded content
- **Personalization:** User preferences, customized content
- **Functional:** Live chat, forms, interactive features