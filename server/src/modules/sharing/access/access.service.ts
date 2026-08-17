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

  /**
   * Weaker check than assertCanView for DATA_ROOM: grants visibility of
   * data room *metadata* (name/description, e.g. for breadcrumbs) to
   * anyone who owns it OR has ANY active share resolving into it — even
   * a share scoped deep inside (a folder or file). This does NOT grant
   * access to the data room's root contents (root folders/files) —
   * those still go through assertCanView({ resourceType: DATA_ROOM }),
   * which requires a direct DATA_ROOM-level share (or ownership).
   */
  async assertDataRoomVisible(dataRoomId: string, userId: string): Promise<void> {
    const dataRoom = await this.databaseService.dataRoom.findUnique({
      where: { id: dataRoomId },
      select: { ownerId: true },
    });

    if (!dataRoom) {
      throw new NotFoundException("Resource not found");
    }

    if (dataRoom.ownerId === userId) {
      return;
    }

    const shares = await this.databaseService.share.findMany({
      where: { sharedWithUserId: userId, revokedAt: null },
      select: { resourceType: true, resourceId: true },
    });

    for (const share of shares) {
      const shareDataRoomId = await this.resolveDataRoomId(share.resourceType, share.resourceId);
      if (shareDataRoomId === dataRoomId) {
        return;
      }
    }

    throw new NotFoundException("Resource not found");
  }

  /**
   * Returns the caller's effective role for a resource: "OWNER" if they
   * own the data room, "EDITOR"/"VIEWER" if they have a matching active
   * share (checked the same way assertCanView/assertCanEdit do — via
   * resolveAncestorResourceIds), or null if they have no direct role at
   * this level.
   */
  async getUserRole(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<"OWNER" | "EDITOR" | "VIEWER" | null> {
    const dataRoomId = await this.resolveDataRoomId(resourceType, resourceId);
    if (!dataRoomId) return null;

    const dataRoom = await this.databaseService.dataRoom.findUnique({
      where: { id: dataRoomId },
      select: { ownerId: true },
    });
    if (!dataRoom) return null;

    if (dataRoom.ownerId === userId) return "OWNER";

    const ancestorResourceIds = await this.resolveAncestorResourceIds(
      resourceType,
      resourceId,
      dataRoomId,
    );

    const shares = await this.databaseService.share.findMany({
      where: {
        sharedWithUserId: userId,
        revokedAt: null,
        OR: ancestorResourceIds.map((ancestor) => ({
          resourceType: ancestor.resourceType,
          resourceId: ancestor.resourceId,
        })),
      },
      select: { role: true },
    });

    if (shares.length === 0) return null;

    return shares.some((share) => share.role === ShareRole.EDITOR) ? "EDITOR" : "VIEWER";
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
        SELECT id, "parentId" FROM folders WHERE id = ${startingFolderId}

        UNION ALL

        SELECT folder.id, folder."parentId"
        FROM folders folder
        INNER JOIN folder_ancestor ON folder.id = folder_ancestor."parentId"
      )
      SELECT id FROM folder_ancestor;
    `;

    for (const row of ancestorFolderRows) {
      ancestors.push({ resourceType: ShareResourceType.FOLDER, resourceId: row.id });
    }

    return ancestors;
  }

  async resolvePublicShare(
    token: string,
  ): Promise<{ resourceType: ShareResourceType; resourceId: string; role: ShareRole }> {
    const share = await this.databaseService.share.findFirst({
      where: { token, shareType: "PUBLIC", revokedAt: null },
      select: { resourceType: true, resourceId: true, role: true },
    });

    if (!share) {
      throw new NotFoundException("Link not found");
    }

    return share;
  }

  async getDataRoomIdForResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<string | null> {
    return this.resolveDataRoomId(resourceType, resourceId);
  }

  async assertPublicShareIncludes(
    token: string,
    targetResourceType: ShareResourceType,
    targetResourceId: string,
  ): Promise<void> {
    const share = await this.resolvePublicShare(token);
    const dataRoomId = await this.resolveDataRoomId(targetResourceType, targetResourceId);

    if (!dataRoomId) {
      throw new NotFoundException("Resource not found");
    }

    const ancestors = await this.resolveAncestorResourceIds(
      targetResourceType,
      targetResourceId,
      dataRoomId,
    );

    const included = ancestors.some(
      (ancestor) =>
        ancestor.resourceType === share.resourceType && ancestor.resourceId === share.resourceId,
    );

    if (!included) {
      throw new NotFoundException("Resource not found");
    }
  }

  async listAccessibleDataRoomIdsForUser(userId: string): Promise<string[]> {
    const shares = await this.databaseService.share.findMany({
      where: { sharedWithUserId: userId, revokedAt: null },
      select: { resourceType: true, resourceId: true },
    });

    const dataRoomIds = new Set<string>();

    for (const share of shares) {
      const dataRoomId = await this.resolveDataRoomId(share.resourceType, share.resourceId);
      if (dataRoomId) {
        dataRoomIds.add(dataRoomId);
      }
    }

    return Array.from(dataRoomIds);
  }

  async listAccessibleEntryPointsForUser(
    userId: string,
  ): Promise<Array<{ dataRoomId: string; resourceType: ShareResourceType; resourceId: string }>> {
    const shares = await this.databaseService.share.findMany({
      where: { sharedWithUserId: userId, revokedAt: null },
      select: { resourceType: true, resourceId: true },
    });

    const entries: Array<{
      dataRoomId: string;
      resourceType: ShareResourceType;
      resourceId: string;
    }> = [];

    for (const share of shares) {
      const dataRoomId = await this.resolveDataRoomId(share.resourceType, share.resourceId);
      if (dataRoomId) {
        entries.push({
          dataRoomId,
          resourceType: share.resourceType,
          resourceId: share.resourceId,
        });
      }
    }

    return entries;
  }
}
