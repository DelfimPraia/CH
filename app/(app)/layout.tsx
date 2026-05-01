import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/bottom-nav';
import NotificationsBell from '@/components/notifications-bell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: isAdminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  const isAdmin = !!isAdminRow;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0b1220]/80 px-4 py-3 backdrop-blur">
        <Link href="/now" className="font-semibold tracking-tight">
          AI Oil &amp; Gas <span className="text-cyan-400">·</span> 2026
        </Link>
        <NotificationsBell userId={user.id} />
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
