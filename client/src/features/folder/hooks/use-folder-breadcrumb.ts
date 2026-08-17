import { useQuery } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";

export function useFolderBreadcrumb(folderId: string) {
  return useQuery({
    queryKey: ["folders", folderId, "breadcrumb"],
    queryFn: () => folderService.getBreadcrumb(folderId),
    enabled: Boolean(folderId),
  });
}
