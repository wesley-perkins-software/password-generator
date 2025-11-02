# Password Generator

A minimal, single-page password generator that runs entirely in the browser. Passwords never leave the device and are generated using the Web Crypto API to avoid bias.

## Features
- Client-side password generation with `crypto.getRandomValues`.
- Character set toggles for lowercase, uppercase, numbers, and symbols.
- Accessible UI with keyboard focus states, aria-live announcements, and reduced-motion support.
- Reserved ad slots with placeholders for AdSense and a Google-certified CMP.
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

### Cloudflare Pages
1. Create a new project in Cloudflare Pages and connect it to your Git repository.
2. Choose the production branch and keep the build command empty (static site).
3. Deploy; Cloudflare automatically handles SSL and CDN caching.

## Search Console & Monitoring
- Verify ownership in Google Search Console using the HTML tag or DNS method. Add the generated verification file or meta tag before publishing.
- Submit the provided `sitemap.xml` once live to ensure timely indexing.
- Track Core Web Vitals using Search Console and PageSpeed Insights. Monitor ad integrations to ensure they do not introduce layout shifts or blocking scripts.

## Advertising Integration Notes
- The `ads.html` partial and `index.html` include commented placeholders for Google AdSense and a Google-certified CMP. Insert production scripts only after updating your Content Security Policy.
- Reserve the provided ad-slot sizes (leaderboard 728x90, medium rectangle 300x250) to minimize layout shifts.

## Security Headers
Apply a Content Security Policy tailored to your hosting platform. A restrictive baseline could look like:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<randomNonce>'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self';
```

When enabling AdSense or a CMP, extend the policy with the required domains. At minimum you will need to allow:
- `https://pagead2.googlesyndication.com`
- `https://googleads.g.doubleclick.net`
- `https://www.googletagservices.com`
- The CMP provider's script and resource domains.

Always generate nonces at runtime and inject them into script tags you control. Avoid using `unsafe-inline` or wildcard sources whenever possible.

## Privacy
The app performs no analytics, logging, or network calls related to the generated passwords. Clipboard access is only used when you click **Copy**.
