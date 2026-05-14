'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = 'loading' | 'unsupported' | 'denied' | 'idle' | 'subscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const [state, setState] = useState<State>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'subscribed' : 'idle'))
      .catch(() => setState('unsupported'));
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!) as BufferSource,
      });
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {});
        throw new Error('Falha ao registar no servidor.');
      }
      setState('subscribed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível ativar.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState('idle');
    } catch {
      setError('Não foi possível desativar.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'loading' || state === 'unsupported') return null;

  if (state === 'denied') {
    return (
      <div className="card flex items-center gap-3">
        <BellOff className="h-5 w-5 shrink-0 text-slate-500" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Notificações bloqueadas</p>
          <p className="text-xs text-slate-500">
            Ativa nas definições do browser para receberes avisos das sessões.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'subscribed') {
    return (
      <div className="card flex items-center gap-3 border-emerald-400/30 bg-emerald-400/[0.06]">
        <BellRing className="h-5 w-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-200">Notificações ativadas</p>
          <p className="text-xs text-emerald-300/70">Recebes avisos mesmo com o app fechado.</p>
        </div>
        <button
          onClick={disable}
          disabled={busy}
          className="shrink-0 text-xs font-medium text-slate-400 hover:text-slate-200"
        >
          {busy ? '…' : 'Desativar'}
        </button>
      </div>
    );
  }

  // idle
  return (
    <button
      onClick={enable}
      disabled={busy}
      className="card flex w-full items-center gap-3 text-left transition-colors hover:border-orange-500/40 hover:bg-white/[0.06]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
        <Bell className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {busy ? 'A ativar…' : 'Ativar notificações'}
        </p>
        <p className="text-xs text-slate-400">
          {error ?? 'Recebe avisos das sessões mesmo com o app fechado.'}
        </p>
      </div>
    </button>
  );
}
