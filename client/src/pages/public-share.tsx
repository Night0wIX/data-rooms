import { FileText, Download, Eye } from "lucide-react";
import { generatePath, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/button/button";
import { Skeleton } from "@/shared/ui/skeleton/skeleton";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { DataRoomContent } from "@/features/data-room/ui/data-room-content";
import { DataRoomContentSkeleton } from "@/features/data-room/ui/data-room-content-skeleton";
import {
  usePublicResource,
  usePublicContents,
  usePublicBreadcrumb,
} from "@/features/sharing/hooks/use-public-share";
import { sharingService } from "@/features/sharing/api/sharing.service";
import type { FileItem } from "@/features/file/api/file.types";
import { ROUTES } from "@/shared/constants/routes";

function buildPublicSharePath(token: string, folderId?: string) {
  const path = generatePath(ROUTES.publicShare, { token });
  return folderId ? `${path}?folderId=${folderId}` : path;
}

export function PublicShare() {
  const { token = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get("folderId") ?? undefined;

  const {
    data: resource,
    isPending: isResourcePending,
    isError: isResourceError,
  } = usePublicResource(token);

  const isBrowsable =
    resource?.resourceType === "FOLDER" ||
    resource?.resourceType === "DATA_ROOM";
  const currentFolderId = isBrowsable ? (folderId ?? resource?.id) : undefined;
  const isAtRoot = !folderId || folderId === resource?.id;

  const { data: contents, isPending: areContentsPending } = usePublicContents(
    token,
    isBrowsable ? currentFolderId : undefined,
    isBrowsable,
  );

  const { data: trail = [] } = usePublicBreadcrumb(
    token,
    isBrowsable && !isAtRoot ? currentFolderId : undefined,
  );

  const handleOpenFile = async (file: FileItem) => {
    const url = await sharingService.getPublicFileDownloadUrl(token, file.id);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadFile = async (file: FileItem) => {
    const url = await sharingService.getPublicFileDownloadUrl(token, file.id);
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
    if (!resource) return;
    if (id === resource.id) {
      setSearchParams({});
      return;
    }
    setSearchParams({ folderId: id });
  };

  if (isResourcePending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="space-y-3"
          role="status"
          aria-label="Loading shared content"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-56" />
        </div>
      </div>
    );
  }

  if (isResourceError || !resource) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold text-foreground">
          This link isn&apos;t available
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been revoked, or the link is incorrect.
        </p>
      </div>
    );
  }

  // Single shared file — no browsing, just view/download.
  if (resource.resourceType === "FILE") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4">
          <FileText className="size-8 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-medium text-foreground"
              title={resource.name}
            >
              {resource.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Shared file · read-only
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="View file"
              onClick={() =>
                handleOpenFile({
                  id: resource.id,
                  displayName: resource.name,
                } as FileItem)
              }
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Download file"
              onClick={() =>
                handleDownloadFile({
                  id: resource.id,
                  displayName: resource.name,
                } as FileItem)
              }
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { id: resource.id, label: resource.name },
    ...trail.map((item) => ({ id: item.id, label: item.name })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="min-w-0">
          <Breadcrumb
            items={breadcrumbItems}
            onNavigate={handleBreadcrumbNavigate}
          />
          <h1
            className="mt-3 truncate text-2xl font-bold tracking-tight text-foreground"
            title={resource.name}
          >
            {resource.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared with you · read-only
          </p>
        </div>

        {areContentsPending ? (
          <DataRoomContentSkeleton />
        ) : (
          <DataRoomContent
            dataRoomId=""
            folders={contents?.folders ?? []}
            files={contents?.files ?? []}
            readOnly
            getFolderHref={(folder) => buildPublicSharePath(token, folder.id)}
            onOpenFile={handleOpenFile}
            onDownloadFile={handleDownloadFile}
          />
        )}
      </div>
    </div>
  );
}
