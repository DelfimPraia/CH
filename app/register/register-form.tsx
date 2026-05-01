'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AreaTag } from '@/lib/types/database';

const AREAS: { value: AreaTag; label: string }[] = [
  { value: 'geoscience', label: 'Geociência' },
  { value: 'engineering', label: 'Engenharia' },
  { value: 'data_science', label: 'Data Science / IA' },
  { value: 'it', label: 'TI / Software' },
  { value: 'management', label: 'Gestão / Negócio' },
  { value: 'other', label: 'Outro' },
];

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: String(form.get('email') ?? '').trim(),
      password: String(form.get('password') ?? ''),
      options: {
        data: {
          full_name: String(form.get('full_name') ?? '').trim(),
          company: String(form.get('company') ?? '').trim() || null,
          job_title: String(form.get('job_title') ?? '').trim() || null,
          area: String(form.get('area') ?? '') || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSubmitting(false);
    if (signUpErr) {
      setError(signUpErr.message);
      return;
    }
    // If email confirmations are OFF, session is set immediately → go to agenda.
    if (data.session) {
      router.replace('/now');
      router.refresh();
      return;
    }
    // Otherwise, ask user to confirm via email.
    router.replace('/login?message=' + encodeURIComponent('Confirma o teu email para concluir a inscrição.'));
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nome completo</span>
        <input name="full_name" required className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Palavra-passe</span>
        <input name="password" type="password" required autoComplete="new-password" minLength={6} className="input mt-1.5" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Empresa</span>
          <input name="company" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Função</span>
          <input name="job_title" className="input mt-1.5" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Área</span>
        <select name="area" required className="input mt-1.5" defaultValue="">
          <option value="" disabled>Seleciona…</option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'A criar conta…' : 'Criar conta'}
      </button>
    </form>
  );
}
