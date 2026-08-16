import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";
import type { RenameDataRoomPayload } from "../api/data-room.types";

export function useRenameDataRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RenameDataRoomPayload) =>
      dataRoomService.rename(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataRoomKeys.lists() });
      toast.success("Data room renamed");
    },
    onError: () => {
      toast.error("Couldn't rename the data room");
    },
  });
}
