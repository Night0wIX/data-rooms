import { Expose } from "class-transformer";
import { ShareResourceType, ShareRole } from "../access/access.types.js";

export class ShareResponseDto {
  @Expose()
  id!: string;

  @Expose()
  resourceType!: ShareResourceType;

  @Expose()
  resourceId!: string;

  @Expose()
  shareType!: "PUBLIC" | "USER";

  @Expose()
  role!: ShareRole;

  @Expose()
  sharedWithUserId!: string | null;

  @Expose()
  token!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  revokedAt!: Date | null;

  @Expose()
  sharedWithUserEmail!: string | null;
}
