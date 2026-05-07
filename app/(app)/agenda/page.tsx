import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FavoriteButton from './favorite-button';
import SessionTypeBadge from '@/components/session-type-badge';
import TrackBadge, { TRACK_LABELS } from '@/components/track-badge';
import { MapPin } from 'lucide-react';
import type { SessionType, TrackTag } from '@/lib/types/database';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SessionListItem = {
  id: string;
  title: string;
  description: string | null;
  type: SessionType;
  track: TrackTag | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  session_speakers: Array<{
    speaker: { id: string; full_name: string } | null;
  }> | null;
};

const TRACK_FILTERS: Array<{ value: TrackTag | 'all'; label: string }> = [
  { value: 'all',        label: 'Tudo' },
  { value: 'upstream',   label: 'Upstream' },
  { value: 'midstream',  label: 'Midstream' },
  { value: 'downstream', label: 'Downstream' },
];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { track?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawSessions }, { data: favorites }] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        id, title, description, type, track, starts_at, ends_at, location,
        session_speakers ( speaker:speakers ( id, full_name ) )
      `)
      .order('starts_at', { ascending: true }),
    supabase
      .from('user_favorites')
      .select('session_id')
      .eq('user_id', user!.id),
  ]);

  const sessions = (rawSessions ?? []) as unknown as SessionListItem[];
  const favoriteIds = new Set((favorites ?? []).map((f) => f.session_id));

  // Filter by track (if selected)
  const activeFilter = TRACK_FILTERS.find((f) => f.value === searchParams.track) ?? TRACK_FILTERS[0];
  const filtered = activeFilter.value === 'all'
    ? sessions
    : sessions.filter((s) => s.track === activeFilter.value);
  const hasAnyTrack = sessions.some((s) => s.track !== null);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Agenda</h1>
      <p className="mt-1 text-sm text-slate-400">
        Quarta-feira, 20 de Maio de 2026 · {sessions.length} sessões
      </p>

      {/* Filter pills (only shown if any session has a track) */}
      {hasAnyTrack && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {TRACK_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/agenda' : `/agenda?track=${f.value}`}
              scroll={false}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                activeFilter.value === f.value
                  ? 'bg-cyan-400 text-[#0b1220]'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]',
              )}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {sessions.filter((s) => s.track === f.value).length}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
          Sem sessões para {TRACK_LABELS[activeFilter.value as TrackTag]}.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((s) => {
            const speakerNames = (s.session_speakers ?? [])
              .map((ss) => ss.speaker?.full_name)
              .filter((n): n is string => Boolean(n));
            return (
              <li key={s.id} className="card flex gap-3">
                <div className="flex w-20 shrink-0 flex-col text-xs">
                  <span className="font-semibold text-cyan-400">
                    {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.starts_at))}
                  </span>
                  <span className="text-slate-400">
                    {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.ends_at))}
                  </span>
                  <SessionTypeBadge type={s.type} className="mt-2" />
                  {s.track && <TrackBadge track={s.track} className="mt-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/agenda/${s.id}`} className="block">
                    <h2 className="line-clamp-2 font-semibold leading-snug">{s.title}</h2>
                    {speakerNames.length > 0 && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">
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
      )}
    </section>
  );
}
