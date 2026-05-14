import { createClient } from '@/lib/supabase/server';
import TicketQR from './ticket-qr';
import LogoutButton from './logout-button';
import Sponsors from '@/components/sponsors';

const AREA_LABELS: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
};

export const dynamic = 'force-dynamic';

export default async function MePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: checkIn }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('check_ins').select('checked_in_at').eq('user_id', user!.id).maybeSingle(),
  ]);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">O meu bilhete</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Apresenta este QR no check-in à entrada do evento.
      </p>

      <div className="card mt-6 flex flex-col items-center gap-4 py-8">
        <TicketQR userId={user!.id} />
        <div className="text-center">
          <p className="text-lg font-semibold">{profile?.full_name}</p>
          <p className="text-sm text-slate-500">
            {[profile?.job_title, profile?.company].filter(Boolean).join(' · ') || profile?.email}
          </p>
          {profile?.area && (
            <span className="badge mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
              {AREA_LABELS[profile.area] ?? profile.area}
            </span>
          )}
        </div>
        {checkIn && (
          <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            ✓ Check-in feito às {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(checkIn.checked_in_at))}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-1 text-sm">
        <p className="font-medium">{profile?.email}</p>
      </div>

      <LogoutButton />

      <Sponsors size="sm" label="Promovido por" className="mt-12 pb-4" />
    </section>
  );
}
