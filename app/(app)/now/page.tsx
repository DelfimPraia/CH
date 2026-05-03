import Link from 'next/link';
import {
  CalendarDays,
  Mic,
  Users,
  Bell,
  Award,
  MapPin,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import LiveClock from './live-clock';
import Sponsors from '@/components/sponsors';

export const dynamic = 'force-dynamic';

const EVENT_DATE = '16 de Maio de 2026';
const EVENT_LOCATION = 'Huawei Angola office park';

export default async function HomeDashboard() {
  const supabase = createClient();

  const [{ data: { user } }, { data: sessions }, { count: unreadCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('sessions')
      .select('id, title, type, starts_at, ends_at, location')
      .order('starts_at', { ascending: true }),
    supabase.from('notifications').select('*', { count: 'exact', head: true }),
  ]);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();
  const firstName = profile?.full_name.split(' ')[0] ?? 'Participante';

  const now = new Date();
  const list = sessions ?? [];
  const ongoing = list.find((s) => new Date(s.starts_at) <= now && new Date(s.ends_at) > now) ?? null;
  const upcoming = list.find((s) => new Date(s.starts_at) > now) ?? null;
  const eventStart = list[0] ? new Date(list[0].starts_at) : null;
  const eventEnd = list.length > 0 ? new Date(list[list.length - 1].ends_at) : null;

  let phase: 'before' | 'during' | 'after' = 'before';
  if (eventStart && eventEnd) {
    if (now >= eventEnd) phase = 'after';
    else if (now >= eventStart) phase = 'during';
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,211,238,0.18),_transparent_55%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" aria-hidden />

        <div className="relative px-4 pt-6 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
            Bem-vindo, {firstName}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight">
            AI Oil &amp; Gas<br />
            <span className="text-cyan-400">Conference 2026</span>
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{EVENT_DATE}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{EVENT_LOCATION}</span>
          </div>
        </div>
      </section>

      {/* ---------- Live status ---------- */}
      <section className="px-4 pt-5">
        {phase === 'before' && eventStart && (
          <Link href="/agenda" className="block">
            <div className="card flex items-center gap-4 bg-gradient-to-br from-cyan-400/10 to-transparent">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">Começa em</p>
                <div className="mt-1 text-lg font-bold tabular-nums">
                  <LiveClock targetIso={eventStart.toISOString()} compact />
                </div>
              </div>
            </div>
          </Link>
        )}

        {phase === 'during' && ongoing && (
          <Link href={`/agenda/${ongoing.id}`} className="block">
            <div className="card flex items-center gap-3 border-cyan-400/40 bg-gradient-to-br from-cyan-400/15 to-transparent">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">A decorrer agora</p>
                <p className="line-clamp-1 font-semibold">{ongoing.title}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-slate-300">
                <LiveClock targetIso={ongoing.ends_at} compact />
              </span>
            </div>
          </Link>
        )}

        {phase === 'during' && !ongoing && upcoming && (
          <Link href={`/agenda/${upcoming.id}`} className="block">
            <div className="card flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <CalendarDays className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Próxima sessão</p>
                <p className="line-clamp-1 font-semibold">{upcoming.title}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-slate-400">
                em <LiveClock targetIso={upcoming.starts_at} compact />
              </span>
            </div>
          </Link>
        )}

        {phase === 'after' && (
          <div className="card text-center">
            <p className="font-semibold">Obrigado pela tua presença!</p>
            <p className="mt-1 text-sm text-slate-400">O evento terminou. Materiais e certificados a chegar em breve.</p>
          </div>
        )}
      </section>

      {/* ---------- Big tile ---------- */}
      <section className="px-4 pt-5">
        <BigTile href="/agenda" icon={CalendarDays} label="Programa" sublabel="Sessões do dia" />
      </section>

      {/* ---------- Grid tiles ---------- */}
      <section className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <Tile href="/people?tab=speakers" icon={Mic} label="Palestrantes" />
          <Tile href="/people?tab=participants" icon={Users} label="Participantes" />
          <Tile href="/notifications" icon={Bell} label="Notificações" badge={unreadCount ?? 0} />
          <Tile href="#sponsors" icon={Award} label="Patrocinadores" />
        </div>
      </section>

      {/* ---------- Sponsors ---------- */}
      <section id="sponsors" className="mt-8 border-t border-white/10 px-4 py-8">
        <Sponsors size="md" label="Promovido por" variant="dark" />
      </section>
    </>
  );
}

function BigTile({
  href,
  icon: Icon,
  label,
  sublabel,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-32 flex-col justify-between overflow-hidden rounded-xl bg-cyan-400/10 p-4 ring-1 ring-cyan-400/30 transition-colors hover:bg-cyan-400/15"
    >
      <div className="absolute -right-4 -top-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10" aria-hidden>
        <Icon className="h-8 w-8 text-cyan-400/80" />
      </div>
      <div className="relative mt-auto">
        <p className="text-base font-bold leading-tight">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>
      </div>
    </Link>
  );
}

function Tile({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-24 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-cyan-400/40 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-cyan-400" />
        {badge !== undefined && badge > 0 && (
          <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-[#0b1220]">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </Link>
  );
}
