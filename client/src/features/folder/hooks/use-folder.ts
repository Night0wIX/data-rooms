import { useQuery } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";

export function useFolder(folderId: string) {
  return useQuery({
    queryKey: ["folders", folderId],
    queryFn: () => folderService.getById(folderId),
    enabled: Boolean(folderId),
  });
}
