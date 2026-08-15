import { Expose } from "class-transformer";

export class InitFileUploadResponseDto {
  @Expose()
  fileId!: string;

  @Expose()
  uploadUrl!: string;

  @Expose()
  storageKey!: string;
}
