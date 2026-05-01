import { createClient } from '@/lib/supabase/server';
import BroadcastForm from './broadcast-form';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const supabase = createClient();

  const [{ data: sessions }, { data: recent }] = await Promise.all([
    supabase.from('sessions').select('id, title, starts_at').order('starts_at', { ascending: true }),
    supabase
      .from('notifications')
      .select('id, title, body, created_at, target_user_id, session_id')
      .is('target_user_id', null)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Envia uma mensagem para todos os participantes em tempo real.
      </p>

      <BroadcastForm sessions={sessions ?? []} />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">Histórico recente</h2>
      {(recent ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Ainda nenhum broadcast.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {(recent ?? []).map((n) => (
            <li key={n.id} className="card">
              <p className="font-semibold">{n.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(n.created_at))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
