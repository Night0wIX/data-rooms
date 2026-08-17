import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DatabaseService } from "@/core/database/index.js";
import { SharingRepository } from "./sharing.repository.js";
import { ShareResourceType, ShareRole } from "./access/access.types.js";
import { CreateShareDto } from "./dto/create-share.dto.js";
import { ShareResponseDto } from "./dto/share-response.dto.js";
import { SharedResourceResponseDto } from "./dto/shared-resource-response.dto.js";
import { AccessService } from "./access/access.service.js";
import { DownloadUrlResponseDto } from "../file/dto/download-url-response.dto.js";
import { FileStorageService } from "@/core/storage/storage.service.js";

@Injectable()
export class SharingService {
  constructor(
    private readonly sharingRepository: SharingRepository,
    private readonly databaseService: DatabaseService,
    private readonly accessService: AccessService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createShare(
    requestingUserId: string,
    createShareDto: CreateShareDto,
  ): Promise<ShareResponseDto> {
    await this.assertUserOwnsDataRoomOfResource(
      createShareDto.resourceType,
      createShareDto.resourceId,
      requestingUserId,
    );

    const role = createShareDto.role ?? ShareRole.VIEWER;

    if (createShareDto.shareType === "PUBLIC") {
      const share = await this.sharingRepository.createPublicShare({
        resourceType: createShareDto.resourceType,
        resourceId: createShareDto.resourceId,
        role,
        createdById: requestingUserId,
      });

      return this.toResponseDto(share);
    }

    if (!createShareDto.sharedWithUserEmail) {
      throw new BadRequestException("sharedWithUserEmail is required for user shares");
    }

    const sharedWithUser = await this.databaseService.user.findUnique({
      where: { email: createShareDto.sharedWithUserEmail },
    });

    if (!sharedWithUser) {
      throw new NotFoundException("No user found with this email");
    }

    const share = await this.sharingRepository.createUserShare({
      resourceType: createShareDto.resourceType,
      resourceId: createShareDto.resourceId,
      role,
      sharedWithUserId: sharedWithUser.id,
      createdById: requestingUserId,
    });

    return this.toResponseDto(share);
  }

  async listShares(
    requestingUserId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareResponseDto[]> {
    await this.assertUserOwnsDataRoomOfResource(resourceType, resourceId, requestingUserId);

    const shares = await this.sharingRepository.listSharesForResource(resourceType, resourceId);

    return shares.map((share) => this.toResponseDto(share));
  }

  async revokeShare(shareId: string, requestingUserId: string): Promise<void> {
    const share = await this.sharingRepository.findShareById(shareId);

    if (!share) {
      throw new NotFoundException("Share not found");
    }

    await this.assertUserOwnsDataRoomOfResource(
      share.resourceType,
      share.resourceId,
      requestingUserId,
    );

    await this.sharingRepository.revokeShare(shareId);
  }

  async resolveSharedResourceByToken(token: string): Promise<SharedResourceResponseDto> {
    const share = await this.sharingRepository.findShareByToken(token);

    if (!share || share.revokedAt) {
      throw new NotFoundException("Share link not found or has been revoked");
    }

    const resource = await this.fetchResourceName(share.resourceType, share.resourceId);

    if (!resource) {
      throw new NotFoundException("Shared resource not found");
    }

    return plainToInstance(
      SharedResourceResponseDto,
      {
        resourceType: share.resourceType,
        id: share.resourceId,
        name: resource.name,
        role: share.role,
      },
      { excludeExtraneousValues: true },
    );
  }

  private async fetchResourceName(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<{ name: string } | null> {
    if (resourceType === ShareResourceType.DATA_ROOM) {
      return this.databaseService.dataRoom.findUnique({
        where: { id: resourceId },
        select: { name: true },
      });
    }

    if (resourceType === ShareResourceType.FOLDER) {
      return this.databaseService.folder.findUnique({
        where: { id: resourceId },
        select: { name: true },
      });
    }

    const file = await this.databaseService.file.findUnique({
      where: { id: resourceId },
      select: { displayName: true },
    });

    return file ? { name: file.displayName } : null;
  }

  private async assertUserOwnsDataRoomOfResource(
    resourceType: ShareResourceType,
    resourceId: string,
    requestingUserId: string,
  ): Promise<void> {
    const dataRoomId =
      resourceType === ShareResourceType.DATA_ROOM
        ? resourceId
        : resourceType === ShareResourceType.FOLDER
          ? (
              await this.databaseService.folder.findUnique({
                where: { id: resourceId },
                select: { dataRoomId: true },
              })
            )?.dataRoomId
          : (
              await this.databaseService.file.findUnique({
                where: { id: resourceId },
                select: { dataRoomId: true },
              })
            )?.dataRoomId;

    if (!dataRoomId) {
      throw new NotFoundException("Resource not found");
    }

    const dataRoom = await this.databaseService.dataRoom.findUnique({
      where: { id: dataRoomId },
      select: { ownerId: true },
    });

    if (!dataRoom || dataRoom.ownerId !== requestingUserId) {
      throw new ForbiddenException("Only the data room owner can manage sharing");
    }

    return;
  }

  private toResponseDto(share: any): ShareResponseDto {
    return plainToInstance(
      ShareResponseDto,
      {
        ...share,
        sharedWithUserEmail: share.sharedWithUser?.email ?? null,
      },
      { excludeExtraneousValues: true },
    );
  }

  async getPublicContents(
    token: string,
    folderId?: string,
  ): Promise<{
    folders: Array<{ id: string; name: string }>;
    files: Array<{ id: string; displayName: string; sizeBytes: number; status: string }>;
  }> {
    const share = await this.accessService.resolvePublicShare(token);

    if (share.resourceType === ShareResourceType.FILE) {
      throw new NotFoundException("Resource has no contents");
    }

    const dataRoomId = await this.accessService.getDataRoomIdForResource(
      share.resourceType,
      share.resourceId,
    );
    if (!dataRoomId) {
      throw new NotFoundException("Resource not found");
    }

    const targetFolderId =
      folderId ?? (share.resourceType === ShareResourceType.FOLDER ? share.resourceId : null);

    if (targetFolderId) {
      await this.accessService.assertPublicShareIncludes(
        token,
        ShareResourceType.FOLDER,
        targetFolderId,
      );
    }

    const folders = await this.databaseService.folder.findMany({
      where: { dataRoomId, parentId: targetFolderId },
      orderBy: { name: "asc" },
    });

    const files = targetFolderId
      ? await this.databaseService.file.findMany({
          // status filter matters: an anonymous viewer must never see a PENDING
          // (not-yet-confirmed) upload — only READY files are real contents.
          where: { dataRoomId, folderId: targetFolderId, status: "READY" },
          orderBy: { displayName: "asc" },
        })
      : [];

    return {
      folders: folders.map((folder) => ({ id: folder.id, name: folder.name })),
      files: files.map((file) => ({
        id: file.id,
        displayName: file.displayName,
        sizeBytes: file.sizeBytes,
        status: file.status,
      })),
    };
  }

  async getPublicBreadcrumb(
    token: string,
    folderId: string,
  ): Promise<Array<{ id: string; name: string }>> {
    const share = await this.accessService.resolvePublicShare(token);
    await this.accessService.assertPublicShareIncludes(token, ShareResourceType.FOLDER, folderId);

    const rows = await this.databaseService.$queryRaw<
      Array<{ id: string; name: string; parentId: string | null }>
    >`
      WITH RECURSIVE folder_ancestor AS (
        SELECT id, name, "parentId" FROM folders WHERE id = ${folderId}
        UNION ALL
        SELECT folder.id, folder.name, folder."parentId"
        FROM folders folder
        INNER JOIN folder_ancestor ON folder.id = folder_ancestor."parentId"
      )
      SELECT id, name, "parentId" FROM folder_ancestor;
    `;

    const rootFolderId = share.resourceType === ShareResourceType.FOLDER ? share.resourceId : null;
    const trail = rows.reverse();
    // Cut the trail at the shared root so folders above it (outside the
    // grant) never leak into the response.
    const cutIndex = rootFolderId ? trail.findIndex((row) => row.id === rootFolderId) : -1;
    const sliced = cutIndex >= 0 ? trail.slice(cutIndex + 1) : trail;

    return sliced.map((row) => ({ id: row.id, name: row.name }));
  }

  async getPublicFileDownloadUrl(token: string, fileId: string): Promise<DownloadUrlResponseDto> {
    await this.accessService.assertPublicShareIncludes(token, ShareResourceType.FILE, fileId);

    const file = await this.databaseService.file.findUnique({
      where: { id: fileId },
      select: { storageKey: true, status: true },
    });

    if (!file || file.status !== "READY") {
      throw new NotFoundException("File not found");
    }

    const downloadUrl = await this.fileStorageService.createSignedDownloadUrl(file.storageKey);

    return plainToInstance(
      DownloadUrlResponseDto,
      { downloadUrl },
      { excludeExtraneousValues: true },
    );
  }
}
