import { useDeleteDataRoom } from "../hooks/use-delete-data-room";
import type { DataRoom } from "../api/data-room.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface DeleteDataRoomDialogProps {
  dataRoom: DataRoom | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDataRoomDialog({
  dataRoom,
  onOpenChange,
}: DeleteDataRoomDialogProps) {
  const deleteDataRoom = useDeleteDataRoom();

  return (
    <AlertDialog
      open={Boolean(dataRoom)}
      onOpenChange={(next) => !deleteDataRoom.isPending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{dataRoom?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the data room. It must be empty — remove
            all folders and files inside it first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDataRoom.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteDataRoom.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (!dataRoom) return;
              deleteDataRoom.mutate(dataRoom.id, {
                onSuccess: () => onOpenChange(false),
              });
            }}
          >
            {deleteDataRoom.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
