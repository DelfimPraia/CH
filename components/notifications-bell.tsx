'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    const supabase = createClient();
    const { count: c } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .or(`target_user_id.is.null,target_user_id.eq.${userId}`);
    if (typeof c === 'number') setCount(c);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // Authenticate the realtime socket as this user. Without this the
      // postgres_changes stream is evaluated as the `anon` role and the
      // `to authenticated` RLS policies deliver nothing to regular users.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      await fetchCount();
      if (cancelled) return;

      channel = supabase
        .channel(`notif-bell-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const n = payload.new as { target_user_id: string | null };
            if (n.target_user_id === null || n.target_user_id === userId) {
              setCount((c) => c + 1);
            }
          },
        )
        .subscribe();
    })();

    // Fallback: refetch when the tab regains focus, in case a realtime event
    // was missed while the socket was asleep.
    const onFocus = () => { void fetchCount(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [userId, fetchCount]);

  return (
    <Link
      href="/notifications"
      aria-label="Notificações"
      className="relative rounded-full p-2 hover:bg-white/5"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-[#0b1220]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
