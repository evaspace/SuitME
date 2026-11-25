import Link from 'next/link';

export default function Page() {
  return (
    <section className="page-shell flex min-h-[calc(100vh-5rem)] flex-col justify-center gap-8">
      <div className="max-w-3xl">
        <h1 className="page-heading">SuitMe, your try-on studio</h1>
        <p className="page-intro">One clothing photo becomes worn previews on your model and a listing you can edit.</p>
      </div>
      <Link className="btn btn-primary self-start px-8" href="/studio">Open the studio</Link>
    </section>
  );
}
