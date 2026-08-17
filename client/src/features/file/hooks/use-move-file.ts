import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "@/features/file/api/file.service";
import { fileKeys } from "@/features/file/api/file.keys";

interface MoveFileInput {
  fileId: string;
  destinationFolderId: string;
}

export function useMoveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, destinationFolderId }: MoveFileInput) =>
      fileService.move(fileId, destinationFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}
