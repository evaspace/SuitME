'use client';

import Image from 'next/image';
import { useState } from 'react';
import { validateImageFile } from '@/lib/images';
import { useGarmentStore } from '@/store/useGarmentStore';
import { StudioProgress } from './StudioProgress';

interface UploadStepProps { onNext: () => void; }

export const UploadStep = ({ onNext }: UploadStepProps) => {
  const { previewUrl, setGarmentFile, clearGarmentSession } = useGarmentStore();
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setError(''); setIsChecking(true);
    try { await validateImageFile(file); setGarmentFile(file); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'This image could not be opened. Choose another photo.'); }
    finally { setIsChecking(false); }
  };

  return (
    <div className="studio-stage">
      <section className="page-shell studio-page">
        <p className="eyebrow">Step 1 of 3 · Garment</p>
        <h1 className="page-heading">Start with one clothing photo</h1>
        <p className="page-intro">Choose a clear photo of the item. A plain background helps; you can use a camera or an existing image.</p>
        <div className="upload-panel" onClick={(event) => {
          const target = event.target;
          if (target instanceof Element && target.closest('button, label, input, a')) return;
          document.getElementById('garment-gallery-input')?.click();
        }}>
          {previewUrl ? <div className="upload-preview"><Image src={previewUrl} alt="Selected clothing photo preview" fill sizes="(max-width: 700px) 90vw, 60vw" unoptimized /></div> : <div className="upload-placeholder" aria-hidden="true"><span>＋</span><p>Your clothing photo will appear here</p></div>}
          <div className="photo-source-actions">
            <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="photo-input" id="garment-camera-input" onChange={handleFileChange} />
            <label htmlFor="garment-camera-input" className="btn btn-primary upload-button">Take a photo</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="photo-input" id="garment-gallery-input" onChange={handleFileChange} />
            <label htmlFor="garment-gallery-input" className="btn btn-outline upload-button">Choose from gallery</label>
          </div>
          <p className="field-help">JPG, PNG or WEBP · Up to 25 MB</p>
          {isChecking && <p className="status-message" role="status">Checking the photo…</p>}
          {previewUrl && <button type="button" className="text-link remove-photo" onClick={() => { clearGarmentSession(); setError(''); }}>Remove photo</button>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
        <StudioProgress current={1} />
      </section>
      <div className="action-bar" onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.querySelector('button')?.click();
      }}><button type="button" disabled={!previewUrl || isChecking} onClick={onNext} className="btn btn-primary">Choose a model</button></div>
    </div>
  );
};
