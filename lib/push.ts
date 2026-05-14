import 'server-only';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type SubRow = { id: string; endpoint: string; p256dh: string; auth: string };

async function deliver(subs: SubRow[], payload: PushPayload) {
  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const stale: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        // 404 / 410 = subscription is dead — mark for cleanup.
        if (statusCode === 404 || statusCode === 410) stale.push(sub.id);
      }
    }),
  );

  if (stale.length > 0) {
    const supabase = createClient();
    await supabase.from('push_subscriptions').delete().in('id', stale);
  }

  return { sent, failed, removed: stale.length };
}

/** Send a push notification to every registered subscription. Admin context. */
export async function sendPushToAll(payload: PushPayload) {
  if (!ensureConfigured()) {
    console.warn('[push] VAPID keys missing — skipping push send');
    return { sent: 0, failed: 0, removed: 0 };
  }
  const supabase = createClient();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth');
  if (!subs || subs.length === 0) return { sent: 0, failed: 0, removed: 0 };
  return deliver(subs as SubRow[], payload);
}

/** Send a push notification to a single user's subscriptions. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureConfigured()) {
    console.warn('[push] VAPID keys missing — skipping push send');
    return { sent: 0, failed: 0, removed: 0 };
  }
  const supabase = createClient();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  if (!subs || subs.length === 0) return { sent: 0, failed: 0, removed: 0 };
  return deliver(subs as SubRow[], payload);
}
