const steps = ['Photo', 'Model and style', 'Previews'];

export function StudioProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="studio-step-indicator" aria-label={`Step ${current} of 3`}>
      {steps.map((label, index) => {
        const step = index + 1;
        return <li key={label} className={step === current ? 'is-current' : undefined} aria-current={step === current ? 'step' : undefined}><span>{step}</span><span>{label}</span></li>;
      })}
    </ol>
  );
}
