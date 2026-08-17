import { useQuery } from "@tanstack/react-query";
import { folderKeys } from "../api/folder.keys";
import { folderService } from "../api/folder.service";

interface UseFoldersParams {
  dataRoomId: string;
  parentFolderId?: string;
}

export function useFolders({ dataRoomId, parentFolderId }: UseFoldersParams) {
  const params = {
    dataRoomId,
    ...(parentFolderId && { parentFolderId }),
  };

  return useQuery({
    queryKey: folderKeys.list(params),
    queryFn: () => folderService.list(params),
    enabled: Boolean(dataRoomId),
  });
}
