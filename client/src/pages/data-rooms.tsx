import { Plus, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { DataRoomCard } from "@/features/data-room/ui/data-room-card";
import { CreateDataRoomDialog } from "@/features/data-room/ui/create-data-room-dialog";
import { RenameDataRoomDialog } from "@/features/data-room/ui/rename-data-room-dialog";
import { DeleteDataRoomDialog } from "@/features/data-room/ui/delete-data-room-dialog";
import { DataRoomsSkeleton } from "@/features/data-room/ui/data-rooms-skeleton";
import { DataRoomsEmptyState } from "@/features/data-room/ui/data-rooms-empty-state";
import { DataRoomsErrorState } from "@/features/data-room/ui/data-rooms-error-state";
import { useDataRooms } from "@/features/data-room/hooks/use-data-rooms";
import { useSharedDataRooms } from "@/features/data-room/hooks/use-shared-data-rooms";
import { Button } from "@/shared/ui/button/button";
import type { DataRoom } from "@/features/data-room/api/data-room.types";
import {
  ShareDialog,
  type ShareTarget,
} from "@/features/sharing/ui/share-dialog";

export function DataRooms() {
  const {
    data,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useDataRooms();

  const {
    data: sharedDataRooms = [],
    isPending: isSharedPending,
    isError: isSharedError,
  } = useSharedDataRooms();

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DataRoom | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataRoom | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  const dataRooms = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Data Rooms
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Securely store and share due diligence documents.
          </p>
        </div>

        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Data Room
        </Button>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          My Data Rooms
        </div>

        {isPending ? (
          <DataRoomsSkeleton />
        ) : isError ? (
          <DataRoomsErrorState onRetry={refetch} isRetrying={isFetching} />
        ) : dataRooms.length === 0 ? (
          <DataRoomsEmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dataRooms.map((dataRoom) => (
                <DataRoomCard
                  key={dataRoom.id}
                  dataRoom={dataRoom}
                  onRename={setRenameTarget}
                  onShare={(dr) =>
                    setShareTarget({
                      resourceType: "DATA_ROOM",
                      resourceId: dr.id,
                      resourceName: dr.name,
                    })
                  }
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {!isSharedPending && !isSharedError && sharedDataRooms.length > 0 && (
        <div className="mt-10">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Users className="size-4" aria-hidden="true" />
            Shared with you
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sharedDataRooms.map((dataRoom) => (
              <DataRoomCard key={dataRoom.id} dataRoom={dataRoom} />
            ))}
          </div>
        </div>
      )}

      <CreateDataRoomDialog open={isCreateOpen} onOpenChange={setCreateOpen} />

      <RenameDataRoomDialog
        dataRoom={renameTarget}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />

      <DeleteDataRoomDialog
        dataRoom={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />

      <ShareDialog
        target={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
    </div>
  );
}
