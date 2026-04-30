import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FavoriteButton from './favorite-button';
import SessionTypeBadge from '@/components/session-type-badge';
import { MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: sessions }, { data: favorites }] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        id, title, description, type, starts_at, ends_at, location,
        session_speakers ( speaker:speakers ( id, full_name ) )
      `)
      .order('starts_at', { ascending: true }),
    supabase
      .from('user_favorites')
      .select('session_id')
      .eq('user_id', user!.id),
  ]);

  const favoriteIds = new Set((favorites ?? []).map((f) => f.session_id));

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Agenda</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        9 de Maio de 2026 · {sessions?.length ?? 0} sessões
      </p>

      <ul className="mt-6 space-y-3">
        {(sessions ?? []).map((s) => {
          const speakerNames = (s.session_speakers ?? [])
            .map((ss: { speaker: { full_name: string } | null }) => ss.speaker?.full_name)
            .filter(Boolean) as string[];
          return (
            <li key={s.id} className="card flex gap-3">
              <div className="flex w-20 shrink-0 flex-col text-xs">
                <span className="font-semibold text-brand-600">
                  {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.starts_at))}
                </span>
                <span className="text-slate-500">
                  {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.ends_at))}
                </span>
                <SessionTypeBadge type={s.type} className="mt-2" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/agenda/${s.id}`} className="block">
                  <h2 className="line-clamp-2 font-semibold leading-snug">{s.title}</h2>
                  {speakerNames.length > 0 && (
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-400">
                      {speakerNames.join(' · ')}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {s.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>}
                  </p>
                </Link>
              </div>
              <FavoriteButton sessionId={s.id} initialIsFavorite={favoriteIds.has(s.id)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
