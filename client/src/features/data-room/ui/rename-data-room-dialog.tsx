import { useForm } from "@tanstack/react-form";

import { getFieldError } from "@/shared/utils/get-field-error";
import { useRenameDataRoom } from "../hooks/use-rename-data-room";
import { renameDataRoomSchema } from "../schemas/rename-data-room.schema";
import type { DataRoom } from "../api/data-room.types";
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

interface RenameDataRoomDialogProps {
  dataRoom: DataRoom | null;
  onOpenChange: (open: boolean) => void;
}

export function RenameDataRoomDialog({
  dataRoom,
  onOpenChange,
}: RenameDataRoomDialogProps) {
  const renameDataRoom = useRenameDataRoom();

  return (
    <Dialog
      open={Boolean(dataRoom)}
      onOpenChange={(next) => !renameDataRoom.isPending && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename data room</DialogTitle>
        </DialogHeader>
        {/*
          key={dataRoom?.id} — навмисний ремаунт форми при зміні цілі перейменування.
          Простіше й надійніше за useEffect+reset: TanStack Form ініціалізує
          defaultValues лише один раз при мануванні, синхронізація ефектом схильна
          до гонок при швидкому перемиканні між елементами.
        */}
        {dataRoom && (
          <RenameForm
            key={dataRoom.id}
            dataRoom={dataRoom}
            isPending={renameDataRoom.isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={(name) =>
              renameDataRoom.mutate(
                { id: dataRoom.id, name },
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
  dataRoom: DataRoom;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

function RenameForm({
  dataRoom,
  isPending,
  onCancel,
  onSubmit,
}: RenameFormProps) {
  const form = useForm({
    defaultValues: { name: dataRoom.name },
    validators: { onChange: renameDataRoomSchema },
    onSubmit: ({ value }) => onSubmit(value.name),
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
