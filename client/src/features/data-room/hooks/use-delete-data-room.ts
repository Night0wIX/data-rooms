import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";

export function useDeleteDataRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataRoomService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dataRoomKeys.lists() });
      toast.success("Data room deleted");
    },
    onError: () => {
      toast.error("Couldn't delete the data room. Make sure it's empty");
    },
  });
}
