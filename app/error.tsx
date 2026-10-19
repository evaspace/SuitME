'use client';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-shell">
      <div className="surface-card p-8 text-center sm:p-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
          Something went wrong
        </p>
        <h1 className="page-heading">This page could not be loaded</h1>
        <p className="page-intro mx-auto">
          Your work may still be available. Try loading the page again.
        </p>
        <button type="button" className="btn btn-primary mt-6 w-full sm:w-auto" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </section>
  );
}
