import { useQuery } from "@tanstack/react-query";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";

export function useSharedDataRooms() {
  return useQuery({
    queryKey: dataRoomKeys.shared(),
    queryFn: () => dataRoomService.listShared(),
  });
}
