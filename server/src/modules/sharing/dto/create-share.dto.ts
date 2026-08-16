import { IsEmail, IsEnum, IsIn, IsOptional, IsUUID, ValidateIf } from "class-validator";
import { ShareResourceType, ShareRole } from "../access/access.types.js";

export class CreateShareDto {
  @IsEnum(ShareResourceType)
  resourceType!: ShareResourceType;

  @IsUUID()
  resourceId!: string;

  @IsIn(["PUBLIC", "USER"])
  shareType!: "PUBLIC" | "USER";

  @IsOptional()
  @IsEnum(ShareRole)
  role?: ShareRole;

  @ValidateIf((dto: CreateShareDto) => dto.shareType === "USER")
  @IsEmail()
  sharedWithUserEmail?: string;
}
