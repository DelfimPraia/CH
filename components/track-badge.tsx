import type { TrackTag } from '@/lib/types/database';
import { cn } from '@/lib/utils';

const STYLES: Record<TrackTag, { label: string; className: string; dot: string }> = {
  upstream:   { label: 'UPSTREAM',   className: 'bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/30',     dot: 'bg-orange-500' },
  midstream:  { label: 'MIDSTREAM',  className: 'bg-purple-400/10 text-purple-300 ring-1 ring-inset ring-purple-400/30', dot: 'bg-purple-400' },
  downstream: { label: 'DOWNSTREAM', className: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30', dot: 'bg-emerald-400' },
};

export default function TrackBadge({
  track,
  className,
  showDot = false,
}: {
  track: TrackTag;
  className?: string;
  showDot?: boolean;
}) {
  const s = STYLES[track];
  return (
    <span className={cn('badge gap-1.5 text-[10px] font-bold tracking-[0.1em]', s.className, className)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />}
      {s.label}
    </span>
  );
}

export const TRACK_LABELS: Record<TrackTag, string> = {
  upstream: 'Upstream',
  midstream: 'Midstream',
  downstream: 'Downstream',
};
