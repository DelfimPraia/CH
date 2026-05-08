import Link from 'next/link';
import { ArrowLeft, Zap, WifiOff, Bell, Maximize2 } from 'lucide-react';
import InstallControls from './install-controls';
import Sponsors from '@/components/sponsors';

export const metadata = {
  title: 'Instalar app · AI Oil & Gas Conference',
};

export default function InstallPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-10 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-orange-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Início
      </Link>

      <header className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">
          Instalar app
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">
          Tem a app sempre<br />
          <span className="text-orange-500">à mão</span>.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Instala em segundos no telemóvel ou computador. Funciona como qualquer
          app nativa — ícone na home, ecrã completo, sem barras de browser.
        </p>
      </header>

      <section className="mt-8">
        <ul className="grid grid-cols-2 gap-2">
          <Benefit icon={Zap} label="Arranque rápido" />
          <Benefit icon={Maximize2} label="Ecrã completo" />
          <Benefit icon={Bell} label="Notificações" />
          <Benefit icon={WifiOff} label="Funciona offline*" />
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          * Conteúdo já visualizado fica disponível offline (cache do browser).
        </p>
      </section>

      <section className="mt-8">
        <InstallControls />
      </section>

      <Sponsors size="sm" label="Promovido por" className="mt-12 pt-4" />
    </main>
  );
}

function Benefit({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
      <Icon className="h-4 w-4 text-orange-500" />
      <span className="font-medium">{label}</span>
    </li>
  );
}
