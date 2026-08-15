import { IsUUID } from "class-validator";

export class MoveFileDto {
  @IsUUID()
  destinationFolderId!: string;
}
