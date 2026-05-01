'use client';

import { useState, useTransition } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { broadcastNotification } from './actions';

type SessionOption = { id: string; title: string; starts_at: string };

export default function BroadcastForm({ sessions }: { sessions: SessionOption[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(false);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const r = await broadcastNotification(fd);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSent(true);
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4">
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
        <span className="mt-1 block text-xs text-slate-500">Se selecionado, ao tocar na notificação o utilizador é levado para a sessão.</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {sent && (
        <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Notificação enviada.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        <Send className="h-4 w-4" /> {pending ? 'A enviar…' : 'Enviar broadcast'}
      </button>
    </form>
  );
}
