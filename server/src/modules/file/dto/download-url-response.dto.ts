import { Expose } from "class-transformer";

export class DownloadUrlResponseDto {
  @Expose()
  downloadUrl!: string;
}
