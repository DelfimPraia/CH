import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) redirect('/now');

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0b1220]/80 px-4 py-3 backdrop-blur">
        <Link href="/now" className="rounded-full p-2 hover:bg-white/5" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm font-semibold uppercase tracking-wider text-orange-500">Admin</span>
      </header>
      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}
