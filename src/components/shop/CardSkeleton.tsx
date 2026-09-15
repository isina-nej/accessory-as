export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-square bg-black/10" />
      <div className="space-y-2 p-3">
        <div className="h-4 rounded bg-black/10" />
        <div className="h-4 w-1/2 rounded bg-black/10" />
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
