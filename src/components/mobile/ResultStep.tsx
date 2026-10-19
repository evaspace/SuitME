'use client';

import Link from 'next/link';
import { StudioProgress } from './StudioProgress';

interface ResultStepProps {
  isGenerating: boolean;
  error: string;
  onRetry: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export const ResultStep = ({ isGenerating, error, onRetry, onBack, onRestart }: ResultStepProps) => (
  <section className="page-shell studio-finish" aria-live="polite">
    <StudioProgress current={3} />
    <p className="eyebrow">Studio</p>
    {isGenerating ? <>
      <h1 className="page-heading">Creating your try-on</h1>
      <p className="page-intro">Gemini is combining your garment photo with the selected model reference.</p>
      <div className="surface-card p-5" role="status"><div className="processing-indicator" aria-hidden="true"><span /></div><p className="field-help">This can take a little while.</p></div>
    </> : error ? <>
      <h1 className="page-heading">Try-on could not be created</h1>
      <p className="form-error" role="alert">{error}</p>
      <div className="finish-actions"><button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button><button type="button" className="btn btn-outline" onClick={onBack}>Back to setup</button></div>
    </> : <>
      <h1 className="page-heading">Your try-on is ready</h1>
      <p className="page-intro">Your generated image has been saved in Results.</p>
      <div className="finish-actions"><Link className="btn btn-primary" href="/results">View result</Link><button type="button" className="btn btn-outline" onClick={onRestart}>Choose another photo</button></div>
    </>}
  </section>
);
