import { useMutation, useQueryClient } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";
import { folderKeys } from "@/features/folder/api/folder.keys";
import { fileKeys } from "@/features/file/api/file.keys";

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => folderService.remove(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
}
