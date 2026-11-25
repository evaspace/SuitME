import Script from 'next/script';

// Same structure as the pierref.eu footer: links, rating widget, outlined wordmark, copyright.
export function Footer() {
  return (
    <footer className="app-footer">
      <nav className="app-footer-nav" aria-label="Footer">
        <a href="/studio">Studio</a>
        <a href="/models">Models</a>
        <a href="/results">Results</a>
        <a href="/blog/">Blog</a>
        <a href="https://pierref.eu" target="_blank" rel="noopener">pierref.eu</a>
        <a href="https://github.com/evaspace" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/in/morgan-pierrefeu/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:morgan@pierref.eu">Contact</a>
      </nav>
      <div className="pierref-review-widget app-footer-review" data-site="suitme" />
      <Script src="https://pierref.eu/static/js/pierref-review.js" data-site="suitme" strategy="lazyOnload" />
      <div className="app-footer-wordmark" aria-hidden="true">SuitMe</div>
      <p className="app-footer-legal">&copy; 2026 Morgan Pierrefeu &mdash; SuitMe, a personal try-on studio</p>
    </footer>
  );
}
