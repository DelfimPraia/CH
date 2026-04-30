import type { SessionType } from '@/lib/types/database';
import { cn } from '@/lib/utils';

const STYLES: Record<SessionType, { label: string; className: string }> = {
  keynote:    { label: 'Keynote',    className: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200' },
  panel:      { label: 'Painel',     className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  talk:       { label: 'Palestra',   className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  networking: { label: 'Networking', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  break:      { label: 'Pausa',      className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

export default function SessionTypeBadge({ type, className }: { type: SessionType; className?: string }) {
  const s = STYLES[type];
  return <span className={cn('badge', s.className, className)}>{s.label}</span>;
}
