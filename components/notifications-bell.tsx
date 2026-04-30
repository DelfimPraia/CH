'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .or(`target_user_id.is.null,target_user_id.eq.${userId}`);
      if (!cancelled && typeof count === 'number') setUnread(count);
    })();

    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as { target_user_id: string | null };
          if (n.target_user_id === null || n.target_user_id === userId) {
            setUnread((u) => u + 1);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link href="/notifications" aria-label="Notificações" className="relative rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
