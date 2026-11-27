'use client';

import Image from 'next/image';
import { useState } from 'react';
import { listingText, useGenerationStore, type GenerationResult } from '@/store/useGenerationStore';
import { PhotoButtons } from './PhotoButtons';
import { WithSticker } from '@/components/Sticker';

interface ResultStepProps {
  isGenerating: boolean;
  error: string;
  garmentUrl: string | null;
  result?: GenerationResult;
  onRetry: () => void;
  onNewPhoto: (file: File) => void;
  onBack: () => void;
}

export const ResultStep = ({ isGenerating, error, garmentUrl, result, onRetry, onNewPhoto, onBack }: ResultStepProps) => {
  const { updateResult } = useGenerationStore();
  const [feedback, setFeedback] = useState('');

  async function share() {
    if (!result) return;
    setFeedback('');
    const text = listingText(result);
    // Vinted takes only the image from the share sheet, so the text goes to the clipboard first.
    const copied = await navigator.clipboard.writeText(text).then(() => true, () => false);
    const blob = await (await fetch(result.imageUrl)).blob();
    const file = new File([blob], `suitme-${result.id.slice(0, 8)}.${blob.type === 'image/png' ? 'png' : 'jpg'}`, { type: blob.type || 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: result.listingTitle, text }); }
      catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setFeedback('Sharing failed. Use Save image instead.'); return; }
    } else {
      save(file);
    }
    setFeedback(copied ? 'Listing text copied: paste it in Vinted.' : 'Image ready. Copy the text below by hand.');
  }

  function save(file?: File) {
    if (!result) return;
    const link = document.createElement('a');
    link.href = file ? URL.createObjectURL(file) : result.imageUrl;
    link.download = file?.name ?? `suitme-${result.id.slice(0, 8)}.jpg`;
    link.click();
  }

  async function copy() {
    if (!result) return;
    const ok = await navigator.clipboard.writeText(listingText(result)).then(() => true, () => false);
    setFeedback(ok ? 'Listing text copied.' : 'Clipboard unavailable. Select the text and copy it.');
  }

  if (isGenerating || (!result && !error)) return (
    <section className="page-shell studio-finish" aria-live="polite">
      <h1 className="page-heading"><WithSticker name="bolt">Dressing your model</WithSticker></h1>
      {garmentUrl && <div className="result-preview"><Image src={garmentUrl} alt="Garment being tried on" fill sizes="90vw" unoptimized /></div>}
      <div role="status"><div className="processing-indicator" aria-hidden="true"><span /></div><p className="field-help">Gemini usually needs 10 to 30 seconds.</p></div>
    </section>
  );

  if (error || !result) return (
    <section className="page-shell studio-finish" aria-live="polite">
      <h1 className="page-heading">Try-on failed</h1>
      <p className="form-error" role="alert">{error}</p>
      <div className="finish-actions"><button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button><button type="button" className="btn btn-outline" onClick={onBack}>Change model or style</button></div>
    </section>
  );

  return (
    <section className="page-shell studio-finish" aria-live="polite">
      <h1 className="page-heading"><WithSticker name="tag">Ready for Vinted</WithSticker></h1>
      <div className="result-preview result-preview-tall"><Image src={result.imageUrl} alt={`${result.modelName} wearing the garment`} fill sizes="90vw" unoptimized /></div>
      <div className="finish-actions">
        <WithSticker name="ready"><button type="button" className="btn btn-primary" onClick={() => void share()}>Share to Vinted</button></WithSticker>
        <button type="button" className="btn btn-outline" onClick={() => void copy()}>Copy text</button>
        <button type="button" className="btn btn-outline" onClick={() => save()}>Save image</button>
      </div>
      {feedback && <p className="status-message" role="status">{feedback}</p>}
      <section className="listing-editor" aria-labelledby="listing-heading">
        <h2 id="listing-heading">Listing</h2>
        <label className="field">Title<input value={result.listingTitle} maxLength={120} onChange={(event) => updateResult(result.id, { listingTitle: event.target.value })} /></label>
        <label className="field">Description<textarea rows={4} maxLength={2000} value={result.listingDescription} onChange={(event) => updateResult(result.id, { listingDescription: event.target.value })} /></label>
        <label className="field">Tags<input value={result.listingTags} maxLength={300} onChange={(event) => updateResult(result.id, { listingTags: event.target.value })} /><span className="field-help">Check size, brand and condition before posting.</span></label>
      </section>
      <h2 className="section-heading">Next garment</h2>
      <PhotoButtons onPhoto={onNewPhoto} cameraLabel="Snap the next one" />
      <button type="button" className="text-link" onClick={onBack}>Change model or style</button>
    </section>
  );
};
