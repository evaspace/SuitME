import Link from 'next/link';

export default function Page() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#315d46]">
          Personal virtual try-on studio
        </p>
        <h1 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
          Dress Me
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[#737166]">
          A personal workspace for virtual try-on images and clothing listings.
        </p>
        <Link
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#315d46] px-7 font-semibold text-white transition hover:bg-[#244734] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#d98699]"
          href="/studio"
        >
          Open the studio
        </Link>
      </div>
    </section>
  );
}
