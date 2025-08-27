---
title: Themes & Styling
description: Learn how to customize the appearance of CookieDialog with built-in themes and custom styles
---

# Themes & Styling

CookieDialog comes with built-in themes and supports extensive customization through CSS.

## Built-in Themes

### Light Theme (default)

```javascript
CookieDialog.init({
  theme: 'light'
});
```

- Clean, bright appearance
- Dark text on light background
- Subtle shadows and borders

### Dark Theme

```javascript
CookieDialog.init({
  theme: 'dark'
});
```

- Modern dark appearance
- Light text on dark background  
- Glowing accents and highlights

## Theme Customization with CSS Variables

CookieDialog uses CSS custom properties that you can override:

```css
:root {
  /* Light theme colors */
  --cd-bg-primary: #ffffff;
  --cd-bg-secondary: #f8f9fa;
  --cd-text-primary: #212529;
  --cd-text-secondary: #6c757d;
  --cd-border: #dee2e6;
  --cd-shadow: rgba(0, 0, 0, 0.1);
  
  /* Button colors */
  --cd-btn-primary-bg: #007bff;
  --cd-btn-primary-text: #ffffff;
  --cd-btn-secondary-bg: #6c757d;
  --cd-btn-secondary-text: #ffffff;
  
  /* Spacing and sizing */
  --cd-border-radius: 8px;
  --cd-spacing: 16px;
  --cd-max-width: 500px;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --cd-bg-primary: #2d3748;
  --cd-bg-secondary: #4a5568;
  --cd-text-primary: #f7fafc;
  --cd-text-secondary: #e2e8f0;
  --cd-border: #4a5568;
  --cd-shadow: rgba(0, 0, 0, 0.3);
}
```

## Custom Theme Example

Create your own theme by overriding CSS variables:

```css
/* Custom brand theme */
.cookiedialog {
  --cd-bg-primary: #1a365d;
  --cd-bg-secondary: #2c5282;
  --cd-text-primary: #ffffff;
  --cd-text-secondary: #bee3f8;
  --cd-border: #3182ce;
  
  --cd-btn-primary-bg: #38b2ac;
  --cd-btn-primary-text: #ffffff;
  --cd-btn-secondary-bg: transparent;
  --cd-btn-secondary-text: #38b2ac;
  
  --cd-border-radius: 12px;
  --cd-max-width: 600px;
}

/* Custom button styling */
.cookiedialog .cd-button-secondary {
  border: 2px solid var(--cd-btn-secondary-text);
}
```

## Position-Specific Styling

Customize appearance based on dialog position:

```css
/* Bottom positioning */
.cookiedialog--bottom {
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px var(--cd-shadow);
}

/* Top positioning */  
.cookiedialog--top {
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 20px var(--cd-shadow);
}

/* Center positioning */
.cookiedialog--center {
  border-radius: 16px;
  box-shadow: 0 10px 40px var(--cd-shadow);
  backdrop-filter: blur(10px);
}
```

## Component-Specific Styling

Target specific parts of the dialog:

```css
/* Dialog title */
.cookiedialog .cd-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

/* Description text */
.cookiedialog .cd-description {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Category list */
.cookiedialog .cd-categories {
  gap: 12px;
  margin: 16px 0;
}

/* Individual category */
.cookiedialog .cd-category {
  padding: 12px;
  border: 1px solid var(--cd-border);
  border-radius: 8px;
  background: var(--cd-bg-secondary);
}

/* Buttons container */
.cookiedialog .cd-buttons {
  gap: 12px;
  margin-top: 20px;
}

/* Individual buttons */
.cookiedialog .cd-button {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cookiedialog .cd-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## Mobile-Responsive Styling

Customize for different screen sizes:

```css
/* Mobile-first approach */
.cookiedialog {
  max-width: 100%;
  margin: 0;
  border-radius: 0;
}

/* Tablet and up */
@media (min-width: 768px) {
  .cookiedialog {
    max-width: var(--cd-max-width);
    margin: 0 auto;
    border-radius: var(--cd-border-radius);
  }
  
  .cookiedialog--bottom {
    margin-bottom: 20px;
  }
  
  .cookiedialog--top {
    margin-top: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .cookiedialog {
    max-width: 500px;
  }
}
```

## Animation Customization

Add custom animations:

```css
/* Slide up animation for bottom position */
.cookiedialog--bottom {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Fade in for center position */
.cookiedialog--center {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## Advanced Customization

For complex themes, you can completely override the default styles:

```css
/* Reset default styles */
.cookiedialog {
  all: unset;
  display: block;
  
  /* Your custom base styles */
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

/* Glass morphism effect */
.cookiedialog::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: inherit;
  backdrop-filter: blur(10px);
}
```

## Theme Switching

Allow users to switch themes dynamically:

```javascript
// Theme switcher function
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('preferred-theme', theme);
}

// Initialize with saved theme
const savedTheme = localStorage.getItem('preferred-theme') || 'light';
setTheme(savedTheme);

CookieDialog.init({
  theme: savedTheme
});
```

## Best Practices

1. **Test both themes:** Ensure your customizations work with both light and dark themes
2. **Mobile-first:** Design for mobile devices first, then enhance for larger screens
3. **Accessibility:** Maintain sufficient color contrast (4.5:1 minimum)
4. **Performance:** Use CSS transforms for animations rather than changing layout properties
5. **Consistency:** Match your site's existing design patterns and brand colors