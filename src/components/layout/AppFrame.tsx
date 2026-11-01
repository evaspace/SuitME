import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { AppNavigation } from './AppNavigation';
import { SwipeNavigation } from './SwipeNavigation';
import { Footer } from './Footer';

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" href="/studio" aria-label="SuitMe home">
            <Image className="app-brand-logo" src="/suitme_logo.svg" alt="SuitMe" width={160} height={142} priority unoptimized />
          </Link>
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
      <Link href="/studio">Studio</Link>
      <Link href="/models">Models</Link>
      <Link href="/results">Results</Link>
      <a href="/blog/">Blog</a>
    </nav>
  );
}
