import { BaseApiService } from "@/shared/services/base-api.service";
import type {
  CreateDataRoomPayload,
  DataRoom,
  DataRoomListResponse,
  RenameDataRoomPayload,
} from "./data-room.types";

class DataRoomService extends BaseApiService {
  constructor() {
    super("/data-rooms");
  }

  async list(cursor?: string): Promise<DataRoomListResponse> {
    const { data } = await this.get<DataRoomListResponse>(
      this.url("/", undefined, cursor ? { cursor } : undefined),
    );

    return data;
  }

  async create(payload: CreateDataRoomPayload): Promise<DataRoom> {
    const { data } = await this.post<DataRoom>(this.url("/"), payload);

    return data;
  }

  async rename({ id, name }: RenameDataRoomPayload): Promise<DataRoom> {
    const { data } = await this.patch<DataRoom>(this.url("/:id", { id }), {
      name,
    });

    return data;
  }

  async remove(id: string): Promise<void> {
    await this.delete(this.url("/:id", { id }));
  }
}

export const dataRoomService = new DataRoomService();
