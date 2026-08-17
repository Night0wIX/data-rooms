import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "@/features/file/api/file.service";
import { fileKeys } from "@/features/file/api/file.keys";

interface RenameFileInput {
  fileId: string;
  displayName: string;
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, displayName }: RenameFileInput) =>
      fileService.rename(fileId, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}
