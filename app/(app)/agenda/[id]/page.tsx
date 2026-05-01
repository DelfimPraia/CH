import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SessionTypeBadge from '@/components/session-type-badge';
import QA, { type RankedQuestion } from './qa';
import type { SessionType, SpeakerRole } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

type SessionDetail = {
  id: string;
  title: string;
  description: string | null;
  type: SessionType;
  starts_at: string;
  ends_at: string;
  location: string | null;
  session_speakers: Array<{
    role: SpeakerRole;
    speaker: {
      id: string;
      full_name: string;
      photo_url: string | null;
      institution: string | null;
      specialty: string | null;
    } | null;
  }> | null;
};

export default async function SessionDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: rawSession, error },
    { data: questions },
    { data: myUpvotes },
    { data: adminRow },
  ] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        id, title, description, type, starts_at, ends_at, location,
        session_speakers (
          role,
          speaker:speakers ( id, full_name, photo_url, institution, specialty )
        )
      `)
      .eq('id', params.id)
      .single(),
    supabase
      .from('questions_ranked')
      .select('*')
      .eq('session_id', params.id)
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('question_upvotes')
      .select('question_id')
      .eq('user_id', user!.id),
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ]);

  const session = rawSession as unknown as SessionDetail | null;
  if (error || !session) notFound();

  const fmt = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="px-4 py-6">
      <Link href="/agenda" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" /> Agenda
      </Link>

      <div className="mt-4">
        <SessionTypeBadge type={session.type} />
        <h1 className="mt-2 text-2xl font-bold leading-tight">{session.title}</h1>

        <dl className="mt-4 space-y-2 text-sm text-slate-400">
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Palestrantes</h2>
          <ul className="mt-3 space-y-3">
            {session.session_speakers.map((ss) => {
              const sp = ss.speaker;
              if (!sp) return null;
              return (
                <li key={sp.id}>
                  <Link href={`/speakers/${sp.id}`} className="card flex items-center gap-3 hover:border-cyan-400/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 font-semibold text-cyan-300">
                      {sp.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{sp.full_name}</p>
                      <p className="line-clamp-1 text-xs text-slate-400">
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

      <QA
        sessionId={session.id}
        currentUserId={user!.id}
        isAdmin={!!adminRow}
        initialQuestions={(questions ?? []) as RankedQuestion[]}
        initialMyUpvotes={(myUpvotes ?? []).map((r) => r.question_id)}
      />
    </article>
  );
}
