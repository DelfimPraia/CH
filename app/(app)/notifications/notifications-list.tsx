'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Notif = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  session_id: string | null;
};

export default function NotificationsList({
  userId,
  initial,
}: {
  userId: string;
  initial: Notif[];
}) {
  const [items, setItems] = useState<Notif[]>(initial);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, created_at, session_id')
      .or(`target_user_id.is.null,target_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setItems(data as Notif[]);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Authenticate the realtime socket as this user — otherwise the
      // `to authenticated` RLS policy delivers no postgres_changes events.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`notif-feed-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          // Refetch the full list (RLS-filtered) rather than trusting the
          // payload — simpler and immune to missed/duplicate events.
          () => { void refetch(); },
        )
        .subscribe();
    })();

    // Fallback: refetch on focus in case a realtime event was missed.
    const onFocus = () => { void refetch(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [userId, refetch]);

  if (items.length === 0) {
    return <p className="mt-6 text-sm text-slate-500">Sem notificações por enquanto.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map((n) => {
        const inner = (
          <div className="card">
            <p className="font-semibold">{n.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-400">{n.body}</p>
            <p className="mt-2 text-xs text-slate-500">
              {new Intl.DateTimeFormat('pt-PT', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              }).format(new Date(n.created_at))}
            </p>
          </div>
        );
        return (
          <li key={n.id}>
            {n.session_id
              ? <Link href={`/agenda/${n.session_id}`} className="block hover:opacity-90">{inner}</Link>
              : inner}
          </li>
        );
      })}
    </ul>
  );
}
