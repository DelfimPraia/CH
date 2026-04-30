import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SpeakerDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: speaker, error }, { data: sessionLinks }] = await Promise.all([
    supabase.from('speakers').select('*').eq('id', params.id).single(),
    supabase
      .from('session_speakers')
      .select('role, session:sessions ( id, title, starts_at )')
      .eq('speaker_id', params.id),
  ]);

  if (error || !speaker) notFound();

  const fmt = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="px-4 py-6">
      <Link href="/speakers" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Palestrantes
      </Link>

      <div className="mt-6 flex flex-col items-start gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {speaker.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">{speaker.full_name}</h1>
          {(speaker.specialty || speaker.institution) && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {[speaker.specialty, speaker.institution].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {speaker.bio && (
        <p className="mt-6 whitespace-pre-line text-base leading-relaxed">{speaker.bio}</p>
      )}

      {(speaker.linkedin_url || speaker.researchgate_url) && (
        <div className="mt-6 flex flex-wrap gap-2">
          {speaker.linkedin_url && (
            <a href={speaker.linkedin_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
              LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {speaker.researchgate_url && (
            <a href={speaker.researchgate_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
              ResearchGate <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {sessionLinks && sessionLinks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sessões</h2>
          <ul className="mt-3 space-y-2">
            {sessionLinks.map((link) => {
              const s = link.session as { id: string; title: string; starts_at: string } | null;
              if (!s) return null;
              return (
                <li key={s.id}>
                  <Link href={`/agenda/${s.id}`} className="card block hover:border-brand-400">
                    <p className="font-medium">{s.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {fmt.format(new Date(s.starts_at))}
                      {link.role === 'moderator' && ' · como moderador'}
                    </p>
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
