# CookieDialog Project - Claude Code Assistant Guide

## Project Overview
CookieDialog is a lightweight GDPR cookie consent dialog library with geolocation support, designed to be easily integrated via CDN or NPM. The project is hosted at cookiedialog.com.

## Project Structure
```
cookiedialog/
├── src/                    # TypeScript source code
│   ├── index.ts           # Main CookieDialog class
│   ├── storage.ts         # LocalStorage consent management
│   ├── geolocation.ts     # IP-based location detection
│   ├── types.ts           # TypeScript type definitions
│   └── styles.css         # Dialog styles
├── dist/                   # Built library files (generated)
├── demo/                   # Demo HTML page
├── docs/                   # Astro documentation site
│   ├── src/content/docs/  # Documentation markdown files
│   └── astro.config.mjs   # Astro configuration
├── deploy-azure.sh        # Azure deployment script
├── Dockerfile             # Docker container configuration
└── nginx.conf            # Nginx server configuration
```

## Development Commands

### Building the Library
```bash
# Install dependencies
npm install

# Build for production (creates dist/ folder)
npm run build

# Development build with watch mode
npm run dev

# Run tests
npm test

# Lint TypeScript code
npm run lint
```

### Documentation Site
```bash
# Navigate to docs folder
cd docs

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing the Library Locally

1. **Build the library first:**
   ```bash
   npm run build
   ```

2. **Open the demo page:**
   ```bash
   # Open demo/index.html in a browser
   # Or use a local server:
   npx serve demo
   ```

3. **Test different configurations in the demo page:**
   - Position (bottom, top, center)
   - Theme (light, dark)
   - Geolocation detection
   - Consent persistence

## Deployment Options

### Azure Storage Account
```bash
# Make the script executable
chmod +x deploy-azure.sh

# Run deployment (requires Azure CLI)
./deploy-azure.sh
```

### Docker Container
```bash
# Build the Docker image
docker build -t cookiedialog .

# Run locally
docker run -p 80:80 cookiedialog

# Access at http://localhost
```

### NPM Publishing
```bash
# Build the library
npm run build

# Publish to NPM (requires npm login)
npm publish
```

## Key Features to Test

1. **Cookie Consent Dialog**
   - Appears automatically on first visit
   - Remembers user choice in localStorage
   - Respects consent expiry (default 365 days)

2. **Geolocation Detection**
   - When enabled, checks if user is in EU/EEA
   - Only shows dialog in GDPR regions
   - Falls back to showing dialog on error

3. **Cookie Categories**
   - Necessary (always required)
   - Analytics (optional)
   - Marketing (optional)
   - Custom categories supported

4. **Callbacks**
   - `onAccept`: Fired when user accepts cookies
   - `onReject`: Fired when user rejects cookies
   - `onChange`: Fired when settings are modified

## API Usage Examples

### Basic Initialization
```javascript
CookieDialog.init();
```

### Full Configuration
```javascript
const dialog = CookieDialog.init({
  enableLocation: true,
  position: 'bottom',
  theme: 'dark',
  privacyUrl: '/privacy',
  expiryDays: 365,
  categories: [
    { id: 'necessary', name: 'Essential', required: true },
    { id: 'analytics', name: 'Analytics', required: false }
  ],
  onAccept: (consent) => {
    if (consent.categories.analytics) {
      // Enable Google Analytics
    }
  }
});
```

### Programmatic Control
```javascript
dialog.show();                    // Show dialog
dialog.hide();                    // Hide dialog
dialog.getConsent();              // Get current consent
dialog.hasConsent();              // Check if consent exists
dialog.resetConsent();            // Clear stored consent
dialog.getCategoryConsent('analytics'); // Check specific category
```

## Common Issues and Solutions

### Dialog Not Appearing
- Check if consent already exists in localStorage
- Use `forceShow: true` to always display
- Clear localStorage: `localStorage.removeItem('cookiedialog_consent')`

### Geolocation Not Working
- Ensure `enableLocation: true` is set
- Check browser console for API errors
- Default fallback shows dialog if location fails

### Styles Not Loading
- Ensure CSS file is included before JS
- Check network tab for 404 errors
- Verify build process completed successfully

## Project Maintenance Tasks

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update to latest major versions (careful!)
npm install <package>@latest
```

### Adding New Features
1. Update TypeScript types in `src/types.ts`
2. Implement feature in appropriate source file
3. Update demo page to showcase feature
4. Add documentation in `docs/src/content/docs/`
5. Update README.md and this CLAUDE.md file

### Version Bumping
```bash
# Update version in package.json
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Code Quality Checks

Before committing changes, ensure:
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Demo page works correctly
- [ ] Documentation builds: `cd docs && npm run build`
- [ ] README is updated if needed
- [ ] Version number is updated if releasing

## Useful Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Webpack Configuration](https://webpack.js.org/configuration/)
- [Astro Documentation](https://astro.build/)
- [GDPR Cookie Requirements](https://gdpr.eu/cookies/)
- [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)

## Contact & Support
- GitHub Issues: [github.com/timothydodd/cookiedialog/issues](https://github.com/timothydodd/cookiedialog/issues)
- Documentation: [cookiedialog.com](https://cookiedialog.com)
- NPM Package: [npmjs.com/package/cookiedialog](https://www.npmjs.com/package/cookiedialog)