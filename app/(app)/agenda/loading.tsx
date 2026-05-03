import { Skeleton, SkeletonCard } from '@/components/skeleton';

export default function AgendaLoading() {
  return (
    <section className="px-4 py-6">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-48" />

      <ul className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <SkeletonCard className="flex h-24 items-center gap-3 p-4">
              <div className="w-20 space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </SkeletonCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
