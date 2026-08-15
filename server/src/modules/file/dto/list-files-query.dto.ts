import { IsOptional, IsString, IsUUID } from "class-validator";

export class ListFilesQueryDto {
  @IsUUID()
  dataRoomId!: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @IsString()
  searchByName?: string;
}
