# Contributing to Snail Tracker

Thank you for your interest in contributing to Snail Tracker! This guide will help you get started.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/snail-selfie.git
   cd snail-selfie
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start Development Server**
   ```bash
   vercel dev
   ```

5. **Open Frontend**
   ```bash
   cd public
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

## Code Style Guidelines

### JavaScript
- Use ES6+ features (async/await, arrow functions, etc.)
- Use 2 spaces for indentation
- Always use semicolons
- Use template literals for string interpolation
- Prefer `const` over `let`, avoid `var`

### Security Best Practices
- **Always** use `escapeHtml()` when inserting user content into HTML
- **Always** use parameterized queries for database operations
- **Never** expose API keys or secrets in client-side code
- Validate all user inputs on the backend
- Use whitelist validation for enum-like values

### API Endpoints
- Use RESTful conventions
- Return proper HTTP status codes
- Include error messages in JSON responses
- Wrap handlers with `withAuth()` middleware
- Use try/catch for async operations

### Frontend
- Keep JavaScript in separate files (no inline scripts)
- Use semantic HTML
- Keep CSS mobile-first
- Test on mobile devices
- Ensure accessibility (alt text, labels, etc.)

## Adding New Features

### Adding a New API Endpoint

1. Create file in appropriate `api/` subdirectory
2. Import `withAuth` and `sql`
3. Export handler wrapped with `withAuth()`
4. Add proper error handling
5. Document in README.md

Example:
```javascript
import { withAuth } from '../../lib/auth.js';
import { sql } from '../../lib/db.js';

async function handler(req, res) {
  try {
    // Your logic here
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}

export default withAuth(handler);
```

### Adding a New Frontend Page

1. Create HTML file in `public/`
2. Include stylesheet: `<link rel="stylesheet" href="css/styles.css">`
3. Include scripts:
   ```html
   <script src="config.js"></script>
   <script src="js/api.js"></script>
   <script src="js/your-page.js"></script>
   ```
4. Add authentication check:
   ```javascript
   if (!api.isAuthenticated()) {
     window.location.href = 'index.html';
   }
   ```
5. Sanitize all user content with `escapeHtml()`

### Adding Database Tables

1. Add CREATE TABLE statement to `schema.sql`
2. Include indexes for foreign keys and frequently queried columns
3. Use UUIDs for primary keys
4. Add appropriate CASCADE rules for foreign keys
5. Document in README.md

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- ✅ Login/logout functionality
- ✅ Create, read, update, delete operations
- ✅ Image upload
- ✅ Mobile responsiveness
- ✅ Error handling (try invalid inputs)
- ✅ Security (XSS attempts, SQL injection attempts)
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)

### Using the Test Page

1. Open `public/test.html`
2. Run all tests
3. Verify all tests pass
4. Test with different credentials

## Security Review

Before submitting:

1. Check for XSS vulnerabilities
   ```bash
   grep -r "innerHTML" public/js/
   # Verify all use escapeHtml()
   ```

2. Check for SQL injection vulnerabilities
   ```bash
   grep -r "sql.query\|sql\`" api/
   # Verify all use parameterized queries
   ```

3. Check for exposed secrets
   ```bash
   grep -r "sk-\|API_KEY\|password" --include="*.js" --include="*.html" .
   # Verify no hardcoded secrets
   ```

## Pull Request Process

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the guidelines above

3. Test thoroughly (use test.html)

4. Commit with clear messages
   ```bash
   git commit -m "Add: feature description"
   ```

5. Push and create PR
   ```bash
   git push origin feature/your-feature-name
   ```

6. Fill out PR template with:
   - Description of changes
   - Testing performed
   - Screenshots (if UI changes)
   - Security considerations

## Common Issues

### "Module not found" errors
- Verify import paths are correct
- Remember: Vercel uses ES modules (use `.js` extension)

### Database connection errors
- Check `POSTGRES_URL` in environment variables
- Verify database exists and schema is applied

### CORS errors
- Check `vercel.json` CORS configuration
- Verify API URL in frontend config

### Authentication failures
- Verify `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` are set
- Check credentials in sessionStorage

## Ideas for Contributions

- 🎨 Improve mobile UI/UX
- 🌍 Add internationalization (i18n)
- 📊 Add statistics/charts for sightings
- 🔍 Improve search with filters
- 📱 Add PWA support
- 🗺️ Add map view of sightings
- 📤 Add export/import functionality
- 🎭 Add more snail species presets
- 🔔 Add notifications for regular snails
- 🌙 Add dark mode

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

Thank you for contributing! 🐌
