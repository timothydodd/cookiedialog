---
title: Custom Styling
description: Advanced customization techniques for styling CookieDialog
---

# Custom Styling

CookieDialog provides extensive styling customization options through CSS variables, custom classes, and complete theme overrides.

## CSS Variables

CookieDialog uses CSS custom properties for easy theming:

### Color Variables

```css
:root {
  /* Background colors */
  --cd-bg-primary: #ffffff;
  --cd-bg-secondary: #f8f9fa;
  --cd-bg-overlay: rgba(0, 0, 0, 0.5);
  
  /* Text colors */
  --cd-text-primary: #212529;
  --cd-text-secondary: #6c757d;
  --cd-text-muted: #adb5bd;
  
  /* Border and shadow */
  --cd-border-color: #dee2e6;
  --cd-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  /* Button colors */
  --cd-btn-primary-bg: #007bff;
  --cd-btn-primary-text: #ffffff;
  --cd-btn-primary-hover: #0056b3;
  
  --cd-btn-secondary-bg: #6c757d;
  --cd-btn-secondary-text: #ffffff;
  --cd-btn-secondary-hover: #545b62;
}
```

### Spacing and Layout

```css
:root {
  /* Spacing */
  --cd-spacing-xs: 4px;
  --cd-spacing-sm: 8px;
  --cd-spacing-md: 16px;
  --cd-spacing-lg: 24px;
  --cd-spacing-xl: 32px;
  
  /* Border radius */
  --cd-border-radius: 8px;
  --cd-border-radius-sm: 4px;
  --cd-border-radius-lg: 12px;
  
  /* Sizing */
  --cd-max-width: 500px;
  --cd-min-height: 200px;
  
  /* Typography */
  --cd-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --cd-font-size-sm: 0.875rem;
  --cd-font-size-md: 1rem;
  --cd-font-size-lg: 1.125rem;
  --cd-line-height: 1.5;
}
```

## Component Classes

Target specific parts of the dialog:

### Dialog Container

```css
/* Main dialog container */
.cookiedialog {
  /* Custom styles for the entire dialog */
  font-family: 'Inter', sans-serif;
  border: 2px solid var(--cd-border-color);
}

/* Position-specific styling */
.cookiedialog--bottom {
  border-radius: var(--cd-border-radius) var(--cd-border-radius) 0 0;
}

.cookiedialog--top {
  border-radius: 0 0 var(--cd-border-radius) var(--cd-border-radius);
}

.cookiedialog--center {
  border-radius: var(--cd-border-radius);
  max-width: 90vw;
  max-height: 90vh;
}
```

### Content Areas

```css
/* Header section */
.cookiedialog__header {
  padding: var(--cd-spacing-lg);
  border-bottom: 1px solid var(--cd-border-color);
}

/* Title */
.cookiedialog__title {
  font-size: var(--cd-font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--cd-spacing-sm) 0;
  color: var(--cd-text-primary);
}

/* Description */
.cookiedialog__description {
  font-size: var(--cd-font-size-md);
  color: var(--cd-text-secondary);
  margin: 0;
}

/* Body content */
.cookiedialog__body {
  padding: var(--cd-spacing-lg);
}

/* Footer with buttons */
.cookiedialog__footer {
  padding: var(--cd-spacing-lg);
  border-top: 1px solid var(--cd-border-color);
}
```

### Categories Section

```css
/* Categories container */
.cookiedialog__categories {
  margin: var(--cd-spacing-md) 0;
}

/* Individual category */
.cookiedialog__category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--cd-spacing-md);
  margin-bottom: var(--cd-spacing-sm);
  background: var(--cd-bg-secondary);
  border-radius: var(--cd-border-radius-sm);
  border: 1px solid var(--cd-border-color);
}

/* Category info */
.cookiedialog__category-info {
  flex: 1;
}

.cookiedialog__category-name {
  font-weight: 500;
  color: var(--cd-text-primary);
  margin-bottom: var(--cd-spacing-xs);
}

.cookiedialog__category-description {
  font-size: var(--cd-font-size-sm);
  color: var(--cd-text-muted);
}

/* Toggle switch */
.cookiedialog__toggle {
  margin-left: var(--cd-spacing-md);
}
```

### Buttons

