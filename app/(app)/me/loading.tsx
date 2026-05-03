import { Skeleton, SkeletonCard } from '@/components/skeleton';

export default function MeLoading() {
  return (
    <section className="px-4 py-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-64" />

      <SkeletonCard className="mt-6 flex flex-col items-center gap-4 py-8">
        <Skeleton className="h-56 w-56 rounded-xl" />
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-5 w-40" />
          <Skeleton className="mx-auto h-3 w-32" />
        </div>
      </SkeletonCard>

      <SkeletonCard className="mt-8 h-10" />
    </section>
  );
}
