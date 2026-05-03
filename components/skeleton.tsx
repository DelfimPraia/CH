import { cn } from '@/lib/utils';

export function Skeleton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('animate-pulse rounded-md bg-white/[0.06]', className)}>{children}</div>;
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('animate-pulse rounded-xl border border-white/5 bg-white/[0.03]', className)}>
      {children}
    </div>
  );
}
