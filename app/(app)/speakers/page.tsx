import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SpeakersPage() {
  const supabase = createClient();
  const { data: speakers } = await supabase
    .from('speakers')
    .select('id, full_name, institution, specialty, photo_url')
    .order('full_name', { ascending: true });

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Palestrantes</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {speakers?.length ?? 0} convidados
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {(speakers ?? []).map((s) => (
          <li key={s.id}>
            <Link href={`/speakers/${s.id}`} className="card flex items-center gap-3 hover:border-brand-400">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {s.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-medium leading-tight">{s.full_name}</p>
                <p className="line-clamp-1 text-xs text-slate-500">
                  {[s.specialty, s.institution].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
