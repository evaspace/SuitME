import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-shell">
      <div className="surface-card p-8 text-center sm:p-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
          404 · Not found
        </p>
        <h1 className="page-heading">We could not find that page</h1>
        <p className="page-intro mx-auto">
          The address may be incorrect, or the page may no longer be available.
        </p>
        <Link className="btn btn-primary mt-6 w-full sm:w-auto" href="/studio">
          Go to the Studio
        </Link>
      </div>
    </section>
  );
}
