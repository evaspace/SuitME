import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { AppNavigation } from './AppNavigation';
import { destinations } from './destinations';
import { SwipeNavigation } from './SwipeNavigation';
import { Footer } from './Footer';

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" href="/studio">SuitMe</Link>
          <Suspense fallback={<AppNavigationFallback />}>
            <AppNavigation />
          </Suspense>
        </div>
      </header>
      <Suspense fallback={<main id="main-content" className="app-main">{children}</main>}>
        <SwipeNavigation>{children}</SwipeNavigation>
      </Suspense>
      <Footer />
    </div>
  );
}

function AppNavigationFallback() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {destinations.map((d) => <Link key={d.href} href={d.href}>{d.label}</Link>)}
      <a href="/blog/">Blog</a>
    </nav>
  );
}
