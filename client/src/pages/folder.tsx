import { FolderPlus, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/ui/button/button";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { useDataRoom } from "@/features/data-room/hooks/use-data-room";
import { useFolder } from "@/features/folder/hooks/use-folder";
import { useFolderBreadcrumb } from "@/features/folder/hooks/use-folder-breadcrumb";
import { useFolders } from "@/features/folder/hooks/use-folders";
import { useDeleteFolder } from "@/features/folder/hooks/use-delete-folder";
import { useFiles } from "@/features/file/hooks/use-files";
import { useUploadFile } from "@/features/file/hooks/use-upload-file";
import { useDeleteFile } from "@/features/file/hooks/use-delete-file";
import { fileService } from "@/features/file/api/file.service";
import { DataRoomSearch } from "@/features/data-room/ui/data-room-search";
import { DataRoomUploadZone } from "@/features/data-room/ui/data-room-upload-zone";
import { DataRoomContent } from "@/features/data-room/ui/data-room-content";
import { DataRoomContentSkeleton } from "@/features/data-room/ui/data-room-content-skeleton";
import { CreateFolderDialog } from "@/features/folder/ui/create-folder-dialog";
import { RenameFolderDialog } from "@/features/folder/ui/rename-folder-dialog";
import { RenameFileDialog } from "@/features/file/ui/rename-file-dialog";
import { MoveFileDialog } from "@/features/file/ui/move-file-dialog";
import type { FileItem } from "@/features/file/api/file.types";
import type { Folder } from "@/features/folder/api/folder.types";
import {
  ShareDialog,
  type ShareTarget,
} from "@/features/sharing/ui/share-dialog";
import { FilePreviewDialog } from "@/features/file/ui/file-preview-dialog";

const DATA_ROOMS_BREADCRUMB_ID = "data-rooms";

// TODO: verify against actual routes.ts — assumed nested path pattern
function buildDataRoomPath(dataRoomId: string) {
  return `/data-rooms/${dataRoomId}`;
}
function buildFolderPath(dataRoomId: string, folderId: string) {
  return `/data-rooms/${dataRoomId}/folders/${folderId}`;
}

export function Folder() {
  const { dataRoomId = "", folderId = "" } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [movingFile, setMovingFile] = useState<FileItem | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);
  const { data: dataRoom, isPending: isDataRoomPending } =
    useDataRoom(dataRoomId);

  const {
    data: folder,
    isPending: isFolderPending,
    isError: isFolderError,
  } = useFolder(folderId);

  const { data: breadcrumbTrail = [] } = useFolderBreadcrumb(folderId);

  const {
    data: subfolders = [],
    isPending: areFoldersPending,
    refetch: refetchFolders,
  } = useFolders({ dataRoomId, parentFolderId: folderId });

  const {
    data: rawFiles = [],
    isPending: areFilesPending,
    refetch: refetchFiles,
  } = useFiles({
    dataRoomId,
    folderId,
    ...(search && { searchByName: search }),
  });

  const files = search
    ? rawFiles
    : rawFiles.filter((file) => file.folderId === folderId);

  const displayedSubfolders = search ? [] : subfolders;

  const uploadFile = useUploadFile(folderId);
  const deleteFile = useDeleteFile();
  const deleteFolder = useDeleteFolder();

  const handleOpenFile = (file: FileItem) => setPreviewingFile(file);

  const handleDownloadFile = async (file: FileItem) => {
    const url = await fileService.getDownloadUrl(file.id);
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = file.displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleBreadcrumbNavigate = (id: string) => {
    if (id === DATA_ROOMS_BREADCRUMB_ID) {
      navigate("/");
      return;
    }
    if (id === dataRoomId) {
      navigate(buildDataRoomPath(dataRoomId));
      return;
    }
    navigate(buildFolderPath(dataRoomId, id));
  };

  const isContentPending = areFoldersPending || areFilesPending;
  const isHeaderPending = isDataRoomPending || isFolderPending;

  if (isHeaderPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3" role="status" aria-label="Loading folder">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-48" />
        </div>
      </div>
    );
  }

  if (isFolderError || !dataRoom || !folder) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold text-foreground">
          Folder not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This folder may have been deleted, or you don&apos;t have access to
          it.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to={buildDataRoomPath(dataRoomId)}>Back to Data Room</Link>
        </Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { id: DATA_ROOMS_BREADCRUMB_ID, label: "Data Rooms" },
    { id: dataRoomId, label: dataRoom.name },
    ...breadcrumbTrail.map((item) => ({ id: item.id, label: item.name })),
  ];

  const isReadOnly = folder.role === "VIEWER";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Breadcrumb
              items={breadcrumbItems}
              onNavigate={handleBreadcrumbNavigate}
            />

            <h1
              className="mt-3 truncate text-2xl font-bold tracking-tight text-foreground"
              title={folder.name}
            >
              {folder.name}
            </h1>
          </div>

          {!isReadOnly && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShareTarget({
                    resourceType: "FOLDER",
                    resourceId: folderId,
                    resourceName: folder.name,
                  })
                }
              >
                <Share2 className="size-4" />
                Share folder
              </Button>

              <CreateFolderDialog
                dataRoomId={dataRoomId}
                parentFolderId={folderId}
                existingNames={subfolders.map((subfolder) => subfolder.name)}
                onCreated={() => refetchFolders()}
                trigger={
                  <Button type="button">
                    <FolderPlus className="size-4" />
                    New folder
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <DataRoomSearch value={search} onChange={setSearch} />

        {!isReadOnly && (
          <DataRoomUploadZone
            onUpload={uploadFile}
            existingNames={files.map((file) => file.displayName)}
            onUploaded={() => refetchFiles()}
          />
        )}

        {isContentPending ? (
          <DataRoomContentSkeleton />
        ) : (
          <DataRoomContent
            dataRoomId={dataRoomId}
            folders={displayedSubfolders}
            files={files}
            searchQuery={search}
            readOnly={isReadOnly}
            onOpenFile={handleOpenFile}
            onDownloadFile={handleDownloadFile}
            onRenameFolder={setRenamingFolder}
            onDeleteFolder={(target) => deleteFolder.mutate(target.id)}
            onRenameFile={setRenamingFile}
            onMoveFile={setMovingFile}
            onDeleteFile={(file) => deleteFile.mutate(file.id)}
            onShareFolder={(f) =>
              setShareTarget({
                resourceType: "FOLDER",
                resourceId: f.id,
                resourceName: f.name,
              })
            }
            onShareFile={(f) =>
              setShareTarget({
                resourceType: "FILE",
                resourceId: f.id,
                resourceName: f.displayName,
              })
            }
          />
        )}
      </div>

      <RenameFolderDialog
        folder={renamingFolder}
        existingNames={subfolders.map((f) => f.name)}
        onOpenChange={(open) => !open && setRenamingFolder(null)}
      />
      <RenameFileDialog
        file={renamingFile}
        existingNames={files.map((f) => f.displayName)}
        onOpenChange={(open) => !open && setRenamingFile(null)}
      />
      <MoveFileDialog
        file={movingFile}
        onOpenChange={(open) => !open && setMovingFile(null)}
      />
      <ShareDialog
        target={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
      <FilePreviewDialog
        file={previewingFile}
        getUrl={(fileId) => fileService.getDownloadUrl(fileId)}
        onOpenChange={(open) => !open && setPreviewingFile(null)}
      />
    </div>
  );
}
