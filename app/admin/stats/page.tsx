import { createClient } from '@/lib/supabase/server';
import AnimatedNumber from '@/components/animated-number';

export const dynamic = 'force-dynamic';

const AREA_LABEL: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
  unknown: 'Sem área',
};

export default async function StatsPage() {
  const supabase = createClient();

  const [
    { count: totalProfiles },
    { count: totalCheckIns },
    { count: totalQuestions },
    { count: answeredQuestions },
    { data: profileAreas },
    { data: favoriteCounts },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('check_ins').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_answered', true),
    supabase.from('profiles').select('area'),
    supabase.from('user_favorites').select('session_id'),
    supabase.from('sessions').select('id, title, starts_at'),
  ]);

  // group by area
  const areaCounts: Record<string, number> = {};
  for (const row of profileAreas ?? []) {
    const k = row.area ?? 'unknown';
    areaCounts[k] = (areaCounts[k] ?? 0) + 1;
  }
  const totalForArea = Object.values(areaCounts).reduce((a, b) => a + b, 0) || 1;
  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  // top sessions
  const favCounts: Record<string, number> = {};
  for (const row of favoriteCounts ?? []) {
    favCounts[row.session_id] = (favCounts[row.session_id] ?? 0) + 1;
  }
  const sessionMap = new Map((sessions ?? []).map((s) => [s.id, s]));
  const topSessions = Object.entries(favCounts)
    .map(([id, count]) => ({ id, count, session: sessionMap.get(id) }))
    .filter((r) => r.session)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const checkInRate = totalProfiles ? ((totalCheckIns ?? 0) / totalProfiles) * 100 : 0;

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Estatísticas</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <KPI label="Inscritos" value={totalProfiles ?? 0} />
        <KPI label="Check-ins" value={totalCheckIns ?? 0} sublabel={`${checkInRate.toFixed(0)}% taxa`} />
        <KPI label="Perguntas" value={totalQuestions ?? 0} />
        <KPI label="Respondidas" value={answeredQuestions ?? 0} sublabel={totalQuestions ? `${((answeredQuestions ?? 0) / totalQuestions * 100).toFixed(0)}%` : undefined} />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">Inscritos por área</h2>
      {sortedAreas.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Sem dados.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sortedAreas.map(([key, n]) => {
            const pct = (n / totalForArea) * 100;
            return (
              <li key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{AREA_LABEL[key] ?? key}</span>
                  <span className="tabular-nums text-slate-500">{n} <span className="text-xs text-slate-400">· {pct.toFixed(0)}%</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">Sessões mais favoritadas</h2>
      {topSessions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Ainda ninguém favoritou sessões.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {topSessions.map((row, i) => (
            <li key={row.id} className="card flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{row.session!.title}</p>
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(row.session!.starts_at))}
                </p>
              </div>
              <span className="tabular-nums text-sm font-semibold text-orange-600">★ {row.count}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function KPI({ label, value, sublabel }: { label: string; value: number; sublabel?: string }) {
  return (
    <div className="card">
      <p className="text-3xl font-bold tabular-nums">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-orange-400">{sublabel}</p>}
    </div>
  );
}
