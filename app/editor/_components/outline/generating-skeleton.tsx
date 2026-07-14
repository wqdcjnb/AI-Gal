export function GeneratingSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-pink-100 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
              <span className="text-sm font-semibold text-pink-600">{i + 1}</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 rounded bg-pink-100" />
              <div className="h-4 w-full rounded bg-pink-50" />
              <div className="h-4 w-2/3 rounded bg-pink-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
