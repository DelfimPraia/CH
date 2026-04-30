import Link from 'next/link';
import LoginForm from './login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string };
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <h1 className="text-3xl font-bold">Entrar</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Ainda não tens conta?{' '}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Inscreve-te
        </Link>
      </p>

      {searchParams.message && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {searchParams.message}
        </p>
      )}

      <LoginForm redirectTo={searchParams.redirect ?? '/agenda'} />
    </main>
  );
}
