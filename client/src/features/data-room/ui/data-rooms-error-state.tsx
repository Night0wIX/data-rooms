import { RotateCw, ServerCrash } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface DataRoomsErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function DataRoomsErrorState({
  onRetry,
  isRetrying,
}: DataRoomsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <ServerCrash className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        Couldn't load your data rooms
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching your data rooms. Check your
        connection and try again.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={onRetry}
        loading={Boolean(isRetrying)}
        leftIcon={<RotateCw className="size-4" />}
      >
        Try again
      </Button>
    </div>
  );
}
