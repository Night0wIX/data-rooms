import type { ResourceRole } from "@/features/data-room/api/data-room.types";
import type { QueryParams } from "@/shared/types";

export interface Folder {
  id: string;
  dataRoomId: string;
  parentFolderId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: ResourceRole;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface ListFoldersParams extends QueryParams {
  dataRoomId: string;
  parentFolderId?: string;
}
