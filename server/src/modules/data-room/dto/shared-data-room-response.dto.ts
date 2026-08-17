import { Expose } from "class-transformer";

export class SharedDataRoomResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  ownerId!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  entryResourceType!: "DATA_ROOM" | "FOLDER";

  @Expose()
  entryResourceId!: string;
}
