'use client';

import Link from 'next/link';
import { useState } from 'react';
import { validateImageFile } from '@/lib/images';
import { useGarmentStore } from '@/store/useGarmentStore';
import { useModelStore, type Model } from '@/store/useModelStore';
import { PhotoButtons } from './PhotoButtons';

interface UploadStepProps { readyModels: Model[]; model?: Model; error: string; onPhoto: (file: File) => void; }

export const UploadStep = ({ readyModels, model, error, onPhoto }: UploadStepProps) => {
  const { styleConfig, updateStyleConfig } = useGarmentStore();
  const { selectModel } = useModelStore();
  const [dropError, setDropError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // The whole stage takes the drop, so a file released next to the panel never makes the browser open it.
  const dropProps = {
    onDragOver: (event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setIsDragging(true); },
    onDragLeave: (event: React.DragEvent) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false); },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault(); setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (!file || !model) return;
      setDropError('');
      validateImageFile(file).then(() => onPhoto(file), (cause) => setDropError(cause instanceof Error ? cause.message : 'This image could not be opened.'));
    },
  };

  return (
    <div className="studio-stage" {...dropProps}>
      <section className="page-shell studio-page">
        <h1 className="page-heading">Snap a garment</h1>
        <p className="page-intro">The try-on and the listing text start as soon as the photo is taken.</p>
        {model ? <div className={isDragging ? 'upload-panel is-dragging' : 'upload-panel'}>
          <PhotoButtons onPhoto={onPhoto} />
          <p className="field-help">Or drop a photo here · JPG, PNG or WEBP, up to 25 MB</p>
          <div className="studio-settings">
            <label className="field">Model<select value={model.id} onChange={(event) => selectModel(event.target.value)}>{readyModels.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
            <label className="field">Style<select value={styleConfig.targetStyle} onChange={(event) => updateStyleConfig({ targetStyle: event.target.value as typeof styleConfig.targetStyle })}><option value="chic">Chic</option><option value="casual">Casual</option><option value="streetwear">Streetwear</option><option value="business">Business</option></select></label>
          </div>
          <p className="field-help">The garment and model photos are sent to Google Gemini.</p>
        </div> : <div className="empty-card compact"><h2>Add your model first</h2><p>One photo of the person who will wear the clothes is enough.</p><Link className="btn btn-primary" href="/models">Add a model</Link></div>}
        {(error || dropError) && <p className="form-error" role="alert">{error || dropError}</p>}
      </section>
    </div>
  );
};
