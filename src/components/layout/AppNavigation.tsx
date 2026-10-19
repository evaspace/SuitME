'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const destinations = [
  { href: '/studio', label: 'Studio' },
  { href: '/models', label: 'Models' },
  { href: '/results', label: 'Results' },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      {destinations.map((destination) => {
        const isCurrent = destination.href === '/models'
          ? pathname === '/models' || pathname.startsWith('/models/')
          : pathname === destination.href || pathname.startsWith(`${destination.href}/`);

        return (
          <Link
            key={destination.href}
            href={destination.href}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {destination.label}
          </Link>
        );
      })}
    </nav>
  );
}
