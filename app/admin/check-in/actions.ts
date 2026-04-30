'use server';

import { createClient } from '@/lib/supabase/server';

export type CheckInResult =
  | { ok: true; participant: { id: string; full_name: string; company: string | null; email: string }; alreadyCheckedIn: boolean; checkedInAt: string }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function checkInByCode(rawCode: string): Promise<CheckInResult> {
  const code = rawCode.trim().replace(/^aiog:/, '');
  if (!UUID_RE.test(code)) return { ok: false, error: 'Código inválido.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sessão expirada.' };

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, company, email')
    .eq('id', code)
    .maybeSingle();

  if (pErr || !profile) return { ok: false, error: 'Participante não encontrado.' };

  const { data: existing } = await supabase
    .from('check_ins')
    .select('checked_in_at')
    .eq('user_id', profile.id)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      participant: profile,
      alreadyCheckedIn: true,
      checkedInAt: existing.checked_in_at,
    };
  }

  const { data: inserted, error: cErr } = await supabase
    .from('check_ins')
    .insert({ user_id: profile.id, checked_in_by: user.id })
    .select('checked_in_at')
    .single();

  if (cErr || !inserted) return { ok: false, error: 'Falha ao registar check-in.' };

  return {
    ok: true,
    participant: profile,
    alreadyCheckedIn: false,
    checkedInAt: inserted.checked_in_at,
  };
}
