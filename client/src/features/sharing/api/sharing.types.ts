import type { FileItem } from "@/features/file/api/file.types";
import type { Folder } from "@/features/folder/api/folder.types";

export type ShareResourceType = "DATA_ROOM" | "FOLDER" | "FILE";
export type ShareRole = "VIEWER" | "EDITOR";
export type ShareKind = "PUBLIC" | "USER";

export interface Share {
  id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  shareType: ShareKind;
  role: ShareRole;
  sharedWithUserId: string | null;
  sharedWithUserEmail: string | null;
  token: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreateSharePayload {
  resourceType: ShareResourceType;
  resourceId: string;
  shareType: ShareKind;
  role?: ShareRole;
  sharedWithUserEmail?: string;
}

export interface PublicSharedResource {
  resourceType: ShareResourceType;
  id: string;
  name: string;
  role: ShareRole;
}

export interface PublicShareContents {
  folders: Folder[];
  files: FileItem[];
}

export interface PublicBreadcrumbItem {
  id: string;
  name: string;
}
