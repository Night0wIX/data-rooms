import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";
import type { CreateDataRoomPayload } from "../api/data-room.types";

export function useCreateDataRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDataRoomPayload) =>
      dataRoomService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataRoomKeys.lists() });
      toast.success("Data room created");
    },
    onError: () => {
      toast.error("Couldn't create the data room");
    },
  });
}
