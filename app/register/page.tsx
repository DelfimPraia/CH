import Link from 'next/link';
import RegisterForm from './register-form';

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <h1 className="text-3xl font-bold">Inscrição</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Já tens conta?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Entra
        </Link>
      </p>
      <RegisterForm />
    </main>
  );
}
