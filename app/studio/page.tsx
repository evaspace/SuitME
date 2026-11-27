'use client';

import { useState } from 'react';
import { UploadStep } from '@/components/mobile/UploadStep';
import { ResultStep } from '@/components/mobile/ResultStep';
import { useGarmentStore } from '@/store/useGarmentStore';
import { useLocalDataReady } from '@/hooks/useLocalDataReady';
import { readImageForLocalUse } from '@/lib/images';
import { useGenerationStore } from '@/store/useGenerationStore';
import { createId, useModelStore } from '@/store/useModelStore';
import { useAccount } from '@/hooks/useAccount';
import Link from 'next/link';
import { WithSticker } from '@/components/Sticker';

// One tap flow: a garment photo starts the try-on at once with the remembered model and style.
export default function Studio() {
  const garmentStore = useGarmentStore();
  const generationStore = useGenerationStore();
  const { models, selectedModelId } = useModelStore();
  const [showResult, setShowResult] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState('');
  useLocalDataReady();
  const account = useAccount();

  const readyModels = models.filter((model) => model.active && model.poses.some((pose) => pose.isDefault));
  const model = readyModels.find((entry) => entry.id === selectedModelId) ?? readyModels[0];

  async function generate(garmentFile: File | null = garmentStore.rawFile) {
    const pose = model?.poses.find((entry) => entry.isDefault);
    if (!model || !pose || !garmentFile) {
      setGenerationError('Add a model with a photo first, then take the garment photo.');
      return;
    }
    setGenerationError(''); setResultId(null); setShowResult(true);
    generationStore.setIsGenerating(true);
    console.info('[SuitMe Studio] generation request prepared', { modelId: model.id, pose: pose.category });
    try {
      const garmentDataUrl = await readImageForLocalUse(garmentFile);
      const style = garmentStore.styleConfig.targetStyle;
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garment: { dataUrl: garmentDataUrl }, modelReference: { dataUrl: pose.imageUrl }, style }),
      });
      const payload = await response.json() as {
        imageDataUrl?: string;
        error?: string;
        requestId?: string;
        listing?: { listingTitle?: string; listingDescription?: string; listingTags?: string };
      };
      if (!response.ok || !payload.imageDataUrl) throw new Error(payload.error || `Generation failed (${response.status}).`);

      const imageBlob = await (await fetch(payload.imageDataUrl)).blob();
      const compressedImage = await readImageForLocalUse(new File([imageBlob], 'try-on.png', { type: imageBlob.type || 'image/png' }));
      const id = createId();
      generationStore.addResult({
        id,
        provider: 'gemini',
        imageUrl: compressedImage,
        poseId: pose.id,
        poseLabel: pose.category.replaceAll('_', ' '),
        modelName: model.name,
        style,
        createdAt: new Date().toISOString(),
        listingTitle: payload.listing?.listingTitle ?? '',
        listingDescription: payload.listing?.listingDescription ?? '',
        listingTags: payload.listing?.listingTags ?? '',
      });
      setResultId(id);
      console.info('[SuitMe Studio] generated result saved locally', { requestId: payload.requestId });
    } catch (cause) {
      console.error('[SuitMe Studio] generation failed', cause);
      setGenerationError(cause instanceof Error ? cause.message : 'Something went wrong while generating your try-on.');
    } finally {
      generationStore.setIsGenerating(false);
    }
  }

  function startFromFile(file: File) {
    garmentStore.setGarmentFile(file);
    void generate(file);
  }

  if (account === null) return (
    <section className="page-shell studio-page">
      <h1 className="page-heading">Snap a garment</h1>
      <div className="empty-card compact"><h2>Log in to start</h2><p>Try-ons need a free account.</p><WithSticker name="sweater"><Link className="btn btn-primary" href="/account?next=/studio">Log in or create an account</Link></WithSticker></div>
    </section>
  );

  return (
    <div className="studio-stage">
      {showResult
        ? <ResultStep
            isGenerating={generationStore.isGenerating}
            error={generationError}
            garmentUrl={garmentStore.previewUrl}
            result={generationStore.results.find((entry) => entry.id === resultId)}
            onRetry={() => void generate()}
            onNewPhoto={startFromFile}
            onBack={() => { setShowResult(false); setGenerationError(''); }}
          />
        : <UploadStep readyModels={readyModels} model={model} error={generationError} onPhoto={startFromFile} />}
    </div>
  );
}
