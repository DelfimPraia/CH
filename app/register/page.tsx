import Link from 'next/link';
import RegisterForm from './register-form';
import Sponsors from '@/components/sponsors';

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col p-6">
      <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600">
        ← AI Oil &amp; Gas 2026
      </Link>

      <div className="flex flex-1 flex-col justify-center pt-6">
        <h1 className="text-3xl font-bold">Inscrição</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Já tens conta?{' '}
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            Entra
          </Link>
        </p>
        <RegisterForm />
      </div>

      <Sponsors size="sm" label="Promovido por" className="pt-8" />
    </main>
  );
}
