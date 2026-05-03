import { Skeleton, SkeletonCard } from '@/components/skeleton';

export default function AdminLoading() {
  return (
    <section className="px-4 py-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />

      <div className="mt-6 grid grid-cols-3 gap-3">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-20" />
      </div>

      <div className="mt-8 space-y-3">
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-16" />
      </div>
    </section>
  );
}
