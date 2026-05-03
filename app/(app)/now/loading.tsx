import { Skeleton, SkeletonCard } from '@/components/skeleton';

export default function NowLoading() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-white/10 px-4 pt-6 pb-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-8 w-3/4" />
        <Skeleton className="mt-1 h-7 w-1/2" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </section>

      {/* Live status */}
      <section className="px-4 pt-5">
        <SkeletonCard className="h-20" />
      </section>

      {/* Big tile */}
      <section className="px-4 pt-5">
        <SkeletonCard className="h-32" />
      </section>

      {/* Grid tiles */}
      <section className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
      </section>
    </>
  );
}