```css
/* Button container */
.cookiedialog__buttons {
  display: flex;
  gap: var(--cd-spacing-md);
  margin-top: var(--cd-spacing-lg);
}

/* Base button styles */
.cookiedialog__button {
  flex: 1;
  padding: var(--cd-spacing-md) var(--cd-spacing-lg);
  border: none;
  border-radius: var(--cd-border-radius-sm);
  font-size: var(--cd-font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Primary button */
.cookiedialog__button--primary {
  background: var(--cd-btn-primary-bg);
  color: var(--cd-btn-primary-text);
}

.cookiedialog__button--primary:hover {
  background: var(--cd-btn-primary-hover);
  transform: translateY(-1px);
}

/* Secondary button */
.cookiedialog__button--secondary {
  background: var(--cd-btn-secondary-bg);
  color: var(--cd-btn-secondary-text);
}

.cookiedialog__button--secondary:hover {
  background: var(--cd-btn-secondary-hover);
}

/* Outline button */
.cookiedialog__button--outline {
  background: transparent;
  color: var(--cd-btn-primary-bg);
  border: 2px solid var(--cd-btn-primary-bg);
}

.cookiedialog__button--outline:hover {
  background: var(--cd-btn-primary-bg);
  color: var(--cd-btn-primary-text);
}
```

## Custom Themes

### Dark Theme Override

```css
/* Dark theme */
[data-theme="dark"] .cookiedialog,
.cookiedialog--dark {
  --cd-bg-primary: #1a202c;
  --cd-bg-secondary: #2d3748;
  --cd-bg-overlay: rgba(0, 0, 0, 0.8);
  
  --cd-text-primary: #f7fafc;
  --cd-text-secondary: #e2e8f0;
  --cd-text-muted: #a0aec0;
  
  --cd-border-color: #4a5568;
  --cd-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  --cd-btn-primary-bg: #3182ce;
  --cd-btn-primary-hover: #2c5282;
}
```

### Material Design Theme

```css
.cookiedialog--material {
  --cd-border-radius: 4px;
  --cd-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  
  font-family: 'Roboto', sans-serif;
  box-shadow: var(--cd-shadow);
  border: none;
}

.cookiedialog--material .cookiedialog__button {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-radius: 4px;
}

.cookiedialog--material .cookiedialog__button--primary {
  background: #1976d2;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.cookiedialog--material .cookiedialog__button--primary:hover {
  background: #1565c0;
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
}
```

### iOS Style Theme

```css
.cookiedialog--ios {
  --cd-border-radius: 16px;
  --cd-spacing-md: 20px;
  --cd-font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cookiedialog--ios .cookiedialog__button {
  border-radius: 12px;
  font-weight: 600;
  min-height: 44px;
}

.cookiedialog--ios .cookiedialog__button--primary {
  background: #007aff;
  color: white;
}

.cookiedialog--ios .cookiedialog__category {
  background: rgba(120, 120, 128, 0.12);
  border: none;
  border-radius: 12px;
}
```

## Responsive Design

```css
/* Mobile-first responsive design */
.cookiedialog {
  width: 100%;
  max-width: var(--cd-max-width);
  margin: 0;
}

/* Mobile styles */
@media (max-width: 767px) {
  .cookiedialog {
    border-radius: 0;
    max-width: 100%;
  }
  
  .cookiedialog--bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .cookiedialog--center {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .cookiedialog__buttons {
    flex-direction: column;
  }
  
  .cookiedialog__category {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .cookiedialog__toggle {
    margin-left: 0;
    margin-top: var(--cd-spacing-sm);
    align-self: flex-end;
  }
}

/* Tablet styles */
@media (min-width: 768px) and (max-width: 1023px) {
  .cookiedialog {
    max-width: 80vw;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .cookiedialog {
    max-width: var(--cd-max-width);
  }
  
  .cookiedialog--bottom {
    margin: 0 auto var(--cd-spacing-lg) auto;
  }
  
  .cookiedialog--top {
    margin: var(--cd-spacing-lg) auto 0 auto;
  }
}
```

## Animations

### Slide Animations

```css
/* Slide up from bottom */
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

/* Slide down from top */
.cookiedialog--top {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale in for center */
.cookiedialog--center {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
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

### Button Hover Effects

```css
/* Ripple effect */
.cookiedialog__button {
  position: relative;
  overflow: hidden;
}

.cookiedialog__button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cookiedialog__button:active::before {
  width: 300px;
  height: 300px;
}
```

## Complete Custom Theme Example

```css
/* Glassmorphism theme */
.cookiedialog--glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333;
}

.cookiedialog--glass .cookiedialog__category {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.cookiedialog--glass .cookiedialog__button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #333;
  backdrop-filter: blur(10px);
}

.cookiedialog--glass .cookiedialog__button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.cookiedialog--glass .cookiedialog__button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}
```

## CSS-in-JS Integration

For modern frameworks, you can define styles programmatically:

```javascript
const customStyles = {
  '.cookiedialog': {
    fontFamily: 'Inter, sans-serif',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: 'none',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },
  
  '.cookiedialog__button--primary': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  }
};

// Apply styles (implementation depends on your CSS-in-JS solution)
```

## Best Practices

1. **Use CSS Variables**: They make theming much easier
2. **Mobile-first**: Design for mobile, then enhance for larger screens
3. **Test Accessibility**: Ensure sufficient color contrast
4. **Performance**: Minimize CSS bundle size
5. **Browser Support**: Test across different browsers