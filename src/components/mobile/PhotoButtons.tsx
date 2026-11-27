'use client';

import { useId, useState } from 'react';
import { validateImageFile } from '@/lib/images';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

interface PhotoButtonsProps { onPhoto: (file: File) => void; disabled?: boolean; cameraLabel?: string; }

// Camera first: on a phone the primary button opens the rear camera directly.
export function PhotoButtons({ onPhoto, disabled, cameraLabel = 'Take a photo' }: PhotoButtonsProps) {
  const id = useId();
  const [error, setError] = useState('');

  async function accept(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setError('');
    try { await validateImageFile(file); onPhoto(file); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'This image could not be opened. Choose another photo.'); }
  }

  return <>
    <div className="photo-source-actions">
      <input type="file" accept={ACCEPT} capture="environment" className="photo-input" id={`${id}-camera`} disabled={disabled} onChange={accept} />
      <label htmlFor={`${id}-camera`} className="btn btn-primary upload-button" aria-disabled={disabled}>{cameraLabel}</label>
      <input type="file" accept={ACCEPT} className="photo-input" id={`${id}-gallery`} disabled={disabled} onChange={accept} />
      <label htmlFor={`${id}-gallery`} className="btn btn-outline upload-button" aria-disabled={disabled}>From gallery</label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </>;
}
