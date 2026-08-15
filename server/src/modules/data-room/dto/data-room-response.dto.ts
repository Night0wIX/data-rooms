import { Expose } from "class-transformer";

export class DataRoomResponseDto {
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
}
