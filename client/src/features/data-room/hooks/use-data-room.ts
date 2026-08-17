import { useQuery } from "@tanstack/react-query";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";

export function useDataRoom(dataRoomId: string) {
  return useQuery({
    queryKey: dataRoomKeys.detail(dataRoomId),
    queryFn: () => dataRoomService.getById(dataRoomId),
    enabled: Boolean(dataRoomId),
  });
}
