import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import { range } from "@/shared/utils/range";

const SKELETON_KEY_PREFIX = "data-room-skeleton";

export function DataRoomsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {range(count).map((item) => (
        <div
          key={`${SKELETON_KEY_PREFIX}-${item}`}
          className="rounded-lg border border-border bg-card p-4"
        >
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3.5 w-1/2" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
