import Scanner from './scanner';

export default function CheckInPage() {
  return (
    <section className="px-4 py-6">
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Aponta a câmara ao QR do bilhete do participante. Em alternativa, introduz o código manualmente.
      </p>
      <Scanner />
    </section>
  );
}
