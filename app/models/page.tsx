'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createId, useModelStore } from '@/store/useModelStore';
import { isSupportedImage, readImageForLocalUse } from '@/lib/images';
import { useLocalDataReady } from '@/hooks/useLocalDataReady';
import { WithSticker } from '@/components/Sticker';

export default function ModelsPage() {
  const router = useRouter();
  useLocalDataReady();
  const { models, addModel } = useModelStore();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(formData: FormData) {
    console.info('[SuitMe models] create started');
    setError('');
    const photo = formData.get('photo');
    if (!(photo instanceof File) || photo.size === 0) return setError('Choose a photo of the model.');
    if (!isSupportedImage(photo)) return setError('Choose a JPG, PNG, or WEBP image smaller than 25 MB.');
    let imageUrl = '';
    try { imageUrl = await readImageForLocalUse(photo); }
    catch (cause) {
      console.error('[SuitMe models] reference image processing failed', cause);
      return setError(cause instanceof Error ? cause.message : 'This image could not be opened.');
    }
    const name = String(formData.get('name') ?? '').trim() || `Model ${models.length + 1}`;
    try {
      // Only the photo is required; profile details are optional and editable later.
      const id = addModel({
        name,
        gender: 'unisex',
        size: 'Not set',
        skinTone: 'Not set',
        defaultStyle: 'casual',
        poses: [{ id: createId(), category: 'front_standing', imageUrl, isDefault: true }],
      });
      console.info('[SuitMe models] profile saved locally', { id, hasReference: Boolean(imageUrl) });
      setIsAdding(false);
      router.push(`/models/${id}`);
    } catch (cause) {
      console.error('[SuitMe models] profile save or navigation failed', cause);
      setError('The model could not be saved. Check available browser storage and try again.');
    }
  }

  return (
    <section className="page-shell">
      <header className="page-title-row">
        <div>
          
          <h1 className="page-heading">Models</h1>
        </div>
        {models.length > 0 && <WithSticker name="phone"><button className="btn btn-primary" type="button" onClick={() => setIsAdding(true)}>Add a model</button></WithSticker>}
      </header>

      {models.length === 0 ? (
        <div className="empty-card empty-card-action-area" onClick={() => setIsAdding(true)}>
          <div className="empty-illustration" aria-hidden="true">＋</div>
          <h2>Your model library is empty</h2>
          <p>Add a profile and reference photos to start using your own models in the Studio.</p>
          <WithSticker name="phone"><button className="btn btn-primary" type="button" onClick={() => setIsAdding(true)}>Add your first model</button></WithSticker>
        </div>
      ) : (
        <div className="model-grid">
          {models.map((model) => {
            const cover = model.poses.find((pose) => pose.isDefault)?.imageUrl || model.poses[0]?.imageUrl;
            return (
              <article key={model.id} className="model-card">
                <Link className="model-card-link" href={`/models/${model.id}`} aria-label={`Manage ${model.name}`}>
                  <div className="model-card-image">{cover ? <Image src={cover} alt={`${model.name} reference`} fill sizes="(max-width: 700px) 90vw, 30vw" unoptimized /> : <span aria-hidden="true">Add a reference photo</span>}</div>
                  <div className="model-card-content">
                    <div className="model-name-row"><h2>{model.name}</h2><span className={model.active && model.poses.some((pose) => pose.isDefault) ? 'status-pill status-ready' : 'status-pill'}>{!model.active ? 'Inactive' : model.poses.some((pose) => pose.isDefault) ? 'Ready' : 'Needs photos'}</span></div>
                    <p>{model.gender} · Size {model.size} · {model.poses.length} {model.poses.length === 1 ? 'pose' : 'poses'}</p>
                    <span className="text-link">Manage model <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}

      {isAdding && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAdding(false); }}>
        <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="add-model-heading">
          <button className="dialog-close" type="button" aria-label="Close" onClick={() => setIsAdding(false)}>×</button>
          <h2 id="add-model-heading">Add a model</h2>
          <form action={handleAdd} className="form-grid">
            <label className="field field-wide">Model photo <span className="field-help">Drop or choose a front photo · JPG, PNG or WEBP, up to 25 MB</span><input type="file" name="photo" required autoFocus accept="image/jpeg,image/png,image/webp" /></label>
            <label className="field field-wide">Name <span className="field-help">Optional · size, profile and style can be set later in Edit profile</span><input name="name" maxLength={60} placeholder={`Model ${models.length + 1}`} /></label>
            {error && <p className="form-error field-wide" role="alert">{error}</p>}
            <div className="form-actions field-wide"><button type="button" className="btn btn-outline" onClick={() => { setError(''); setIsAdding(false); }}>Cancel</button><button className="btn btn-primary" type="submit">Create model</button></div>
          </form>
        </section>
      </div>}
    </section>
  );
}
