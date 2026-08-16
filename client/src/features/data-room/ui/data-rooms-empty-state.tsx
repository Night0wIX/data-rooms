import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button/button";

export function DataRoomsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <ShieldCheck className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        No data rooms yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first data room to start organizing and sharing due
        diligence documents.
      </p>
      <Button type="button" className="mt-6" onClick={onCreate}>
        <Plus className="size-4" />
        New Data Room
      </Button>
    </div>
  );
}
