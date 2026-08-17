import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "@/features/file/api/file.service";
import { fileKeys } from "@/features/file/api/file.keys";

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileService.remove(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}
