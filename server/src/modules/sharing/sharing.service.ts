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

@Injectable()
export class SharingService {
  constructor(
    private readonly sharingRepository: SharingRepository,
    private readonly databaseService: DatabaseService,
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

  private toResponseDto(share: unknown): ShareResponseDto {
    return plainToInstance(ShareResponseDto, share, { excludeExtraneousValues: true });
  }
}
