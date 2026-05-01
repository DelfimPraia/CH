'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Check, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export type RankedQuestion = {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  is_answered: boolean;
  created_at: string;
  author_name: string;
  upvote_count: number;
};

export default function QA({
  sessionId,
  currentUserId,
  isAdmin,
  initialQuestions,
  initialMyUpvotes,
}: {
  sessionId: string;
  currentUserId: string;
  isAdmin: boolean;
  initialQuestions: RankedQuestion[];
  initialMyUpvotes: string[];
}) {
  const [questions, setQuestions] = useState<RankedQuestion[]>(initialQuestions);
  const [myUpvotes, setMyUpvotes] = useState<Set<string>>(new Set(initialMyUpvotes));
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime: refresh on any change to questions or upvotes for this session.
  useEffect(() => {
    const supabase = createClient();

    const refresh = async () => {
      const { data } = await supabase
        .from('questions_ranked')
        .select('*')
        .eq('session_id', sessionId)
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setQuestions(data as RankedQuestion[]);
    };

    const channel = supabase
      .channel(`qa-session-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions', filter: `session_id=eq.${sessionId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_upvotes' }, refresh)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const sorted = useMemo(
    () => [...questions].sort((a, b) => b.upvote_count - a.upvote_count || +new Date(b.created_at) - +new Date(a.created_at)),
    [questions],
  );

  async function submitQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (text.length < 3) { setError('Mínimo 3 caracteres.'); return; }
    if (text.length > 500) { setError('Máximo 500 caracteres.'); return; }
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insErr } = await supabase
      .from('questions')
      .insert({ session_id: sessionId, user_id: currentUserId, body: text });

    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setBody('');
  }

  async function toggleUpvote(qid: string) {
    const supabase = createClient();
    const has = myUpvotes.has(qid);
    setMyUpvotes((prev) => {
      const next = new Set(prev);
      has ? next.delete(qid) : next.add(qid);
      return next;
    });
    setQuestions((prev) =>
      prev.map((q) => q.id === qid ? { ...q, upvote_count: q.upvote_count + (has ? -1 : 1) } : q),
    );
    if (has) {
      await supabase.from('question_upvotes').delete().match({ question_id: qid, user_id: currentUserId });
    } else {
      await supabase.from('question_upvotes').upsert({ question_id: qid, user_id: currentUserId });
    }
  }

  async function markAnswered(qid: string, current: boolean) {
    const supabase = createClient();
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, is_answered: !current } : q));
    await supabase.from('questions').update({ is_answered: !current }).eq('id', qid);
  }

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Q&amp;A · {questions.length}
        </h2>
      </div>

      <form onSubmit={submitQuestion} className="mt-3 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Faz uma pergunta ao palestrante…"
          rows={2}
          maxLength={500}
          className="input resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-xs', body.length > 480 ? 'text-amber-600' : 'text-slate-400')}>
            {body.length}/500
          </span>
          <button type="submit" disabled={submitting || body.trim().length < 3} className="btn-primary">
            {submitting ? 'A enviar…' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
          Sê a primeira pessoa a fazer uma pergunta.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {sorted.map((q) => {
            const upvoted = myUpvotes.has(q.id);
            return (
              <li key={q.id} className={cn('card flex gap-3', q.is_answered && 'opacity-60')}>
                <button
                  type="button"
                  onClick={() => toggleUpvote(q.id)}
                  className={cn(
                    'flex w-12 shrink-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition',
                    upvoted
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
                  )}
                  aria-label={upvoted ? 'Remover voto' : 'Votar'}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>{q.upvote_count}</span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{q.body}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{q.author_name}</span>
                    {q.is_answered && (
                      <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        <Check className="mr-1 h-3 w-3" /> Respondida
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => markAnswered(q.id, q.is_answered)}
                    className="btn-ghost self-start text-xs"
                  >
                    {q.is_answered ? 'Reabrir' : 'Marcar respondida'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
