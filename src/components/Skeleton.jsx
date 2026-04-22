export default function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="glass-card rounded-2xl p-4 space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTransactions({ count = 4 }) {
  return (
    <div className="glass-card rounded-2xl divide-y divide-white/5 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="w-10 h-10 flex-shrink-0" rounded="rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-48 w-full" rounded="rounded-xl" />
    </div>
  )
}
