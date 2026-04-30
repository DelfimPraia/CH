import { createClient } from '@/lib/supabase/server';
import NotificationsList from './notifications-list';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, created_at, session_id')
    .or(`target_user_id.is.null,target_user_id.eq.${user!.id}`)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <NotificationsList userId={user!.id} initial={data ?? []} />
    </section>
  );
}
