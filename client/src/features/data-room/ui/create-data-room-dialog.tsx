import { useForm } from "@tanstack/react-form";

import { useCreateDataRoom } from "../hooks/use-create-data-room";
import { createDataRoomSchema } from "../schemas/create-data-room.schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { getFieldError } from "@/shared/utils/get-field-error";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";

interface CreateDataRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDataRoomDialog({
  open,
  onOpenChange,
}: CreateDataRoomDialogProps) {
  const createDataRoom = useCreateDataRoom();

  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: { onChange: createDataRoomSchema },
    onSubmit: async ({ value }) => {
      const trimmedDescription = value.description.trim();

      createDataRoom.mutate(
        {
          name: value.name,
          ...(trimmedDescription && { description: trimmedDescription }),
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (createDataRoom.isPending) return;
    onOpenChange(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => createDataRoom.isPending && e.preventDefault()}
        onPointerDownOutside={(e) =>
          createDataRoom.isPending && e.preventDefault()
        }
      >
        <DialogHeader>
          <DialogTitle>New Data Room</DialogTitle>
          <DialogDescription>
            Give your data room a name. You can rename it later.
          </DialogDescription>
        </DialogHeader>

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
                    placeholder="e.g. Series B Due Diligence"
                    autoFocus
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </FormField>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <FormField
                name="description"
                label="Description"
                error={getFieldError(field.state.meta.errors)}
              >
                {(controlProps) => (
                  <Textarea
                    {...controlProps}
                    placeholder="What's this data room for? (optional)"
                    rows={3}
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
              onClick={() => onOpenChange(false)}
              disabled={createDataRoom.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  loading={isSubmitting || createDataRoom.isPending}
                  disabled={!canSubmit}
                >
                  Create
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
