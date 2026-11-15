export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-label="Loading subscriptions"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-6"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl skeleton-shimmer" />
              <div className="w-20 h-4 rounded skeleton-shimmer" />
            </div>
            <div className="space-y-2.5">
              <div className="h-3.5 w-32 rounded skeleton-shimmer" />
              <div className="h-5 w-48 rounded skeleton-shimmer" />
              <div className="h-4 w-full rounded skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-6 w-24 rounded skeleton-shimmer" />
            <div className="h-9 w-28 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
