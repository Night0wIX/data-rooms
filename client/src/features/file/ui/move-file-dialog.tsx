import { useState } from "react";
import { ChevronRight, Folder as FolderIcon, FolderInput } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { folderService } from "@/features/folder/api/folder.service";
import { useMoveFile } from "../hooks/use-move-file";
import type { FileItem } from "../api/file.types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface MoveFileDialogProps {
  file: FileItem | null;
  onOpenChange: (open: boolean) => void;
}

export function MoveFileDialog({ file, onOpenChange }: MoveFileDialogProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const moveFile = useMoveFile();

  const { data: folders = [], isPending } = useQuery({
    queryKey: ["folders", "move-picker", file?.dataRoomId, currentFolderId],
    queryFn: () =>
      folderService.list({
        dataRoomId: file!.dataRoomId,
        ...(currentFolderId && { parentFolderId: currentFolderId }),
      }),
    enabled: Boolean(file),
  });

  const handleClose = (next: boolean) => {
    if (moveFile.isPending) return;
    onOpenChange(next);
    if (!next) setCurrentFolderId(null);
  };

  const isCurrentDestination = currentFolderId === (file?.folderId ?? null);

  return (
    <Dialog open={Boolean(file)} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move &ldquo;{file?.displayName}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {isPending ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : folders.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No subfolders here
            </p>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setCurrentFolderId(folder.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentFolderId(null)}
            disabled={currentFolderId === null || moveFile.isPending}
          >
            Back to root
          </Button>

          <Button
            type="button"
            disabled={!file || isCurrentDestination || moveFile.isPending}
            loading={moveFile.isPending}
            onClick={() => {
              if (!file || !currentFolderId) return;
              moveFile.mutate(
                { fileId: file.id, destinationFolderId: currentFolderId },
                { onSuccess: () => handleClose(false) },
              );
            }}
          >
            <FolderInput className="size-4" />
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
