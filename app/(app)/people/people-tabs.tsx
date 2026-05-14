'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AreaTag } from '@/lib/types/database';

type Speaker = { id: string; full_name: string; institution: string | null; specialty: string | null; photo_url: string | null };
type Participant = { id: string; full_name: string; company: string | null; job_title: string | null; area: AreaTag | null };

const AREAS: { value: AreaTag; label: string }[] = [
  { value: 'geoscience', label: 'Geociência' },
  { value: 'engineering', label: 'Engenharia' },
  { value: 'data_science', label: 'Data Science / IA' },
  { value: 'it', label: 'TI / Software' },
  { value: 'management', label: 'Gestão / Negócio' },
  { value: 'other', label: 'Outro' },
];

const AREA_LABEL: Record<string, string> = Object.fromEntries(AREAS.map((a) => [a.value, a.label]));

export default function PeopleTabs({
  initialTab,
  initialArea,
  speakers,
  participants,
}: {
  initialTab: 'speakers' | 'participants';
  initialArea?: string;
  speakers: Speaker[];
  participants: Participant[];
}) {
  const [tab, setTab] = useState<'speakers' | 'participants'>(initialTab);
  const [area, setArea] = useState<string>(initialArea ?? 'all');
  const [query, setQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participants.filter((p) => {
      if (area !== 'all' && p.area !== area) return false;
      if (!q) return true;
      return [p.full_name, p.company, p.job_title].filter(Boolean).some((s) => s!.toLowerCase().includes(q));
    });
  }, [participants, area, query]);

  const filteredSpeakers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter((s) =>
      [s.full_name, s.institution, s.specialty].filter(Boolean).some((v) => v!.toLowerCase().includes(q)),
    );
  }, [speakers, query]);

  return (
    <>
      <div role="tablist" className="mt-4 flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
        <TabButton active={tab === 'speakers'} onClick={() => setTab('speakers')} count={speakers.length}>
          Palestrantes
        </TabButton>
        <TabButton active={tab === 'participants'} onClick={() => setTab('participants')} count={participants.length}>
          Participantes
        </TabButton>
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'speakers' ? 'Procurar palestrante…' : 'Procurar nome, empresa…'}
            className="input pl-9"
          />
        </div>

        {tab === 'participants' && (
          <div className="flex flex-wrap gap-1.5">
            <Pill active={area === 'all'} onClick={() => setArea('all')}>Todos</Pill>
            {AREAS.map((a) => (
              <Pill key={a.value} active={area === a.value} onClick={() => setArea(a.value)}>{a.label}</Pill>
            ))}
          </div>
        )}
      </div>

      {tab === 'speakers' ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {filteredSpeakers.map((s) => (
            <li key={s.id}>
              <Link href={`/speakers/${s.id}`} className="card flex items-center gap-3 hover:border-orange-400">
                <Avatar name={s.full_name} />
                <div className="min-w-0">
                  <p className="font-medium leading-tight">{s.full_name}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">
                    {[s.specialty, s.institution].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {filteredSpeakers.length === 0 && <Empty />}
        </ul>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {filteredParticipants.map((p) => (
            <li key={p.id} className="card flex items-center gap-3">
              <Avatar name={p.full_name} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{p.full_name}</p>
                <p className="line-clamp-1 text-xs text-slate-500">
                  {[p.job_title, p.company].filter(Boolean).join(' · ') || '—'}
                </p>
                {p.area && (
                  <span className="badge mt-1 bg-orange-100 text-[10px] text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                    {AREA_LABEL[p.area] ?? p.area}
                  </span>
                )}
              </div>
            </li>
          ))}
          {filteredParticipants.length === 0 && <Empty />}
        </ul>
      )}
    </>
  );
}

function TabButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex-1 rounded-md px-3 py-2 text-sm font-medium transition',
        active ? 'bg-orange-500 text-[#0b1220] shadow-sm' : 'text-slate-400 hover:text-slate-100',
      )}
    >
      {children} <span className="ml-1 text-xs text-slate-400">{count}</span>
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition',
        active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
      )}
    >
      {children}
    </button>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
      {name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
    </div>
  );
}

function Empty() {
  return (
    <li className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
      Sem resultados.
    </li>
  );
}
