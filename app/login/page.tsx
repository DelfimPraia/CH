import Link from 'next/link';
import LoginForm from './login-form';
import Sponsors from '@/components/sponsors';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string };
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col p-6">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600">
        ← AI Oil &amp; Gas 2026
      </Link>

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ainda não tens conta?{' '}
          <Link href="/register" className="font-medium text-orange-600 hover:underline">
            Inscreve-te
          </Link>
        </p>

        {searchParams.message && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {searchParams.message}
          </p>
        )}

        <LoginForm redirectTo={searchParams.redirect ?? '/now'} />
      </div>

      <Sponsors size="sm" label="Promovido por" className="pt-8" />
    </main>
  );
}
