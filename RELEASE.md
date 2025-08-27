# Release Process

## Prerequisites

1. Make sure you have an NPM account and are logged in:
   ```bash
   npm login
   ```

2. Add your NPM token to GitHub repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Add `NPM_TOKEN` with your NPM token value

## Creating a Release

### Method 1: Using npm version command (Recommended)

```bash
# For patch release (1.0.0 → 1.0.1)
npm version patch

# For minor release (1.0.0 → 1.1.0)
npm version minor

# For major release (1.0.0 → 2.0.0)
npm version major
```

This will:
- Update the version in package.json
- Build the project
- Create a git commit and tag
- Push to GitHub
- Trigger the GitHub Action to publish to NPM

### Method 2: Manual release

1. Update version in `package.json`
2. Build the project: `npm run build`
3. Commit changes: `git add . && git commit -m "Release v1.x.x"`
4. Create tag: `git tag v1.x.x`
5. Push: `git push && git push --tags`

## What happens automatically

When you push a version tag (starting with `v`), GitHub Actions will:

1. ✅ **Build the library** with webpack
2. ✅ **Run tests** (if they exist)
3. ✅ **Publish to NPM** automatically
4. ✅ **Create GitHub release** with CDN links
5. ✅ **Upload release assets** (JS and CSS files)

## jsDelivr CDN Access

Once published to NPM, your package is automatically available on jsDelivr:

### Latest version:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.min.js"></script>
```

### Specific version:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.0/dist/cookiedialog.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.0/dist/cookiedialog.min.js"></script>
```

### ESM version:
```html
<script type="module">
  import CookieDialog from 'https://cdn.jsdelivr.net/npm/cookiedialog@latest/dist/cookiedialog.esm.js';
</script>
```

## First Release Setup

For your first release, run:

```bash
npm version 1.0.0
```

This will create the first stable release and make it available on:
- NPM: https://www.npmjs.com/package/cookiedialog
- jsDelivr: https://cdn.jsdelivr.net/npm/cookiedialog@latest/
- GitHub Releases: https://github.com/timothydodd/cookiedialog/releases

## Checking Release Status

- **NPM**: https://www.npmjs.com/package/cookiedialog
- **jsDelivr**: https://www.jsdelivr.com/package/npm/cookiedialog
- **GitHub Actions**: Check the "Actions" tab in your repository

## Troubleshooting

- If NPM publish fails, check your NPM token in repository secrets
- If jsDelivr doesn't update immediately, it may take up to 24 hours for new packages
- GitHub releases are created automatically on successful NPM publish