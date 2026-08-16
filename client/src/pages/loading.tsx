import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background p-6">
      <Loader2
        className="size-10 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
