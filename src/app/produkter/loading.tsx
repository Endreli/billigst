export default function Loading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-8 w-40 animate-shimmer rounded-lg" />
        <div className="h-4 w-60 animate-shimmer rounded mt-2" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-28 animate-shimmer rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-card p-5 flex gap-4">
            <div className="w-20 h-20 animate-shimmer rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-16 animate-shimmer rounded" />
              <div className="h-5 w-40 animate-shimmer rounded" />
              <div className="h-4 w-24 animate-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
