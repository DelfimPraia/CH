'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendPushToAll } from '@/lib/push';

export type BroadcastResult =
  | { ok: true; push: { sent: number; failed: number } }
  | { ok: false; error: string };

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

  // 1. Persist the in-app notification (Realtime delivers it to open apps).
  const { error } = await supabase
    .from('notifications')
    .insert({ title, body, session_id, target_user_id: null });

  if (error) return { ok: false, error: error.message };

  // 2. Fan out a Web Push to every registered device (reaches closed apps too).
  //    Best-effort — a push failure must not fail the broadcast itself.
  let push = { sent: 0, failed: 0 };
  try {
    const result = await sendPushToAll({
      title,
      body,
      url: session_id ? `/agenda/${session_id}` : '/notifications',
      tag: 'aiog-broadcast',
    });
    push = { sent: result.sent, failed: result.failed };
  } catch (err) {
    console.error('[broadcast] push fan-out failed:', err);
  }

  revalidatePath('/notifications');
  return { ok: true, push };
}
