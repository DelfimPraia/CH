'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setError(signInErr.message);
      return;
    }
    startTransition(() => {
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Palavra-passe</span>
        <input name="password" type="password" required autoComplete="current-password" minLength={6} className="input mt-1.5" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'A entrar…' : 'Entrar'}
      </button>
    </form>
  );
}
