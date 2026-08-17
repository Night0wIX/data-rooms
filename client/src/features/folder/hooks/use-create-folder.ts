import { useMutation } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";

interface CreateFolderInput {
  dataRoomId: string;
  parentFolderId: string | null;
  name: string;
}

export function useCreateFolder() {
  return useMutation({
    mutationFn: (input: CreateFolderInput) => folderService.create(input),
  });
}
