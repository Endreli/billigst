export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <div className="h-6 w-20 animate-shimmer rounded" />

      {/* Product header */}
      <div className="flex gap-5">
        <div className="w-28 h-28 animate-shimmer rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-24 animate-shimmer rounded" />
          <div className="h-6 w-48 animate-shimmer rounded" />
          <div className="h-8 w-28 animate-shimmer rounded mt-1" />
        </div>
      </div>

      {/* Add to basket button */}
      <div className="h-14 animate-shimmer rounded-2xl" />

      {/* Price chart */}
      <div className="bg-surface rounded-card p-5">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-28 animate-shimmer rounded" />
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="h-9 w-11 animate-shimmer rounded-xl" />)}
          </div>
        </div>
        <div className="h-[250px] animate-shimmer rounded-xl" />
      </div>

      {/* Store prices */}
      <div className="bg-surface rounded-card p-5 space-y-3">
        <div className="h-5 w-36 animate-shimmer rounded" />
        {[1,2,3].map(i => (
          <div key={i} className="h-14 animate-shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );
}
