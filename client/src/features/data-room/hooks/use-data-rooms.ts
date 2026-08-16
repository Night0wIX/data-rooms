import { useInfiniteQuery } from "@tanstack/react-query";
import { dataRoomKeys } from "../api/data-room.keys";
import { dataRoomService } from "../api/data-room.service";

export function useDataRooms() {
  return useInfiniteQuery({
    queryKey: dataRoomKeys.lists(),

    queryFn: ({ pageParam }) => dataRoomService.list(pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
