'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Apple, Monitor, CheckCircle2, Download, Share, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detect(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/windows|mac|linux|cros/i.test(ua)) return 'desktop';
  return 'unknown';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function InstallControls() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setPlatform(detect());
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  if (installed) {
    return (
      <div className="card flex items-center gap-3 border-emerald-400/40 bg-emerald-400/10">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
        <div>
          <p className="font-semibold text-emerald-200">App já instalada</p>
          <p className="text-xs text-emerald-300/70">Estás a ver isto a partir da app instalada. ✓</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Native install button — only Android Chrome / Edge / Desktop Chrome give us this */}
      {deferredPrompt && (
        <button
          onClick={promptInstall}
          disabled={installing}
          className="btn-primary w-full justify-center text-base"
        >
          <Download className="h-5 w-5" />
          {installing ? 'A instalar…' : 'Instalar agora'}
        </button>
      )}

      {/* Platform-aware tabs */}
      <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1">
        <PlatformTab active={platform === 'android'} icon={Smartphone} label="Android" />
        <PlatformTab active={platform === 'ios'} icon={Apple} label="iPhone / iPad" />
        <PlatformTab active={platform === 'desktop'} icon={Monitor} label="Desktop" />
      </div>

      <div className="mt-4 space-y-4">
        <Section
          icon={Smartphone}
          title="Android (Chrome, Edge, Samsung Internet)"
          highlighted={platform === 'android'}
        >
          <Step n={1}>
            Toca em <strong className="text-orange-400">"Instalar agora"</strong> acima
            (botão azul, aparece automaticamente).
          </Step>
          <Step n={2}>
            Se não vires o botão: toca no menu <MoreVertical className="inline h-4 w-4" /> (3 pontos
            no canto superior direito) → <strong className="text-orange-400">"Instalar app"</strong>{' '}
            ou <strong className="text-orange-400">"Adicionar ao ecrã principal"</strong>.
          </Step>
          <Step n={3}>Confirma — o ícone aparece no ecrã principal como qualquer outra app.</Step>
        </Section>

        <Section
          icon={Apple}
          title="iPhone / iPad (Safari)"
          highlighted={platform === 'ios'}
          warning="Tem de ser no Safari — Chrome/Firefox no iOS não suportam instalação."
        >
          <Step n={1}>
            Toca em <Share className="inline h-4 w-4" /> <strong className="text-orange-400">Partilhar</strong>{' '}
            (ícone de quadrado com seta para cima, na barra inferior).
          </Step>
          <Step n={2}>
            Desliza até veres <Plus className="inline h-4 w-4" />{' '}
            <strong className="text-orange-400">"Adicionar ao Ecrã Principal"</strong> e toca.
          </Step>
          <Step n={3}>Toca em <strong className="text-orange-400">"Adicionar"</strong> no canto superior direito.</Step>
        </Section>

        <Section
          icon={Monitor}
          title="Desktop (Chrome, Edge, Brave)"
          highlighted={platform === 'desktop'}
        >
          <Step n={1}>
            Procura o ícone <Download className="inline h-4 w-4" /> de instalação na barra de
            endereço (lado direito).
          </Step>
          <Step n={2}>
            Em alternativa: menu de 3 pontos → <strong className="text-orange-400">"Instalar AI Oil &amp; Gas"</strong>.
          </Step>
          <Step n={3}>A app abre numa janela própria, sem barra de browser.</Step>
        </Section>
      </div>
    </>
  );
}

function PlatformTab({
  active,
  icon: Icon,
  label,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition',
        active ? 'bg-orange-500 text-[#0b1220]' : 'text-slate-400',
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  highlighted,
  warning,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  highlighted?: boolean;
  warning?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'card transition-colors',
        highlighted && 'border-orange-500/50 bg-orange-500/[0.06]',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-5 w-5', highlighted ? 'text-orange-400' : 'text-slate-400')} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {warning && (
        <p className="mt-2 rounded-md bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-200">
          ⚠ {warning}
        </p>
      )}
      <ol className="mt-3 space-y-2.5 text-sm text-slate-300">{children}</ol>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-400">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
