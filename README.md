# Password Generator

A minimal, single-page password generator that runs entirely in the browser. Passwords never leave the device and are generated using the Web Crypto API to avoid bias.

## Features
- Client-side password generation with `crypto.getRandomValues`.
- Character set toggles for lowercase, uppercase, numbers, and symbols.
- Accessible UI with keyboard focus states, aria-live announcements, and reduced-motion support.
- SEO basics: semantic HTML, canonical URL, Open Graph tags, sitemap, and robots directives.

## Getting Started Locally
1. Clone this repository.
2. Serve the site with any static file server. For example:
   ```bash
   npx http-server .
   ```
3. Visit the printed local URL (usually <http://127.0.0.1:8080>) to use the generator.

## Deploying

### GitHub Pages
1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages and select the branch that contains `index.html`.
3. GitHub will serve the site at `https://<username>.github.io/<repository>/`.

## Search Console & Monitoring
- Verify ownership in Google Search Console using the HTML tag or DNS method. Add the generated verification file or meta tag before publishing.
- Submit the provided `sitemap.xml` once live to ensure timely indexing.
- Track Core Web Vitals using Search Console and PageSpeed Insights to keep the experience smooth.

## Security Headers
Apply a Content Security Policy tailored to your hosting platform. A restrictive baseline could look like:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<randomNonce>'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self';
```

Always generate nonces at runtime and inject them into script tags you control. Avoid using `unsafe-inline` or wildcard sources whenever possible.

## Privacy
The app performs no analytics, logging, or network calls related to the generated passwords. Clipboard access is only used when you click **Copy**.
