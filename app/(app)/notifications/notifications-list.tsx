'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('notifications-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as Notif & { target_user_id: string | null };
          if (n.target_user_id === null || n.target_user_id === userId) {
            setItems((prev) => [n, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (items.length === 0) {
    return <p className="mt-6 text-sm text-slate-500">Sem notificações por enquanto.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {items.map((n) => {
        const inner = (
          <div className="card">
            <p className="font-semibold">{n.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
            <p className="mt-2 text-xs text-slate-500">
              {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(n.created_at))}
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
