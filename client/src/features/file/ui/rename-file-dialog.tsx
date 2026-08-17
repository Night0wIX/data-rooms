// client/src/features/file/ui/rename-file-dialog.tsx
import { useForm } from "@tanstack/react-form";
import { getFieldError } from "@/shared/utils/get-field-error";
import { useRenameFile } from "../hooks/use-rename-file";
import type { FileItem } from "../api/file.types";
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

interface RenameFileDialogProps {
  file: FileItem | null;
  existingNames: string[];
  onOpenChange: (open: boolean) => void;
}

export function RenameFileDialog({
  file,
  existingNames,
  onOpenChange,
}: RenameFileDialogProps) {
  const renameFile = useRenameFile();

  return (
    <Dialog
      open={Boolean(file)}
      onOpenChange={(next) => !renameFile.isPending && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
        </DialogHeader>
        {file && (
          <RenameForm
            key={file.id}
            file={file}
            existingNames={existingNames.filter(
              (name) => name !== file.displayName,
            )}
            isPending={renameFile.isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={(displayName) =>
              renameFile.mutate(
                { fileId: file.id, displayName },
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
  file: FileItem;
  existingNames: string[];
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (displayName: string) => void;
}

function RenameForm({
  file,
  existingNames,
  isPending,
  onCancel,
  onSubmit,
}: RenameFormProps) {
  const form = useForm({
    defaultValues: { displayName: file.displayName },
    validators: {
      onChange: ({ value }) => {
        const trimmed = value.displayName.trim();
        if (!trimmed) return { fields: { displayName: "Name is required" } };
        if (existingNames.includes(trimmed)) {
          return {
            fields: {
              displayName:
                "A file with this name already exists in this folder",
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: ({ value }) => onSubmit(value.displayName.trim()),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="displayName">
        {(field) => (
          <FormField
            name="displayName"
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
