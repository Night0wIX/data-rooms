import { FolderPlus, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/ui/button/button";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { useDataRoom } from "@/features/data-room/hooks/use-data-room";
import { useFolders } from "@/features/folder/hooks/use-folders";
import { useFiles } from "@/features/file/hooks/use-files";
import { fileService } from "@/features/file/api/file.service";
import { DataRoomSearch } from "@/features/data-room/ui/data-room-search";
import { DataRoomContent } from "@/features/data-room/ui/data-room-content";
import { DataRoomContentSkeleton } from "@/features/data-room/ui/data-room-content-skeleton";
import { CreateFolderDialog } from "@/features/folder/ui/create-folder-dialog";
import type { FileItem } from "@/features/file/api/file.types";
import { ROUTES } from "@/shared/constants/routes";
import {
  ShareDialog,
  type ShareTarget,
} from "@/features/sharing/ui/share-dialog";

const DATA_ROOMS_BREADCRUMB_ID = "data-rooms";

export function DataRoom() {
  const { dataRoomId = "" } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  const {
    data: dataRoom,
    isPending: isDataRoomPending,
    isError: isDataRoomError,
  } = useDataRoom(dataRoomId);

  const {
    data: folders = [],
    isPending: areFoldersPending,
    refetch: refetchFolders,
  } = useFolders({ dataRoomId });

  const { data: files = [], isPending: areFilesPending } = useFiles({
    dataRoomId,
    ...(search && { searchByName: search }),
  });

  const handleOpenFile = async (file: FileItem) => {
    const url = await fileService.getDownloadUrl(file.id);
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
    if (id === DATA_ROOMS_BREADCRUMB_ID) navigate(ROUTES.dataRooms);
  };

  const isContentPending = areFoldersPending || areFilesPending;

  if (isDataRoomPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3" role="status" aria-label="Loading Data Room">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (isDataRoomError || !dataRoom) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold text-foreground">
          Data Room not found
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          This Data Room may have been deleted, or you don&apos;t have access to
          it.
        </p>

        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Back to Data Rooms</Link>
        </Button>
      </div>
    );
  }

  const isReadOnly = dataRoom.role === "VIEWER";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Breadcrumb
              items={[
                { id: DATA_ROOMS_BREADCRUMB_ID, label: "Data Rooms" },
                { id: dataRoomId, label: dataRoom.name },
              ]}
              onNavigate={handleBreadcrumbNavigate}
            />

            <h1
              className="mt-3 truncate text-2xl font-bold tracking-tight text-foreground"
              title={dataRoom.name}
            >
              {dataRoom.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">Data Room root</p>
          </div>

          {!isReadOnly && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShareTarget({
                    resourceType: "DATA_ROOM",
                    resourceId: dataRoomId,
                    resourceName: dataRoom.name,
                  })
                }
              >
                <Share2 className="size-4" />
                Share Data Room
              </Button>

              <CreateFolderDialog
                dataRoomId={dataRoomId}
                parentFolderId={null}
                existingNames={folders.map((folder) => folder.name)}
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

        <p className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Files are uploaded inside folders. Open or create a folder to upload a
          file.
        </p>

        {isContentPending ? (
          <DataRoomContentSkeleton />
        ) : (
          <DataRoomContent
            dataRoomId={dataRoomId}
            folders={folders}
            files={files}
            searchQuery={search}
            readOnly={isReadOnly}
            onOpenFile={handleOpenFile}
            onDownloadFile={handleDownloadFile}
            onShareFolder={(folder) =>
              setShareTarget({
                resourceType: "FOLDER",
                resourceId: folder.id,
                resourceName: folder.name,
              })
            }
            onShareFile={(file) =>
              setShareTarget({
                resourceType: "FILE",
                resourceId: file.id,
                resourceName: file.displayName,
              })
            }
          />
        )}
      </div>
      <ShareDialog
        target={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
    </div>
  );
}
