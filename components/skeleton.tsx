import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-white/[0.06]', className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl border border-white/5 bg-white/[0.03]', className)} />;
}
