import { Expose, Type } from "class-transformer";

class PublicFolderItemDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

class PublicFileItemDto {
  @Expose()
  id!: string;

  @Expose()
  displayName!: string;

  @Expose()
  sizeBytes!: number;

  @Expose()
  status!: string;
}

export class PublicContentsResponseDto {
  @Expose()
  @Type(() => PublicFolderItemDto)
  folders!: PublicFolderItemDto[];

  @Expose()
  @Type(() => PublicFileItemDto)
  files!: PublicFileItemDto[];
}
