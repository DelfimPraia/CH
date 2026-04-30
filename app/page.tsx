import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CalendarDays, MapPin, Users } from 'lucide-react';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/agenda');

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-between p-6">
      <header className="pt-10">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Huawei × AI</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
          AI Oil &amp; Gas<br />Conference 2026
        </h1>
        <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-400">
          Inteligência Artificial aplicada a reservatórios, produção e geociência.
          Um dia de palestras, painéis e networking técnico.
        </p>

        <ul className="mt-8 space-y-3 text-sm">
          <li className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-brand-600" /> 9 de Maio de 2026</li>
          <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-600" /> Local a confirmar</li>
          <li className="flex items-center gap-3"><Users className="h-5 w-5 text-brand-600" /> Geociência · Engenharia · Data Science</li>
        </ul>
      </header>

      <footer className="grid gap-3 pb-10 sm:grid-cols-2">
        <Link href="/login" className="btn-secondary">Entrar</Link>
        <Link href="/register" className="btn-primary">Inscrever-me</Link>
      </footer>
    </main>
  );
}
