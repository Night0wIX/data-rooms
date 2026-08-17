import { BaseApiService } from "@/shared/services/base-api.service";
import type {
  CreateSharePayload,
  PublicBreadcrumbItem,
  PublicShareContents,
  PublicSharedResource,
  Share,
  ShareResourceType,
} from "./sharing.types";

class SharingService extends BaseApiService {
  constructor() {
    super("/share");
  }

  async create(payload: CreateSharePayload): Promise<Share> {
    const { data } = await this.post<Share>(this.url("/"), payload);
    return data;
  }

  async listForResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<Share[]> {
    const { data } = await this.get<Share[]>(
      this.url("/", undefined, { resourceType, resourceId }),
    );
    return data;
  }

  async revoke(shareId: string): Promise<void> {
    await this.delete<void>(this.url("/:shareId", { shareId }));
  }

  async getPublicContents(
    token: string,
    folderId?: string,
  ): Promise<PublicShareContents> {
    const { data } = await this.get<PublicShareContents>(
      this.url(
        "/public/:token/contents",
        { token },
        folderId ? { folderId } : undefined,
      ),
    );
    return data;
  }

  async getPublicResource(token: string): Promise<PublicSharedResource> {
    const { data } = await this.get<PublicSharedResource>(
      this.url("/public/:token", { token }),
    );
    return data;
  }

  async getPublicBreadcrumb(
    token: string,
    folderId: string,
  ): Promise<PublicBreadcrumbItem[]> {
    const { data } = await this.get<PublicBreadcrumbItem[]>(
      this.url("/public/:token/breadcrumb", { token }, { folderId }),
    );
    return data;
  }

  async getPublicFileDownloadUrl(
    token: string,
    fileId: string,
  ): Promise<string> {
    const { data } = await this.get<{ downloadUrl: string }>(
      this.url("/public/:token/files/:fileId/download-url", { token, fileId }),
    );
    return data.downloadUrl;
  }
}

export const sharingService = new SharingService();
