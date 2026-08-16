import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Loader2
        className="size-6 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
