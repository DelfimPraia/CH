import { Download, FileText, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AnimatedNumber from '@/components/animated-number';

export const dynamic = 'force-dynamic';

const AREA_LABELS: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  area: string | null;
  linkedin_url: string | null;
  created_at: string;
};

export default async function InscritosPage() {
  const supabase = createClient();

  const [{ data: profiles }, { data: checkIns }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, company, job_title, area, linkedin_url, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('check_ins').select('user_id, checked_in_at'),
  ]);

  const all = (profiles ?? []) as Profile[];
  const checkInMap = new Map<string, string>(
    (checkIns ?? []).map((c: { user_id: string; checked_in_at: string }) => [c.user_id, c.checked_in_at]),
  );

  // Aggregations
  const total = all.length;
  const totalCheckedIn = checkInMap.size;
  const checkInRate = total ? Math.round((totalCheckedIn / total) * 100) : 0;

  const areaCounts: Record<string, number> = {};
  for (const p of all) {
    const k = p.area ?? 'unknown';
    areaCounts[k] = (areaCounts[k] ?? 0) + 1;
  }
  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  return (
    <section className="px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inscritos</h1>
          <p className="mt-1 text-sm text-slate-400">
            {total} {total === 1 ? 'inscrição' : 'inscrições'} no total
            {totalCheckedIn > 0 && <> · {totalCheckedIn} check-ins ({checkInRate}%)</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href="/api/admin/export/inscritos?format=pdf"
            className="btn-primary"
            aria-label="Descarregar relatório PDF de todos os inscritos"
          >
            <FileText className="h-4 w-4" /> PDF
          </a>
          <a
            href="/api/admin/export/inscritos?format=csv"
            className="btn-secondary"
            aria-label="Descarregar CSV de todos os inscritos"
          >
            <Download className="h-4 w-4" /> CSV
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Inscritos" value={total} />
        <KPI label="Check-ins" value={totalCheckedIn} />
        <KPI label="Áreas únicas" value={Object.keys(areaCounts).filter((k) => k !== 'unknown').length} />
      </div>

      {/* Distribuição por área */}
      {sortedAreas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Por área</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {sortedAreas.map(([k, n]) => (
              <li key={k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
                <span>{AREA_LABELS[k] ?? k}</span>
                <span className="font-semibold tabular-nums text-cyan-300">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tabela */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <Search className="h-4 w-4" /> Lista completa
        </h2>

        {all.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
            Ainda não há inscritos.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nome</th>
                  <th className="px-3 py-2 text-left font-semibold">Empresa · Função</th>
                  <th className="px-3 py-2 text-left font-semibold">Área</th>
                  <th className="px-3 py-2 text-left font-semibold">Inscrição</th>
                  <th className="px-3 py-2 text-left font-semibold">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {all.map((p) => {
                  const checkIn = checkInMap.get(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5">
                        <div className="font-medium leading-tight">{p.full_name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{p.email}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-400">
                        {[p.job_title, p.company].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {p.area ? (
                          <span className="badge bg-cyan-400/10 text-cyan-300">
                            {AREA_LABELS[p.area] ?? p.area}
                          </span>
                        ) : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs tabular-nums text-slate-400">
                        {new Date(p.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs">
                        {checkIn ? (
                          <span className="text-emerald-400">
                            ✓ {new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(checkIn))}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Footer note */}
      <p className="mt-8 text-xs text-slate-500">
        <strong className="text-slate-300">PDF</strong> — relatório formatado com cabeçalho, KPIs, distribuição por área e tabela paginada (ideal para arquivar/imprimir). · <strong className="text-slate-300">CSV</strong> — UTF-8 com BOM e separador <code className="rounded bg-white/5 px-1">;</code> (abre direto no Excel com acentos corretos).
      </p>
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
