export type ResourceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface DataRoom {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  role: ResourceRole;
}

export interface SharedDataRoom extends DataRoom {
  entryResourceType: "DATA_ROOM" | "FOLDER";
  entryResourceId: string;
}

export interface CreateDataRoomPayload {
  name: string;
  description?: string;
}

export interface RenameDataRoomPayload {
  id: string;
  name: string;
}

export interface DataRoomListResponse {
  items: DataRoom[];
  nextCursor: string | null;
}
