import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SessionTypeBadge from '@/components/session-type-badge';

export const dynamic = 'force-dynamic';

export default async function SessionDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      id, title, description, type, starts_at, ends_at, location,
      session_speakers (
        role,
        speaker:speakers ( id, full_name, photo_url, institution, specialty )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !session) notFound();

  const fmt = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="px-4 py-6">
      <Link href="/agenda" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Agenda
      </Link>

      <div className="mt-4">
        <SessionTypeBadge type={session.type} />
        <h1 className="mt-2 text-2xl font-bold leading-tight">{session.title}</h1>

        <dl className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{fmt.format(new Date(session.starts_at))} – {fmt.format(new Date(session.ends_at))}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{session.location}</span>
            </div>
          )}
        </dl>

        {session.description && (
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed">{session.description}</p>
        )}
      </div>

      {session.session_speakers && session.session_speakers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Palestrantes</h2>
          <ul className="mt-3 space-y-3">
            {session.session_speakers.map((ss) => {
              const sp = ss.speaker as
                | { id: string; full_name: string; institution: string | null; specialty: string | null }
                | null;
              if (!sp) return null;
              return (
                <li key={sp.id}>
                  <Link href={`/speakers/${sp.id}`} className="card flex items-center gap-3 hover:border-brand-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                      {sp.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{sp.full_name}</p>
                      <p className="line-clamp-1 text-xs text-slate-500">
                        {[sp.specialty, sp.institution].filter(Boolean).join(' · ')}
                        {ss.role === 'moderator' && ' · Moderador'}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
