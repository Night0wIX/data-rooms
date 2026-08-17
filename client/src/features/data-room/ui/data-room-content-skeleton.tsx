import { range } from "@/shared/utils/range";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";

export function DataRoomContentSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading contents…</span>

      <div className="border-b border-border px-3 py-2" aria-hidden="true">
        <Skeleton className="h-3 w-12" />
      </div>

      <div className="divide-y divide-border" aria-hidden="true">
        {range(count).map((index) => (
          <div
            key={`data-room-content-skeleton-${index}`}
            className="flex items-center gap-3 px-3 py-3"
          >
            <Skeleton className="size-9 rounded-md" />

            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
