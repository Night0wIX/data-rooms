import { Expose } from "class-transformer";

export class FolderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  dataRoomId!: string;

  @Expose()
  parentFolderId!: string | null;

  @Expose()
  name!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
