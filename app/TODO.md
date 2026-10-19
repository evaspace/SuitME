# Shared App Frame - Decisions and Checklist

## Implemented

- [x] `/` redirects to `/studio`.
- [x] Persistent destinations are Studio, Models, and Results; model detail is reached from the library.
- [x] The Dress Me logo links to Studio; navigation highlights the current route, including nested model detail.
- [x] A skip link, landmarks, English labels, focus-visible treatment, reduced-motion support, loading, error recovery, and not-found states are present.
- [x] Header and route content adapt to narrow screens; Studio actions account for the bottom safe area.
- [x] Buttons have one outcome and visible labels; destructive model deletion is confirmed.

## Remaining before cloud release

- [ ] Verify keyboard, screen reader, text zoom, safe-area, and touch behavior in target browsers.
- [ ] Add authentication and a private hosting configuration before making personal model photos reachable online.
