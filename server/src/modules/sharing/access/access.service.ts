import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@/core/database/index.js";
import { ShareResourceType, ShareRole, type AccessCheckInput } from "./access.types.js";

@Injectable()
export class AccessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async assertCanView(input: AccessCheckInput): Promise<void> {
    const canView = await this.canAccess({ ...input, requiredRole: ShareRole.VIEWER });

    if (!canView) {
      throw new NotFoundException("Resource not found");
    }
  }

  async assertCanEdit(input: AccessCheckInput): Promise<void> {
    const canEdit = await this.canAccess({ ...input, requiredRole: ShareRole.EDITOR });

    if (!canEdit) {
      throw new NotFoundException("Resource not found");
    }
  }

  private async canAccess(input: AccessCheckInput & { requiredRole: ShareRole }): Promise<boolean> {
    const dataRoomId = await this.resolveDataRoomId(input.resourceType, input.resourceId);

    if (!dataRoomId) {
      return false;
    }

    const dataRoom = await this.databaseService.dataRoom.findUnique({
      where: { id: dataRoomId },
      select: { ownerId: true },
    });

    if (!dataRoom) {
      return false;
    }

    if (dataRoom.ownerId === input.userId) {
      return true;
    }

    const ancestorResourceIds = await this.resolveAncestorResourceIds(
      input.resourceType,
      input.resourceId,
      dataRoomId,
    );

    const matchingShare = await this.databaseService.share.findFirst({
      where: {
        sharedWithUserId: input.userId,
        revokedAt: null,
        ...(input.requiredRole === ShareRole.EDITOR ? { role: ShareRole.EDITOR } : {}),
        OR: ancestorResourceIds.map((ancestor) => ({
          resourceType: ancestor.resourceType,
          resourceId: ancestor.resourceId,
        })),
      },
    });

    return matchingShare !== null;
  }

  private async resolveDataRoomId(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<string | null> {
    if (resourceType === ShareResourceType.DATA_ROOM) {
      return resourceId;
    }

    if (resourceType === ShareResourceType.FOLDER) {
      const folder = await this.databaseService.folder.findUnique({
        where: { id: resourceId },
        select: { dataRoomId: true },
      });
      return folder?.dataRoomId ?? null;
    }

    const file = await this.databaseService.file.findUnique({
      where: { id: resourceId },
      select: { dataRoomId: true },
    });
    return file?.dataRoomId ?? null;
  }

  private async resolveAncestorResourceIds(
    resourceType: ShareResourceType,
    resourceId: string,
    dataRoomId: string,
  ): Promise<Array<{ resourceType: ShareResourceType; resourceId: string }>> {
    const ancestors: Array<{ resourceType: ShareResourceType; resourceId: string }> = [
      { resourceType, resourceId },
      { resourceType: ShareResourceType.DATA_ROOM, resourceId: dataRoomId },
    ];

    if (resourceType === ShareResourceType.DATA_ROOM) {
      return ancestors;
    }

    const startingFolderId =
      resourceType === ShareResourceType.FOLDER
        ? resourceId
        : (
            await this.databaseService.file.findUnique({
              where: { id: resourceId },
              select: { folderId: true },
            })
          )?.folderId;

    if (!startingFolderId) {
      return ancestors;
    }

    const ancestorFolderRows = await this.databaseService.$queryRaw<Array<{ id: string }>>`
      WITH RECURSIVE folder_ancestor AS (
        SELECT id, parent_id FROM folders WHERE id = ${startingFolderId}::uuid

        UNION ALL

        SELECT folder.id, folder.parent_id
        FROM folders folder
        INNER JOIN folder_ancestor ON folder.id = folder_ancestor.parent_id
      )
      SELECT id FROM folder_ancestor;
    `;

    for (const row of ancestorFolderRows) {
      ancestors.push({ resourceType: ShareResourceType.FOLDER, resourceId: row.id });
    }

    return ancestors;
  }
}
