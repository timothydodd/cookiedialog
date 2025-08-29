---
title: Testing
description: How to test applications that use CookieDialog
---

# Testing

Testing applications that integrate CookieDialog requires mocking the dialog behavior and verifying consent-based functionality.

## Jest Testing Setup

### Basic Mock Setup

```javascript
// __mocks__/cookiedialog.js
const mockDialog = {
  show: jest.fn(),
  hide: jest.fn(),
  getConsent: jest.fn(),
  hasConsent: jest.fn(),
  getCategoryConsent: jest.fn(),
  resetConsent: jest.fn(),
  destroy: jest.fn(),
  isVisible: jest.fn()
};

const CookieDialog = {
  init: jest.fn(() => mockDialog),
  version: '1.0.3',
  isInitialized: jest.fn()
};

module.exports = CookieDialog;
module.exports.default = CookieDialog;
module.exports.mockDialog = mockDialog;
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^cookiedialog$': '<rootDir>/__mocks__/cookiedialog.js'
  }
};
```

```javascript
// src/setupTests.js
import 'jest-dom/extend-expect';

// Global CookieDialog mock
global.CookieDialog = require('../__mocks__/cookiedialog');
```

## React Testing

### Testing Hook Integration

```javascript
// __tests__/useCookieConsent.test.js
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { mockDialog } from '../__mocks__/cookiedialog';

describe('useCookieConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes CookieDialog with correct config', () => {
    const config = {
      position: 'bottom',
      theme: 'dark',
      categories: [
        { id: 'necessary', name: 'Essential', required: true }
      ]
    };

    renderHook(() => useCookieConsent(config));

    expect(global.CookieDialog.init).toHaveBeenCalledWith(
      expect.objectContaining(config)
    );
  });

  test('returns consent data when available', () => {
    const mockConsent = {
      timestamp: Date.now(),
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      categories: { necessary: true, analytics: false },
      version: '1.0.3'
    };

    mockDialog.getConsent.mockReturnValue(mockConsent);

    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      // Simulate checking existing consent after initialization
      global.CookieDialog.init().hasConsent.mockReturnValue(true);
      global.CookieDialog.init().getConsent.mockReturnValue(mockConsent);
    });

    expect(result.current.consent).toEqual(mockConsent);
    expect(result.current.hasConsent).toBe(true);
  });

  test('shows settings when showSettings is called', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.showSettings();
    });

    expect(mockDialog.show).toHaveBeenCalled();
  });

  test('checks category consent correctly', () => {
    mockDialog.getCategoryConsent.mockImplementation(
      (category) => category === 'analytics'
    );

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.getCategoryConsent('analytics')).toBe(true);
    expect(result.current.getCategoryConsent('marketing')).toBe(false);
  });
});
```

### Component Testing

```javascript
// __tests__/App.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { mockDialog } from '../__mocks__/cookiedialog';

describe('App', () => {
  test('initializes CookieDialog on mount', () => {
    render(<App />);
    expect(global.CookieDialog.init).toHaveBeenCalled();
  });

  test('shows cookie settings when button clicked', () => {
    render(<App />);
    
    const settingsButton = screen.getByText('Cookie Settings');
    fireEvent.click(settingsButton);

    expect(mockDialog.show).toHaveBeenCalled();
  });

  test('conditionally renders analytics component', () => {
    mockDialog.getCategoryConsent.mockImplementation(
      (category) => category === 'analytics'
    );

    render(<App />);

    // Simulate consent change
    act(() => {
      const initCall = global.CookieDialog.init.mock.calls[0][0];
      initCall.onAccept({
        categories: { analytics: true }
      });
    });

    expect(screen.getByTestId('analytics-component')).toBeInTheDocument();
  });
});
```

## Cypress E2E Testing

### Basic Setup

```javascript
// cypress/support/commands.js
Cypress.Commands.add('mockCookieDialog', (responses = {}) => {
  cy.window().then((win) => {
    win.CookieDialog = {
      init: cy.stub().returns({
        show: cy.stub(),
        hide: cy.stub(),
        getConsent: cy.stub().returns(responses.consent || null),
        hasConsent: cy.stub().returns(responses.hasConsent || false),
        getCategoryConsent: cy.stub().callsFake(
          (category) => responses.categoryConsent?.[category] || false
        ),
        resetConsent: cy.stub(),
        destroy: cy.stub()
      }),
      version: '1.0.3',
      isInitialized: cy.stub().returns(false)
    };
  });
});

Cypress.Commands.add('acceptCookies', (categories = {}) => {
  cy.window().then((win) => {
    const consent = {
      timestamp: Date.now(),
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      categories: { necessary: true, ...categories },
      version: '1.0.3'
    };

    // Simulate consent acceptance
    if (win.cookieConsentCallback) {
      win.cookieConsentCallback(consent);
    }
  });
});
```

### Test Examples

```javascript
// cypress/e2e/cookie-consent.cy.js
describe('Cookie Consent', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows cookie dialog on first visit', () => {
    // Without mocking - test actual dialog
    cy.get('.cookiedialog').should('be.visible');
    cy.get('.cookiedialog__title').should('contain', 'Cookie Preferences');
  });

  it('remembers consent choice', () => {
    // Accept cookies
    cy.get('[data-testid="accept-all"]').click();
    
    // Reload page
    cy.reload();
    
    // Dialog should not appear
    cy.get('.cookiedialog').should('not.exist');
  });

  it('shows analytics component when analytics enabled', () => {
    cy.mockCookieDialog({
      consent: {
        categories: { necessary: true, analytics: true }
      },
      hasConsent: true,
      categoryConsent: { analytics: true }
    });

    cy.visit('/');
    cy.get('[data-testid="analytics-component"]').should('be.visible');
  });

  it('allows changing settings', () => {
    // Accept cookies first
    cy.get('[data-testid="accept-all"]').click();
    
    // Open settings
    cy.get('[data-testid="cookie-settings"]').click();
    
    // Dialog should be visible again
    cy.get('.cookiedialog').should('be.visible');
    
    // Toggle analytics off
    cy.get('[data-testid="analytics-toggle"]').click();
    cy.get('[data-testid="save-settings"]').click();
    
    // Analytics component should be hidden
    cy.get('[data-testid="analytics-component"]').should('not.exist');
  });
});
```

