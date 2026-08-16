import { Expose, Type } from "class-transformer";
import { DataRoomResponseDto } from "./data-room-response.dto.js";

export class DataRoomListResponseDto {
  @Expose()
  @Type(() => DataRoomResponseDto)
  items: DataRoomResponseDto[];

  @Expose()
  nextCursor: string | null;
}