import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/core/database/index.js";
import { randomBytes } from "node:crypto";
import { ShareResourceType, ShareRole } from "./access/access.types.js";
import { SHARE_TOKEN_BYTE_LENGTH } from "./sharing.constants.js";

@Injectable()
export class SharingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  createPublicShare(input: {
    resourceType: ShareResourceType;
    resourceId: string;
    role: ShareRole;
    createdById: string;
  }) {
    return this.databaseService.share.create({
      data: {
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        shareType: "PUBLIC",
        role: input.role,
        token: randomBytes(SHARE_TOKEN_BYTE_LENGTH).toString("hex"),
        createdById: input.createdById,
      },
    });
  }

  createUserShare(input: {
    resourceType: ShareResourceType;
    resourceId: string;
    role: ShareRole;
    sharedWithUserId: string;
    createdById: string;
  }) {
    return this.databaseService.share.upsert({
      where: {
        resourceType_resourceId_sharedWithUserId: {
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          sharedWithUserId: input.sharedWithUserId,
        },
      },
      create: {
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        shareType: "USER",
        role: input.role,
        sharedWithUserId: input.sharedWithUserId,
        createdById: input.createdById,
      },
      update: {
        role: input.role,
        revokedAt: null,
      },
    });
  }

  findShareById(shareId: string) {
    return this.databaseService.share.findUnique({ where: { id: shareId } });
  }

  findShareByToken(token: string) {
    return this.databaseService.share.findUnique({ where: { token } });
  }

  listSharesForResource(resourceType: ShareResourceType, resourceId: string) {
    return this.databaseService.share.findMany({
      where: { resourceType, resourceId, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  revokeShare(shareId: string) {
    return this.databaseService.share.update({
      where: { id: shareId },
      data: { revokedAt: new Date() },
    });
  }
}
