'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { isSupportedImage, readImageForLocalUse } from '@/lib/images';
import { useLocalDataReady } from '@/hooks/useLocalDataReady';
import { createId, POSE_CATEGORIES, useModelStore, type ModelStyle, type Pose, type PoseCategory } from '@/store/useModelStore';

const poseLabel = (category: PoseCategory) => category.replaceAll('_', ' ');

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useLocalDataReady();
  const { models, updateModel, deleteModel, updatePoses, selectModel } = useModelStore();
  const model = models.find((entry) => entry.id === id);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [addingPose, setAddingPose] = useState(false);

  if (!model) return <section className="page-shell"><Link className="text-link" href="/models">← Back to models</Link><div className="empty-card"><h1>Model not found</h1><p>This profile may have been removed from this browser.</p><Link className="btn btn-primary" href="/models">Open model library</Link></div></section>;
  const currentModel = model;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    if (!name) return setError('A model name is required.');
    updateModel(id, { name, gender: String(data.get('gender')) as 'female' | 'male' | 'unisex', size: String(data.get('size')).trim() || 'Not set', skinTone: String(data.get('skinTone')).trim() || 'Not set', defaultStyle: String(data.get('defaultStyle')) as ModelStyle, active: data.get('active') === 'on' });
    setEditing(false); setNotice('Profile saved.');
  }

  async function addPose(event: FormEvent<HTMLFormElement>) {
    console.info('[DressMe models] add reference started', { modelId: id });
    event.preventDefault(); setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('photo');
    if (!(file instanceof File) || file.size === 0) return setError('Choose a reference photo first.');
    if (!isSupportedImage(file)) return setError('Choose a JPG, PNG, or WEBP image smaller than 25 MB.');
    try {
      const imageUrl = await readImageForLocalUse(file);
      console.debug('[DressMe images] reference resized', { name: file.name, bytes: file.size, outputLength: imageUrl.length });
      const category = String(data.get('category')) as PoseCategory;
      const duplicate = currentModel.poses.some((pose) => pose.category === category);
      const previousPose = currentModel.poses.find((pose) => pose.category === category);
      const pose: Pose = { id: previousPose?.id ?? createId(), category, imageUrl, isDefault: previousPose?.isDefault ?? currentModel.poses.length === 0 };
      updatePoses(id, [...currentModel.poses.filter((entry) => entry.category !== category), pose]);
      setAddingPose(false); setNotice(duplicate ? `Replaced the ${poseLabel(category)} reference.` : 'Reference pose added.');
    } catch (cause) {
      console.error('[DressMe models] reference save failed', cause);
      setError(cause instanceof Error ? cause.message : 'This image could not be opened.');
    }
  }

  async function replacePose(poseId: string, file?: File) {
    if (!file) return;
    setError('');
    if (!isSupportedImage(file)) return setError('Choose a JPG, PNG, or WEBP image smaller than 25 MB.');
    try {
      const imageUrl = await readImageForLocalUse(file);
      updatePoses(id, currentModel.poses.map((pose) => pose.id === poseId ? { ...pose, imageUrl } : pose));
      setNotice('Reference photo replaced.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'This image could not be opened.'); }
  }

  function setDefault(poseId: string) {
    updatePoses(id, currentModel.poses.map((pose) => ({ ...pose, isDefault: pose.id === poseId })));
    setNotice('Default pose updated.');
  }

  function removePose(pose: Pose) {
    if (pose.isDefault && currentModel.poses.length > 1) return setError('Choose another default pose before removing this one.');
    if (!window.confirm(`Remove the ${poseLabel(pose.category)} reference photo?`)) return;
    const remaining = currentModel.poses.filter((entry) => entry.id !== pose.id);
    updatePoses(id, remaining.length && !remaining.some((entry) => entry.isDefault) ? remaining.map((entry, index) => ({ ...entry, isDefault: index === 0 })) : remaining);
    setNotice('Reference photo removed.');
  }

  function removeModel() {
    if (!window.confirm(`Delete ${currentModel.name} and all its reference photos from this browser?`)) return;
    deleteModel(id); router.replace('/models');
  }

  return (
    <section className="page-shell">
      <Link className="text-link back-link" href="/models">← Model library</Link>
      <header className="detail-heading">
        <div><p className="eyebrow">Model profile</p><h1 className="page-heading">{currentModel.name}</h1><p className="page-intro">{currentModel.gender} · Size {currentModel.size} · {currentModel.poses.length} reference {currentModel.poses.length === 1 ? 'pose' : 'poses'}</p></div>
        <div className="detail-actions"><button type="button" className="btn btn-outline" onClick={() => { selectModel(id); router.push('/studio'); }}>Use in Studio</button><button type="button" className="btn btn-outline" onClick={() => { setError(''); setEditing((value) => !value); }}>{editing ? 'Cancel edit' : 'Edit profile'}</button></div>
      </header>
      {notice && <p className="status-message" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}

      {editing && <form className="surface-card profile-form" onSubmit={saveProfile}>
        <h2>Edit profile</h2><div className="form-grid">
          <label className="field field-wide">Name<input name="name" defaultValue={currentModel.name} required maxLength={60} /></label>
          <label className="field">Profile<select name="gender" defaultValue={currentModel.gender}><option value="unisex">Unisex</option><option value="female">Female</option><option value="male">Male</option></select></label>
          <label className="field">Clothing size<input name="size" defaultValue={currentModel.size} maxLength={20} /></label>
          <label className="field">Skin tone<input name="skinTone" defaultValue={currentModel.skinTone} maxLength={30} /></label>
          <label className="field">Default style<select name="defaultStyle" defaultValue={currentModel.defaultStyle}><option value="casual">Casual</option><option value="chic">Chic</option><option value="streetwear">Streetwear</option><option value="business">Business</option></select></label>
          <label className="field active-toggle"><input type="checkbox" name="active" defaultChecked={currentModel.active} /> Available in Studio</label>
          <div className="form-actions field-wide"><button className="btn btn-primary" type="submit">Save profile</button></div>
        </div>
      </form>}

      <div className="section-title-row"><div><p className="eyebrow">Reference library</p><h2>Poses</h2><p className="field-help">One photo per angle. A new photo in an existing angle replaces its current reference.</p></div><button className="btn btn-primary" type="button" onClick={() => { setError(''); setAddingPose((value) => !value); }}>{addingPose ? 'Close' : 'Add a pose'}</button></div>
      {addingPose && <form className="surface-card pose-add-form" onSubmit={addPose}><label className="field">Pose angle<select name="category" defaultValue={POSE_CATEGORIES.find((category) => !currentModel.poses.some((pose) => pose.category === category)) ?? POSE_CATEGORIES[0]}>{POSE_CATEGORIES.map((category) => <option key={category} value={category}>{poseLabel(category)}{currentModel.poses.some((pose) => pose.category === category) ? ' (replace)' : ''}</option>)}</select></label><label className="field">Reference photo<input type="file" name="photo" required accept="image/jpeg,image/png,image/webp" /><span className="field-help">JPG, PNG or WEBP · Up to 25 MB</span></label><button className="btn btn-primary" type="submit">Save reference pose</button></form>}
      {currentModel.poses.length === 0 ? <div className="empty-card compact"><h3>No reference photos yet</h3><p>Add a front, profile, three-quarter, sitting, or back view to make this model ready for try-on.</p><button className="btn btn-primary" type="button" onClick={() => setAddingPose(true)}>Add the first pose</button></div> : <div className="pose-grid">{currentModel.poses.map((pose) => <article key={pose.id} className="pose-card"><div className="pose-image">{pose.imageUrl ? <Image src={pose.imageUrl} alt={`${currentModel.name}, ${poseLabel(pose.category)} pose`} fill sizes="(max-width: 700px) 80vw, 25vw" unoptimized /> : <span>Photo unavailable</span>}</div><div className="pose-info"><div><h3>{poseLabel(pose.category)}</h3><span className={pose.isDefault ? 'status-pill status-ready' : 'status-pill'}>{pose.isDefault ? 'Default pose' : 'Reference pose'}</span></div><details className="pose-menu"><summary aria-label={`Manage ${poseLabel(pose.category)} pose`}>Manage</summary><div className="pose-menu-panel"><label className="pose-menu-item">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void replacePose(pose.id, event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>{!pose.isDefault && <button type="button" className="pose-menu-item" onClick={() => setDefault(pose.id)}>Set as default</button>}<button type="button" className="pose-menu-item destructive" onClick={() => removePose(pose)}>Remove pose</button></div></details></div></article>)}</div>}

      <details className="danger-zone"><summary>Delete this model</summary><p>This removes the profile and reference photos saved in this browser. Existing exported files are not affected.</p><button type="button" className="btn btn-danger" onClick={removeModel}>Delete model</button></details>
    </section>
  );
}
