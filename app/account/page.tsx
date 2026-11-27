'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';

type Mode = 'login' | 'register' | 'forgot';

async function post(action: string, payload: Record<string, string>) {
  const response = await fetch(`/api/auth/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function AccountForms() {
  const router = useRouter();
  const params = useSearchParams();
  const resetToken = params.get('reset') ?? '';
  const next = params.get('next')?.startsWith('/') ? params.get('next')! : '/studio';
  const account = useAccount();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>, action: string, done: (data: { message?: string }) => void) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    try { done(await post(action, values)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  const goOn = () => { router.push(next); router.refresh(); };
  const messages = <>{error && <p className="form-error field-wide" role="alert">{error}</p>}{notice && <p className="status-message field-wide" role="status">{notice}</p>}</>;

  if (resetToken) return (
    <form className="surface-card form-grid account-form" onSubmit={(event) => void submit(event, 'reset-confirm', goOn)}>
      <h2 className="field-wide">Choose a new password</h2>
      <input type="hidden" name="token" value={resetToken} />
      <label className="field field-wide">New password<input type="password" name="password" required minLength={8} autoComplete="new-password" autoFocus /></label>
      {messages}
      <div className="form-actions field-wide"><button className="btn btn-primary" type="submit" disabled={busy}>Save password</button></div>
    </form>
  );

  if (account === undefined) return null;

  if (account) return (
    <div className="surface-card form-grid account-form">
      <h2 className="field-wide">Logged in as {account.username}</h2>
      <form className="field-wide form-grid" onSubmit={(event) => void submit(event, 'email', () => setNotice('E-mail saved.'))}>
        <label className="field field-wide">E-mail for password reset<input type="email" name="email" defaultValue={account.email ?? ''} autoComplete="email" /></label>
        <div className="form-actions field-wide"><button className="btn btn-outline" type="submit" disabled={busy}>Save e-mail</button></div>
      </form>
      {messages}
      <div className="form-actions field-wide">
        <button className="btn btn-outline" type="button" onClick={() => void post('logout', {}).then(() => { router.refresh(); window.location.reload(); })}>Log out</button>
        <button className="btn btn-primary" type="button" onClick={() => router.push('/studio')}>Open Studio</button>
      </div>
    </div>
  );

  return (
    <div className="surface-card account-form">
      <div className="account-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => { setMode('login'); setError(''); }}>Log in</button>
        <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
      </div>
      {mode === 'forgot' ? (
        <form className="form-grid" onSubmit={(event) => void submit(event, 'reset-request', (data) => setNotice(data.message ?? 'Check your e-mail.'))}>
          <label className="field field-wide">Username or e-mail<input name="who" required autoComplete="username" autoFocus /></label>
          {messages}
          <div className="form-actions field-wide"><button className="btn btn-primary" type="submit" disabled={busy}>Send reset link</button></div>
        </form>
      ) : (
        <form className="form-grid" key={mode} onSubmit={(event) => void submit(event, mode, goOn)}>
          <label className="field field-wide">Username<input name="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9._\-]+" autoComplete="username" autoFocus /></label>
          <label className="field field-wide">Password<input type="password" name="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></label>
          {mode === 'register' && <label className="field field-wide">E-mail <span className="field-help">Optional, only to reset a forgotten password</span><input type="email" name="email" autoComplete="email" /></label>}
          {messages}
          <div className="form-actions field-wide">
            {mode === 'login' && <button type="button" className="text-link" onClick={() => { setMode('forgot'); setError(''); }}>Forgot password</button>}
            <button className="btn btn-primary" type="submit" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <section className="page-shell">
      <h1 className="page-heading">Account</h1>
      <p className="page-intro">An account is needed to generate try-ons. Your models and results stay in this browser.</p>
      <Suspense><AccountForms /></Suspense>
    </section>
  );
}
