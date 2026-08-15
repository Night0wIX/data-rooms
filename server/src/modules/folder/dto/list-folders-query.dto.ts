import { IsOptional, IsUUID } from "class-validator";

export class ListFoldersQueryDto {
  @IsUUID()
  dataRoomId!: string;

  @IsOptional()
  @IsUUID()
  parentFolderId?: string;
}
