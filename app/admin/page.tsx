import Link from 'next/link';
import { ScanLine, Megaphone, BarChart3, Users, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AnimatedNumber from '@/components/animated-number';

export const dynamic = 'force-dynamic';

export default async function AdminHub() {
  const supabase = createClient();

  const [{ count: totalProfiles }, { count: totalCheckIns }, { count: totalQuestions }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('check_ins').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Painel Admin</h1>
      <p className="mt-1 text-sm text-slate-400">
        Gestão do evento em tempo real.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Inscritos" value={totalProfiles ?? 0} />
        <KPI label="Check-ins" value={totalCheckIns ?? 0} />
        <KPI label="Perguntas" value={totalQuestions ?? 0} />
      </div>

      <div className="mt-8 space-y-3">
        <Tile href="/admin/inscritos" icon={Users} title="Inscritos" description="Lista organizada de todos os participantes + download CSV (Excel)." />
        <Tile href="/admin/check-in" icon={ScanLine} title="Check-in" description="Validar bilhetes à entrada via QR." />
        <Tile href="/admin/notifications" icon={Megaphone} title="Enviar notificação" description="Broadcast para todos ou para uma sessão específica." />
        <Tile href="/admin/stats" icon={BarChart3} title="Estatísticas" description="Distribuição por área, sessões mais favoritadas, taxa de presença." />
      </div>
    </section>
  );
}

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold tabular-nums">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="card flex items-center gap-3 hover:border-orange-500/40">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="line-clamp-2 text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-500" />
    </Link>
  );
}
