'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendPushToAll, sendPushToUser } from '@/lib/push';

export type NotificationResult =
  | { ok: true; recipients: number; push: { sent: number; failed: number } }
  | { ok: false; error: string };

/**
 * Sends a notification either as a broadcast (recipients empty) or targeted
 * to specific users. Targeted sends insert one notifications row per user
 * (target_user_id set) and fire an individual Web Push to each.
 *
 * `recipients` field: comma-separated user ids. Empty/absent = broadcast.
 */
export async function sendNotification(formData: FormData): Promise<NotificationResult> {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const sessionIdRaw = String(formData.get('session_id') ?? '').trim();
  const session_id = sessionIdRaw === '' ? null : sessionIdRaw;

  const recipientsRaw = String(formData.get('recipients') ?? '').trim();
  const recipients = recipientsRaw
    ? Array.from(new Set(recipientsRaw.split(',').map((s) => s.trim()).filter(Boolean)))
    : [];

  if (title.length < 3) return { ok: false, error: 'Título demasiado curto.' };
  if (body.length < 3) return { ok: false, error: 'Mensagem demasiado curta.' };
  if (title.length > 100) return { ok: false, error: 'Título: máximo 100 caracteres.' };
  if (body.length > 500) return { ok: false, error: 'Mensagem: máximo 500 caracteres.' };

  const supabase = createClient();
  const url = session_id ? `/agenda/${session_id}` : '/notifications';

  // ---------- Broadcast ----------
  if (recipients.length === 0) {
    const { error } = await supabase
      .from('notifications')
      .insert({ title, body, session_id, target_user_id: null });
    if (error) return { ok: false, error: error.message };

    let push = { sent: 0, failed: 0 };
    try {
      const r = await sendPushToAll({ title, body, url, tag: 'aiog-broadcast' });
      push = { sent: r.sent, failed: r.failed };
    } catch (err) {
      console.error('[notify] broadcast push failed:', err);
    }

    revalidatePath('/notifications');
    return { ok: true, recipients: 0, push };
  }

  // ---------- Targeted ----------
  const rows = recipients.map((uid) => ({ title, body, session_id, target_user_id: uid }));
  const { error } = await supabase.from('notifications').insert(rows);
  if (error) return { ok: false, error: error.message };

  let push = { sent: 0, failed: 0 };
  try {
    const results = await Promise.all(
      recipients.map((uid) => sendPushToUser(uid, { title, body, url, tag: 'aiog-targeted' })),
    );
    push = results.reduce(
      (acc, r) => ({ sent: acc.sent + r.sent, failed: acc.failed + r.failed }),
      { sent: 0, failed: 0 },
    );
  } catch (err) {
    console.error('[notify] targeted push failed:', err);
  }

  revalidatePath('/notifications');
  return { ok: true, recipients: recipients.length, push };
}
