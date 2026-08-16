import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator.js";
import { Public } from "@/modules/auth/decorators/public.decorator.js";
import type { AuthenticatedUser } from "@/modules/auth/auth.types.js";
import { ROUTES } from "@/shared/constants/routes.js";
import { SharingService } from "./sharing.service.js";
import { ShareResourceType } from "./access/access.types.js";
import { ShareResponseDto } from "./dto/share-response.dto.js";
import { CreateShareDto } from "./dto/create-share.dto.js";
import { SharedResourceResponseDto } from "./dto/shared-resource-response.dto.js";

@Controller(ROUTES.share.root)
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post()
  createShare(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() createShareDto: CreateShareDto,
  ): Promise<ShareResponseDto> {
    return this.sharingService.createShare(authenticatedUser.id, createShareDto);
  }

  @Get()
  listShares(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query("resourceType") resourceType: ShareResourceType,
    @Query("resourceId") resourceId: string,
  ): Promise<ShareResponseDto[]> {
    return this.sharingService.listShares(authenticatedUser.id, resourceType, resourceId);
  }

  @Delete(ROUTES.share.byId)
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeShare(
    @Param("shareId") shareId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<void> {
    return this.sharingService.revokeShare(shareId, authenticatedUser.id);
  }

  @Public()
  @Get(ROUTES.share.byToken)
  resolveSharedResource(@Param("token") token: string): Promise<SharedResourceResponseDto> {
    return this.sharingService.resolveSharedResourceByToken(token);
  }
}
