import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { AppNavigation } from './AppNavigation';
import { SwipeNavigation } from './SwipeNavigation';

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" href="/studio" aria-label="Dress Me home">
            <Image className="app-brand-logo" src="/dress_me_logo.png" alt="Dress Me" width={160} height={142} priority />
          </Link>
          <Suspense fallback={<AppNavigationFallback />}>
            <AppNavigation />
          </Suspense>
        </div>
      </header>
      <Suspense fallback={<main id="main-content" className="app-main">{children}</main>}>
        <SwipeNavigation>{children}</SwipeNavigation>
      </Suspense>
    </div>
  );
}

function AppNavigationFallback() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <Link href="/studio">Studio</Link>
      <Link href="/models">Models</Link>
      <Link href="/results">Results</Link>
    </nav>
  );
}
