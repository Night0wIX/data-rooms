import { Expose } from "class-transformer";

export class FileResponseDto {
  @Expose()
  id!: string;

  @Expose()
  folderId!: string;

  @Expose()
  dataRoomId!: string;

  @Expose()
  displayName!: string;

  @Expose()
  mimeType!: string;

  @Expose()
  sizeBytes!: number;

  @Expose()
  status!: string;

  @Expose()
  uploadedById!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
