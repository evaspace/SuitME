'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useLocalDataReady } from '@/hooks/useLocalDataReady';

type SortMode = 'newest' | 'oldest' | 'model' | 'style';

function listingText(result: { listingTitle: string; listingDescription: string; listingTags: string }) {
  return [result.listingTitle, result.listingDescription, result.listingTags].filter(Boolean).join('\n\n');
}

export default function ResultsPage() {
  const { results, updateResult } = useGenerationStore();
  useLocalDataReady();
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => `${result.modelName} ${result.style} ${result.poseLabel} ${result.listingTitle}`.toLowerCase().includes(query.toLowerCase()));
    return filtered.sort((a, b) => {
      if (sortMode === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortMode === 'model') return a.modelName.localeCompare(b.modelName) || b.createdAt.localeCompare(a.createdAt);
      if (sortMode === 'style') return a.style.localeCompare(b.style) || b.createdAt.localeCompare(a.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [results, sortMode, query]);
  const selected = visibleResults.find((result) => result.id === selectedId) ?? visibleResults[0];

  async function copyListing() {
    if (!selected) return;
    setFeedback(''); setCopyFailed(false);
    try { await navigator.clipboard.writeText(listingText(selected)); setFeedback('Listing copied.'); }
    catch { setFeedback('Clipboard access is unavailable. Select the listing text below and copy it manually.'); setCopyFailed(true); }
  }

  function downloadSelected() {
    if (!selected) return;
    const link = document.createElement('a');
    link.href = selected.imageUrl;
    const mime = selected.imageUrl.match(/^data:(image\/[^;,]+)/)?.[1];
    const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    link.download = `${selected.modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${selected.poseLabel.replaceAll(' ', '-')}.${extension}`;
    link.click(); setFeedback('Image download started.');
  }

  if (results.length === 0) return <section className="page-shell"><header className="mb-8"><p className="eyebrow">Studio</p><h1 className="page-heading">Results</h1></header><div className="empty-card"><div className="empty-illustration" aria-hidden="true">✳</div><h2>No results yet</h2><p>Your completed looks will appear here.</p><Link className="btn btn-primary" href="/studio">Start with a garment photo</Link></div></section>;

  return <section className="page-shell">
    <header className="page-title-row"><div><p className="eyebrow">Studio</p><h1 className="page-heading">Results</h1><p className="page-intro">{results.length} saved {results.length === 1 ? 'look' : 'looks'}</p></div><Link className="btn btn-outline" href="/studio">New garment</Link></header>
    <div className="results-toolbar"><label className="field search-field">Find a look<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model, style or pose" /></label><label className="field sort-field">Sort by<select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="model">Model name</option><option value="style">Style</option></select></label></div>
    {visibleResults.length === 0 ? <div className="empty-card compact"><h2>No matching looks</h2><p>Try another search or clear the search field.</p><button className="btn btn-outline" type="button" onClick={() => setQuery('')}>Clear search</button></div> : <div className="results-layout">
      <div className="result-list" aria-label="Saved results">{visibleResults.map((result) => <button key={result.id} type="button" className={`result-list-card ${selected?.id === result.id ? 'is-selected' : ''}`} aria-pressed={selected?.id === result.id} onClick={() => { setSelectedId(result.id); setFeedback(''); setCopyFailed(false); setPreviewFailed(false); }}><span className="result-thumb"><Image src={result.imageUrl} alt="" fill sizes="96px" unoptimized /></span><span className="result-list-copy"><strong>{result.modelName}</strong><span>{result.poseLabel} · {result.style}</span><time dateTime={result.createdAt}>{new Date(result.createdAt).toLocaleDateString()}</time></span><span className="selection-mark" aria-hidden="true">{selected?.id === result.id ? '✓' : ''}</span></button>)}</div>
      {selected && <article className="result-detail">
        <div className="result-preview">{selected.imageUrl && !previewFailed ? <Image src={selected.imageUrl} alt={`${selected.modelName} wearing the garment, ${selected.poseLabel} pose`} fill sizes="(max-width: 800px) 90vw, 45vw" unoptimized onError={() => setPreviewFailed(true)} /> : <div className="image-unavailable" role="status"><p>Preview unavailable</p><p>This saved image cannot be opened. You can still edit or copy the listing.</p></div>}</div>
        <div className="result-meta"><span className="status-pill status-ready">{selected.provider === 'gemini' ? 'Gemini generated' : 'Earlier preview'}</span><span>{selected.modelName} · {selected.poseLabel} · {selected.style}</span></div>
        <section className="listing-editor" aria-labelledby="listing-heading"><p className="eyebrow">Editable draft</p><h2 id="listing-heading">Listing details</h2><label className="field">Title<input value={selected.listingTitle} maxLength={120} onChange={(event) => updateResult(selected.id, { listingTitle: event.target.value })} /></label><label className="field">Description<textarea rows={4} maxLength={2000} value={selected.listingDescription} onChange={(event) => updateResult(selected.id, { listingDescription: event.target.value })} /></label><label className="field">Tags<input value={selected.listingTags} maxLength={300} onChange={(event) => updateResult(selected.id, { listingTags: event.target.value })} /><span className="field-help">Review each detail for accuracy before publishing.</span></label></section>
        <div className="result-actions"><button type="button" className="btn btn-primary" onClick={downloadSelected} disabled={previewFailed || !selected.imageUrl}>Download image</button><button type="button" className="btn btn-outline" onClick={copyListing}>Copy listing</button></div>
        {feedback && <p className="status-message" role="status">{feedback}</p>}{copyFailed && <textarea className="copy-fallback" aria-label="Listing text to copy manually" readOnly value={listingText(selected)} onFocus={(event) => event.currentTarget.select()} />}
      </article>}
    </div>}
  </section>;
}
