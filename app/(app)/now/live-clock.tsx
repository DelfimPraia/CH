'use client';

import { useEffect, useState } from 'react';

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

export default function LiveClock({ targetIso, compact = false }: { targetIso: string; compact?: boolean }) {
  const target = new Date(targetIso);
  const [now, setNow] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setNow(diff(target)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!now) return <span className="font-mono">—</span>;

  if (compact) {
    if (now.days > 0) return <span className="font-mono">{now.days}d {String(now.hours).padStart(2, '0')}h</span>;
    if (now.hours > 0) return <span className="font-mono">{String(now.hours).padStart(2, '0')}:{String(now.minutes).padStart(2, '0')}:{String(now.seconds).padStart(2, '0')}</span>;
    return <span className="font-mono">{String(now.minutes).padStart(2, '0')}:{String(now.seconds).padStart(2, '0')}</span>;
  }

  return (
    <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-2xl font-bold sm:text-3xl">
      <Cell value={now.days} label="dias" />
      <Cell value={now.hours} label="horas" />
      <Cell value={now.minutes} label="min" />
      <Cell value={now.seconds} label="seg" />
    </div>
  );
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
      <div>{String(value).padStart(2, '0')}</div>
      <div className="mt-0.5 text-[10px] font-normal uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
