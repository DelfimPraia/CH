import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Users,
  BellRing,
  ScanLine,
  ArrowRight,
} from 'lucide-react';
import Sponsors from '@/components/sponsors';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/now');

  return (
    <main className="min-h-dvh bg-[#0b1220] text-white">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.15),_transparent_60%)]" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-2xl px-6 pt-12 pb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Transformação Digital 4.0
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl">
            AI Oil &amp; Gas<br />
            <span className="text-cyan-400">Conference</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Inteligência Artificial aplicada a reservatórios, produção e geociência.
            Um dia de palestras, painéis técnicos e networking dirigido.
          </p>

          <ul className="mt-8 grid gap-3 text-sm">
            <li className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-cyan-400" />
              <span><strong className="font-semibold">9 de Maio de 2026</strong> · 09:00 – 18:00</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <span>Local a confirmar</span>
            </li>
            <li className="flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-400" />
              <span>Geociência · Engenharia · Data Science</span>
            </li>
          </ul>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#0b1220] hover:bg-cyan-300"
            >
              Inscrever-me <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Plataforma do evento
          </h2>
          <p className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
            Tudo o que precisas no telemóvel, em tempo real.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            <Feature
              icon={CalendarDays}
              title="Agenda inteligente"
              body="Programa completo do dia, favorita as sessões que queres ver e recebe avisos antes do início."
            />
            <Feature
              icon={MessageCircle}
              title="Q&A ao vivo"
              body="Faz perguntas durante as palestras. As mais votadas sobem ao topo e o moderador escolhe."
            />
            <Feature
              icon={Users}
              title="Networking dirigido"
              body="Encontra participantes da tua área — Geociência, Engenharia, Data Science — e conecta-te."
            />
            <Feature
              icon={BellRing}
              title="Notificações em tempo real"
              body="Mudanças de sala, sessões a começar e avisos da organização chegam instantaneamente."
            />
            <Feature
              icon={ScanLine}
              title="Bilhete digital com QR"
              body="Check-in à entrada via QR code. Sem filas, sem papel, registo automático de presença."
            />
            <Feature
              icon={MapPin}
              title="Live dashboard"
              body="Sessão a decorrer agora, próxima sessão e contador a tempo real durante todo o dia."
            />
          </div>
        </div>
      </section>

      {/* ---------- Sponsors ---------- */}
      <section className="border-t border-white/10 bg-black/30 py-14">
        <div className="mx-auto max-w-2xl px-6">
          <Sponsors variant="dark" size="lg" label="Promovido por" />
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-2xl font-bold">Pronto para participar?</p>
          <p className="mt-2 text-sm text-slate-400">
            A inscrição leva menos de 1 minuto.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-6 py-3 text-sm font-semibold text-[#0b1220] hover:bg-cyan-300"
          >
            Inscrever-me <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        © 2026 AI Oil &amp; Gas Conference · Todos os direitos reservados
      </footer>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-[#0b1220] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
