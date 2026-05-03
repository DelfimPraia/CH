import { Skeleton, SkeletonCard } from '@/components/skeleton';

export default function PeopleLoading() {
  return (
    <section className="px-4 py-6">
      <Skeleton className="h-7 w-24" />
      <SkeletonCard className="mt-4 h-12" />
      <SkeletonCard className="mt-3 h-10" />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <SkeletonCard className="flex h-16 items-center gap-3 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </SkeletonCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