## Testing Strategies

### Mock Consent Scenarios

```javascript
// test-utils/consent-scenarios.js
export const consentScenarios = {
  noConsent: {
    hasConsent: false,
    consent: null
  },
  
  allAccepted: {
    hasConsent: true,
    consent: {
      timestamp: Date.now(),
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      categories: {
        necessary: true,
        analytics: true,
        marketing: true
      },
      version: '1.0.3'
    }
  },
  
  onlyNecessary: {
    hasConsent: true,
    consent: {
      timestamp: Date.now(),
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      categories: {
        necessary: true,
        analytics: false,
        marketing: false
      },
      version: '1.0.3'
    }
  },
  
  analyticsOnly: {
    hasConsent: true,
    consent: {
      timestamp: Date.now(),
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      categories: {
        necessary: true,
        analytics: true,
        marketing: false
      },
      version: '1.0.3'
    }
  }
};

// Usage in tests
import { consentScenarios } from '../test-utils/consent-scenarios';

test('shows correct components based on consent', () => {
  mockDialog.getConsent.mockReturnValue(consentScenarios.analyticsOnly.consent);
  mockDialog.hasConsent.mockReturnValue(true);
  mockDialog.getCategoryConsent.mockImplementation(
    (category) => consentScenarios.analyticsOnly.consent.categories[category]
  );

  render(<App />);
  
  expect(screen.getByTestId('analytics-component')).toBeInTheDocument();
  expect(screen.queryByTestId('marketing-component')).not.toBeInTheDocument();
});
```

### Service Testing

```javascript
// __tests__/services/analytics.test.js
import { enableAnalytics, disableAnalytics } from '../services/analytics';

// Mock gtag
global.gtag = jest.fn();

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enables analytics when called', () => {
    enableAnalytics();
    
    expect(gtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID');
  });

  test('tracks consent events', () => {
    enableAnalytics();
    
    // Simulate consent acceptance
    global.gtag('event', 'cookie_consent', {
      event_category: 'privacy',
      event_label: 'accepted'
    });

    expect(gtag).toHaveBeenCalledWith('event', 'cookie_consent', {
      event_category: 'privacy',
      event_label: 'accepted'
    });
  });

  test('disables analytics properly', () => {
    disableAnalytics();
    
    // Verify cleanup
    expect(gtag).toHaveBeenCalledWith('remove');
  });
});
```

## Testing Best Practices

### Test Isolation

```javascript
// Ensure tests don't interfere with each other
beforeEach(() => {
  // Clear localStorage
  localStorage.clear();
  
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
});
```

### Async Testing

```javascript
test('handles async service initialization', async () => {
  const mockService = {
    init: jest.fn().mockResolvedValue('initialized')
  };

  mockDialog.getConsent.mockReturnValue({
    categories: { analytics: true }
  });

  const { result, waitFor } = renderHook(() => useCookieConsent());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(mockService.init).toHaveBeenCalled();
});
```

### Integration Testing

```javascript
// Test actual localStorage interaction
test('persists consent to localStorage', () => {
  const consent = {
    timestamp: Date.now(),
    categories: { necessary: true, analytics: true }
  };

  // Don't mock localStorage for this test
  const originalGetItem = localStorage.getItem;
  const originalSetItem = localStorage.setItem;

  render(<App />);

  // Simulate consent acceptance
  act(() => {
    const initCall = global.CookieDialog.init.mock.calls[0][0];
    initCall.onAccept(consent);
  });

  // Check localStorage
  const stored = JSON.parse(localStorage.getItem('cookiedialog_consent'));
  expect(stored.categories).toEqual(consent.categories);

  // Cleanup
  localStorage.getItem = originalGetItem;
  localStorage.setItem = originalSetItem;
});
```

## Debugging Tests

### Debug Utilities

```javascript
// test-utils/debug.js
export const debugConsent = (hookResult) => {
  console.log('Consent State:', {
    consent: hookResult.current.consent,
    hasConsent: hookResult.current.hasConsent,
    isLoading: hookResult.current.isLoading
  });
};

export const debugMockCalls = () => {
  console.log('CookieDialog.init calls:', global.CookieDialog.init.mock.calls);
  console.log('Dialog method calls:', {
    show: mockDialog.show.mock.calls,
    getConsent: mockDialog.getConsent.mock.calls,
    getCategoryConsent: mockDialog.getCategoryConsent.mock.calls
  });
};
```

### Test Coverage

```javascript
// Ensure critical consent paths are tested
describe('Consent Coverage', () => {
  const scenarios = [
    'no consent',
    'all accepted',
    'only necessary',
    'analytics only',
    'marketing only',
    'expired consent'
  ];

  scenarios.forEach(scenario => {
    test(`handles ${scenario} correctly`, () => {
      // Test implementation for each scenario
    });
  });
});
```

## Automated Testing

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

This comprehensive testing approach ensures your CookieDialog integration works correctly across different consent scenarios and user interactions.