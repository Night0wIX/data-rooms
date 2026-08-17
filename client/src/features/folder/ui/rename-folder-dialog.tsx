import { useForm } from "@tanstack/react-form";
import { getFieldError } from "@/shared/utils/get-field-error";
import { useRenameFolder } from "../hooks/use-rename-folder";
import type { Folder } from "../api/folder.types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

interface RenameFolderDialogProps {
  folder: Folder | null;
  existingNames: string[];
  onOpenChange: (open: boolean) => void;
}

export function RenameFolderDialog({
  folder,
  existingNames,
  onOpenChange,
}: RenameFolderDialogProps) {
  const renameFolder = useRenameFolder();

  return (
    <Dialog
      open={Boolean(folder)}
      onOpenChange={(next) => !renameFolder.isPending && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
        </DialogHeader>
        {folder && (
          <RenameForm
            key={folder.id}
            folder={folder}
            existingNames={existingNames.filter((name) => name !== folder.name)}
            isPending={renameFolder.isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={(name) =>
              renameFolder.mutate(
                { folderId: folder.id, name },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface RenameFormProps {
  folder: Folder;
  existingNames: string[];
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

function RenameForm({
  folder,
  existingNames,
  isPending,
  onCancel,
  onSubmit,
}: RenameFormProps) {
  const form = useForm({
    defaultValues: { name: folder.name },
    validators: {
      onChange: ({ value }) => {
        const trimmed = value.name.trim();
        if (!trimmed) return { fields: { name: "Name is required" } };
        if (existingNames.includes(trimmed)) {
          return {
            fields: {
              name: "A folder with this name already exists in this location",
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: ({ value }) => onSubmit(value.name.trim()),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="name">
        {(field) => (
          <FormField
            name="name"
            label="Name"
            required
            error={getFieldError(field.state.meta.errors)}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                autoFocus
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </FormField>
        )}
      </form.Field>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              loading={isSubmitting || isPending}
              disabled={!canSubmit}
            >
              Save
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}
