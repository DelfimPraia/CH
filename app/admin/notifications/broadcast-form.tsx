'use client';

import { useMemo, useState, useTransition } from 'react';
import { Send, CheckCircle2, Users, UserCheck, Search } from 'lucide-react';
import { sendNotification } from './actions';
import { cn } from '@/lib/utils';

type SessionOption = { id: string; title: string; starts_at: string };
type Recipient = { id: string; full_name: string; email: string; company: string | null };

export default function NotificationForm({
  sessions,
  recipients,
}: {
  sessions: SessionOption[];
  recipients: Recipient[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  const [mode, setMode] = useState<'all' | 'selected'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter((r) =>
      [r.full_name, r.email, r.company]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q)),
    );
  }, [recipients, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSentMsg(null);

    if (mode === 'selected' && selected.size === 0) {
      setError('Seleciona pelo menos um inscrito.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set('recipients', mode === 'selected' ? Array.from(selected).join(',') : '');
    const form = e.currentTarget;

    startTransition(async () => {
      const r = await sendNotification(fd);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      const who = r.recipients === 0 ? 'todos os inscritos' : `${r.recipients} inscrito${r.recipients === 1 ? '' : 's'}`;
      const pushPart =
        r.push.sent > 0
          ? ` · ${r.push.sent} push entregue${r.push.sent === 1 ? '' : 's'}`
          : ' · sem push (ninguém com push ativado)';
      setSentMsg(`Enviada para ${who}${pushPart}.`);
      form.reset();
      setSelected(new Set());
      setMode('all');
      setQuery('');
    });
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setMode('all')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
            mode === 'all' ? 'bg-orange-500 text-[#0b1220]' : 'text-slate-400 hover:text-slate-100',
          )}
        >
          <Users className="h-4 w-4" /> Para todos
        </button>
        <button
          type="button"
          onClick={() => setMode('selected')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
            mode === 'selected' ? 'bg-orange-500 text-[#0b1220]' : 'text-slate-400 hover:text-slate-100',
          )}
        >
          <UserCheck className="h-4 w-4" /> Selecionar inscritos
        </button>
      </div>

      {/* Recipient picker */}
      {mode === 'selected' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Destinatários
              {selected.size > 0 && (
                <span className="ml-2 rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-300">
                  {selected.size} selecionado{selected.size === 1 ? '' : 's'}
                </span>
              )}
            </span>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar nome, email, empresa…"
              className="input pl-9"
            />
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-slate-500">Sem resultados.</p>
            ) : (
              filtered.map((r) => {
                const checked = selected.has(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition',
                      checked ? 'bg-orange-500/10' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        checked
                          ? 'border-orange-500 bg-orange-500 text-[#0b1220]'
                          : 'border-white/20',
                      )}
                    >
                      {checked && <CheckCircle2 className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.full_name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {[r.company, r.email].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Message fields */}
      <label className="block">
        <span className="text-sm font-medium">Título</span>
        <input name="title" required maxLength={100} className="input mt-1.5" placeholder="Ex: Sessão a começar" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Mensagem</span>
        <textarea name="body" required maxLength={500} rows={3} className="input mt-1.5 resize-none" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Sessão associada (opcional)</span>
        <select name="session_id" className="input mt-1.5" defaultValue="">
          <option value="">— Nenhuma —</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.starts_at))} · {s.title}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-slate-500">
          Se selecionada, ao tocar na notificação o utilizador é levado para a sessão.
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {sentMsg && (
        <p className="flex items-start gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {sentMsg}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        <Send className="h-4 w-4" />
        {pending
          ? 'A enviar…'
          : mode === 'all'
            ? 'Enviar para todos'
            : `Enviar para ${selected.size || 0} selecionado${selected.size === 1 ? '' : 's'}`}
      </button>
    </form>
  );
}
