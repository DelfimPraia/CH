import { createClient } from '@/lib/supabase/server';
import NotificationForm from './broadcast-form';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const supabase = createClient();

  const [{ data: sessions }, { data: recent }, { data: profiles }] = await Promise.all([
    supabase.from('sessions').select('id, title, starts_at').order('starts_at', { ascending: true }),
    supabase
      .from('notifications')
      .select('id, title, body, created_at, target_user_id, session_id')
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('profiles')
      .select('id, full_name, email, company')
      .order('full_name', { ascending: true }),
  ]);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <p className="mt-1 text-sm text-slate-400">
        Envia para todos os participantes ou seleciona inscritos específicos. Chega in-app
        em tempo real + push (para quem ativou).
      </p>

      <NotificationForm sessions={sessions ?? []} recipients={profiles ?? []} />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Histórico recente
      </h2>
      {(recent ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Ainda nenhuma notificação enviada.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {(recent ?? []).map((n) => (
            <li key={n.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                <span
                  className={
                    n.target_user_id
                      ? 'badge shrink-0 bg-orange-500/15 text-orange-300'
                      : 'badge shrink-0 bg-white/10 text-slate-300'
                  }
                >
                  {n.target_user_id ? 'Individual' : 'Todos'}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{n.body}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Intl.DateTimeFormat('pt-PT', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                }).format(new Date(n.created_at))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
