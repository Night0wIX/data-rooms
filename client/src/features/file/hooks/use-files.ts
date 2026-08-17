import { useQuery } from "@tanstack/react-query";
import { fileKeys } from "../api/file.keys";
import { fileService } from "../api/file.service";

interface UseFilesParams {
  dataRoomId: string;
  folderId?: string;
  searchByName?: string;
}

export function useFiles({
  dataRoomId,
  folderId,
  searchByName,
}: UseFilesParams) {
  const params = {
    dataRoomId,
    ...(folderId && { folderId }),
    ...(searchByName && { searchByName }),
  };

  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => fileService.list(params),
    enabled: Boolean(dataRoomId),
  });
}
