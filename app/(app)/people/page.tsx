import { createClient } from '@/lib/supabase/server';
import PeopleTabs from './people-tabs';

export const dynamic = 'force-dynamic';

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { tab?: 'speakers' | 'participants'; area?: string };
}) {
  const supabase = createClient();

  const [{ data: speakers }, { data: participants }] = await Promise.all([
    supabase
      .from('speakers')
      .select('id, full_name, institution, specialty, photo_url')
      .order('full_name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, full_name, company, job_title, area')
      .order('full_name', { ascending: true }),
  ]);

  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Pessoas</h1>
      <PeopleTabs
        initialTab={searchParams.tab ?? 'speakers'}
        initialArea={searchParams.area}
        speakers={speakers ?? []}
        participants={participants ?? []}
      />
    </section>
  );
}
