import { IsIn, IsInt, IsPositive, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ALLOWED_FILE_MIME_TYPE } from "../file.constants.js";

export class InitFileUploadDto {
  @IsUUID()
  folderId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  displayName!: string;

  @IsIn(ALLOWED_FILE_MIME_TYPE)
  mimeType!: string;

  @IsInt()
  @IsPositive()
  sizeBytes!: number;
}
