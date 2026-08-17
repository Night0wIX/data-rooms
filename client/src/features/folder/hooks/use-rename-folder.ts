import { useMutation, useQueryClient } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";
import { folderKeys } from "@/features/folder/api/folder.keys";

interface RenameFolderInput {
  folderId: string;
  name: string;
}

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, name }: RenameFolderInput) =>
      folderService.rename(folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}
