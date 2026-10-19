export default function Loading() {
  return (
    <section className="page-shell" aria-busy="true" aria-live="polite">
      <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-stone-200" />
      <div className="h-5 w-72 max-w-full animate-pulse rounded bg-stone-200" />
      <p className="sr-only">Loading page…</p>
    </section>
  );
}
