import { useState, type FormEvent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog/dialog";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { useCreateFolder } from "@/features/folder/hooks/use-create-folder";

interface CreateFolderDialogProps {
  dataRoomId: string;
  parentFolderId: string | null;
  existingNames: string[];
  onCreated: () => void;
  trigger: ReactNode;
}

const MAX_NAME_LENGTH = 255;

export function CreateFolderDialog({
  dataRoomId,
  parentFolderId,
  existingNames,
  onCreated,
  trigger,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateFolder();

  const reset = () => {
    setName("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isPending) return; // don't let the dialog close mid-submit
    setOpen(next);
    if (!next) reset();
  };

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Folder name can't be empty.";
    if (trimmed.length > MAX_NAME_LENGTH) {
      return `Folder name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return "A folder with this name already exists here.";
    }
    return null;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    mutate(
      { dataRoomId, parentFolderId, name: name.trim() },
      {
        onSuccess: () => {
          onCreated();
          setOpen(false);
          reset();
        },
        onError: (err: unknown) => {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't create the folder. Try again.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Give the folder a name. You can rename it later.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Untitled folder"
              aria-label="Folder name"
              maxLength={MAX_NAME_LENGTH}
              disabled={isPending}
            />
            {error && (
              <p className="mt-1.5 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
