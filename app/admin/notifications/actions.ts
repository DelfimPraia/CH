'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type BroadcastResult = { ok: true } | { ok: false; error: string };

export async function broadcastNotification(formData: FormData): Promise<BroadcastResult> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const sessionIdRaw = String(formData.get('session_id') ?? '').trim();
  const session_id = sessionIdRaw === '' ? null : sessionIdRaw;

  if (title.length < 3) return { ok: false, error: 'Título demasiado curto.' };
  if (body.length < 3) return { ok: false, error: 'Mensagem demasiado curta.' };
  if (title.length > 100) return { ok: false, error: 'Título: máximo 100 caracteres.' };
  if (body.length > 500) return { ok: false, error: 'Mensagem: máximo 500 caracteres.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .insert({ title, body, session_id, target_user_id: null });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/notifications');
  return { ok: true };
}
