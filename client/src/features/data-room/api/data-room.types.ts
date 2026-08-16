export interface DataRoom {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
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
