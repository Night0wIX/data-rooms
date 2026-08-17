import type { QueryParams } from "@/shared/types";

export interface FileItem {
  id: string;
  folderId: string;
  dataRoomId: string;
  displayName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListFilesParams extends QueryParams {
  dataRoomId: string;
  folderId?: string;
  searchByName?: string;
}
