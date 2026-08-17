import {
  Download,
  FileText,
  Folder,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataRoomContentRow } from "./data-room-content-row";
import { Button } from "@/shared/ui/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog/alert-dialog";
import { formatBytes } from "@/shared/utils/format-bytes";
import { folderService } from "@/features/folder/api/folder.service";
import type { Folder as FolderEntity } from "@/features/folder/api/folder.types";
import type { FileItem } from "@/features/file/api/file.types";

interface DataRoomContentProps {
  dataRoomId: string;
  folders: FolderEntity[];
  files: FileItem[];
  searchQuery?: string;
  readOnly?: boolean;
  getFolderHref?: (folder: FolderEntity) => string;
  onOpenFile?: (file: FileItem) => void;
  onDownloadFile?: (file: FileItem) => void;
  onRenameFolder?: (folder: FolderEntity) => void;
  onShareFolder?: (folder: FolderEntity) => void;
  onDeleteFolder?: (folder: FolderEntity) => void;
  onRenameFile?: (file: FileItem) => void;
  onMoveFile?: (file: FileItem) => void;
  onShareFile?: (file: FileItem) => void;
  onDeleteFile?: (file: FileItem) => void;
}

type PendingDelete =
  | { type: "folder"; item: FolderEntity }
  | { type: "file"; item: FileItem };

export function DataRoomContent({
  dataRoomId,
  folders,
  files,
  searchQuery,
  readOnly = false,
  getFolderHref,
  onOpenFile,
  onDownloadFile,
  onRenameFolder,
  onShareFolder,
  onDeleteFolder,
  onRenameFile,
  onMoveFile,
  onShareFile,
  onDeleteFile,
}: DataRoomContentProps) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const { data: deletionPreview, isPending: isPreviewPending } = useQuery({
    queryKey: ["folders", "deletion-preview", pendingDelete?.item.id],
    queryFn: () =>
      folderService.getDeletionPreview(
        (pendingDelete as { type: "folder"; item: FolderEntity }).item.id,
      ),
    enabled: pendingDelete?.type === "folder",
  });

  const isEmpty = folders.length === 0 && files.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : "This folder is empty"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery
            ? "Try a different name, or clear the search to see everything here."
            : readOnly
              ? "Nothing has been shared in here yet."
              : "Upload files or create a folder to get started."}
        </p>
      </div>
    );
  }

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "folder") onDeleteFolder?.(pendingDelete.item);
    else onDeleteFile?.(pendingDelete.item);
    setPendingDelete(null);
  };

  const renderDeleteDescription = () => {
    if (!pendingDelete) return null;

    if (pendingDelete.type === "file") {
      return "This permanently deletes the file. This can't be undone.";
    }

    if (isPreviewPending) {
      return "Checking what's inside this folder…";
    }

    if (!deletionPreview) {
      return "This permanently deletes the folder and everything inside it. This can't be undone.";
    }

    const { folderCount, fileCount } = deletionPreview;

    if (folderCount === 0 && fileCount === 0) {
      return "This folder is empty. Deleting it can't be undone.";
    }

    const parts: string[] = [];
    if (fileCount > 0) {
      parts.push(`${fileCount} file${fileCount === 1 ? "" : "s"}`);
    }
    if (folderCount > 0) {
      parts.push(`${folderCount} folder${folderCount === 1 ? "" : "s"}`);
    }

    return `This will permanently delete ${parts.join(" and ")} inside this folder. This can't be undone.`;
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Name
        </div>

        <div className="divide-y divide-border">
          {folders.map((folder) => (
            <DataRoomContentRow
              key={folder.id}
              icon={<Folder className="size-4 text-muted-foreground" />}
              name={folder.name}
              meta="Folder"
              linkTo={
                getFolderHref
                  ? getFolderHref(folder)
                  : `/data-rooms/${dataRoomId}/folders/${folder.id}`
              }
              actions={
                !readOnly && (
                  <RowActions
                    label={`Actions for ${folder.name}`}
                    items={[
                      onRenameFolder && {
                        label: "Rename",
                        icon: Pencil,
                        onSelect: () => onRenameFolder(folder),
                      },
                      onShareFolder && {
                        label: "Share",
                        icon: Share2,
                        onSelect: () => onShareFolder(folder),
                      },
                      onDeleteFolder && {
                        label: "Delete",
                        icon: Trash2,
                        destructive: true,
                        onSelect: () =>
                          setPendingDelete({ type: "folder", item: folder }),
                      },
                    ]}
                  />
                )
              }
            />
          ))}

          {files.map((file) => {
            const isReady = file.status === "READY";
            return (
              <DataRoomContentRow
                key={file.id}
                icon={<FileText className="size-4 text-muted-foreground" />}
                name={file.displayName}
                meta={isReady ? `PDF · ${formatBytes(file.sizeBytes)}` : "PDF"}
                disabled={!isReady}
                onClick={isReady ? () => onOpenFile?.(file) : undefined}
                status={
                  !isReady && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      Processing…
                    </span>
                  )
                }
                actions={
                  !readOnly &&
                  isReady && (
                    <RowActions
                      label={`Actions for ${file.displayName}`}
                      items={[
                        onDownloadFile && {
                          label: "Download",
                          icon: Download,
                          onSelect: () => onDownloadFile(file),
                        },
                        onRenameFile && {
                          label: "Rename",
                          icon: Pencil,
                          onSelect: () => onRenameFile(file),
                        },
                        onMoveFile && {
                          label: "Move",
                          icon: FolderInput,
                          onSelect: () => onMoveFile(file),
                        },
                        onShareFile && {
                          label: "Share",
                          icon: Share2,
                          onSelect: () => onShareFile(file),
                        },
                        onDeleteFile && {
                          label: "Delete",
                          icon: Trash2,
                          destructive: true,
                          onSelect: () =>
                            setPendingDelete({ type: "file", item: file }),
                        },
                      ]}
                    />
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;
              {pendingDelete?.type === "folder"
                ? pendingDelete.item.name
                : pendingDelete?.item.displayName}
              &rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {renderDeleteDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface RowAction {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
}

function RowActions({
  label,
  items,
}: {
  label: string;
  items: Array<RowAction | false | undefined>;
}) {
  const visible = items.filter((item): item is RowAction => Boolean(item));
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visible.map((item, index) => (
          <div key={item.label}>
            {item.destructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={item.onSelect}
              {...(item.destructive
                ? { className: "text-destructive focus:text-destructive" }
                : {})}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
