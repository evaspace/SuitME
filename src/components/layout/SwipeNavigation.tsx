'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

const destinations = ['/studio', '/models', '/results'];

export function SwipeNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    function onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      const target = event.target;
      if (!touch || !(target instanceof Element)) return;
      if (target.closest('a, button, input, select, textarea, [role="dialog"], [data-no-swipe], .model-choice, .pose-grid, .result-list, .upload-panel')) {
        start.current = null;
        return;
      }
      start.current = { x: touch.clientX, y: touch.clientY };
    }

    function onTouchEnd(event: TouchEvent) {
      const origin = start.current;
      const touch = event.changedTouches[0];
      start.current = null;
      if (!origin || !touch) return;
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.35) return;

      const currentIndex = pathname.startsWith('/models/') ? 1 : destinations.indexOf(pathname);
      if (currentIndex < 0) return;
      const nextIndex = Math.max(0, Math.min(destinations.length - 1, currentIndex + (dx < 0 ? 1 : -1)));
      if (nextIndex !== currentIndex) router.push(destinations[nextIndex]);
    }

    main.addEventListener('touchstart', onTouchStart, { passive: true });
    main.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      main.removeEventListener('touchstart', onTouchStart);
      main.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname, router]);

  return <main ref={mainRef} id="main-content" className="app-main">{children}</main>;
}
