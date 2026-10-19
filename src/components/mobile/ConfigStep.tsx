'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useGarmentStore } from '@/store/useGarmentStore';
import { useModelStore } from '@/store/useModelStore';
import { StudioProgress } from './StudioProgress';

interface ConfigStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const ConfigStep = ({ onNext, onBack }: ConfigStepProps) => {
  const { selectedModelId, models, selectModel } = useModelStore();
  const availableModels = models.filter((model) => model.active && model.poses.some((pose) => pose.isDefault));
  const hasSelectedModel = availableModels.some((model) => model.id === selectedModelId);
  const { updateStyleConfig, styleConfig } = useGarmentStore();

  const handleModelSelect = (modelId: string) => {
    selectModel(modelId);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const style = e.target.value as 'chic' | 'casual' | 'streetwear' | 'business';
    updateStyleConfig({ targetStyle: style });
  };

  return (
    <div className="studio-stage">
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="page-shell space-y-6">
          <StudioProgress current={2} />
          <p className="eyebrow">Step 2 of 3 · Try-on setup</p>
          <h1 className="page-heading">Choose a model and style</h1>
          <p className="page-intro">Select an active profile and choose the look you want to preview.</p>
          <p className="field-help">Your garment and model photos are sent to Google Gemini to generate the try-on.</p>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Model</h3>
              <div className="flex overflow-x-auto space-x-3">
                {availableModels.map(model => (
                  <button
                    key={model.id}
                    type="button"
                    aria-pressed={selectedModelId === model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`model-choice ${selectedModelId === model.id ? 'is-selected' : ''}`}
                  >
                    <span className="model-choice-image">{model.poses.find((pose) => pose.isDefault) ? <Image src={model.poses.find((pose) => pose.isDefault)!.imageUrl} alt="" fill sizes="96px" unoptimized /> : <span aria-hidden="true">＋</span>}</span>
                    <div className="text-center space-y-1">
                      <div className="font-semibold">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.gender} - {model.size}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {availableModels.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active models with a default reference pose are ready yet.{' '}
                  <Link className="font-semibold underline" href="/models">Add or manage models</Link>
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="style-select" className="text-sm font-medium">Style</label>
              <select
                id="style-select"
                value={styleConfig.targetStyle ?? 'chic'}
                onChange={handleStyleChange}
                className="select select-bordered w-full"
              >
                <option value="chic">Chic</option>
                <option value="casual">Casual</option>
                <option value="streetwear">Streetwear</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="action-bar">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!hasSelectedModel}
          onClick={onNext}
          className="btn btn-primary"
        >
          Generate try-on
        </button>
      </div>
    </div>
  );
};
