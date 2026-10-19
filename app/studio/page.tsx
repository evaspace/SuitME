'use client';

import { useState } from 'react';
import { UploadStep } from '@/components/mobile/UploadStep';
import { ConfigStep } from '@/components/mobile/ConfigStep';
import { ResultStep } from '@/components/mobile/ResultStep';
import { useGarmentStore } from '@/store/useGarmentStore';
import { useLocalDataReady } from '@/hooks/useLocalDataReady';
import { readImageForLocalUse } from '@/lib/images';
import { useGenerationStore } from '@/store/useGenerationStore';
import { createId, useModelStore } from '@/store/useModelStore';

export default function Studio() {
  const [step, setStep] = useState(1);
  const garmentStore = useGarmentStore();
  const generationStore = useGenerationStore();
  const { models, selectedModelId } = useModelStore();
  const [generationError, setGenerationError] = useState('');
  useLocalDataReady();
  const { clearGarmentSession } = garmentStore;

  async function handleGenerate() {
    const model = models.find((entry) => entry.id === selectedModelId && entry.active);
    const pose = model?.poses.find((entry) => entry.isDefault);
    const garmentFile = garmentStore.rawFile;
    if (!model || !pose || !garmentFile) {
      setGenerationError('Choose a garment photo and an active model with a default reference pose.');
      setStep(model && pose ? 1 : 2);
      return;
    }

    setGenerationError('');
    generationStore.setIsGenerating(true);
    setStep(3);
    console.info('[DressMe Studio] generation request prepared', { modelId: model.id, hasGarment: true, pose: pose.category });
    try {
      const garmentDataUrl = await readImageForLocalUse(garmentFile);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garment: { dataUrl: garmentDataUrl },
          modelReference: { dataUrl: pose.imageUrl },
          poseLabel: pose.category.replaceAll('_', ' '),
          style: garmentStore.styleConfig.targetStyle,
        }),
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
      generationStore.addResult({
        id: createId(),
        provider: 'gemini',
        imageUrl: compressedImage,
        poseId: pose.id,
        poseLabel: pose.category.replaceAll('_', ' '),
        modelName: model.name,
        style: garmentStore.styleConfig.targetStyle,
        createdAt: new Date().toISOString(),
        listingTitle: payload.listing?.listingTitle ?? '',
        listingDescription: payload.listing?.listingDescription ?? '',
        listingTags: payload.listing?.listingTags ?? '',
      });
      console.info('[DressMe Studio] generated result saved locally', { requestId: payload.requestId });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Something went wrong while generating your try-on.';
      console.error('[DressMe Studio] generation failed', cause);
      setGenerationError(message);
    } finally {
      generationStore.setIsGenerating(false);
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRestart = () => {
    clearGarmentSession();
    setStep(1);
  };

  if (step === 1) {
    return (
      <div className="studio-stage">
        <UploadStep onNext={handleNext} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="studio-stage">
        <ConfigStep onNext={() => void handleGenerate()} onBack={handleBack} />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="studio-stage">
        <ResultStep
          isGenerating={generationStore.isGenerating}
          error={generationError}
          onRetry={() => void handleGenerate()}
          onBack={handleBack}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return null;
}
