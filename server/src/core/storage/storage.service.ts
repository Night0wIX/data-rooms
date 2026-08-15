import { Injectable } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { env } from "@/core/config/env/index.js";
import { SIGNED_URL_EXPIRY_SECONDS, STORAGE_BUCKET_NAME } from "./storage.constants.js";

@Injectable()
export class FileStorageService {
  private readonly supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  buildStorageKey(input: { dataRoomId: string; folderId: string }): string {
    return `${input.dataRoomId}/${input.folderId}/${randomUUID()}`;
  }

  async createSignedUploadUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET_NAME)
      .createSignedUploadUrl(storageKey);

    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async createSignedDownloadUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET_NAME)
      .createSignedUrl(storageKey, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data) {
      throw new Error(`Failed to create signed download URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async confirmObjectExists(storageKey: string): Promise<boolean> {
    const lastSlashIndex = storageKey.lastIndexOf("/");
    const directoryPath = storageKey.slice(0, lastSlashIndex);
    const objectName = storageKey.slice(lastSlashIndex + 1);

    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET_NAME)
      .list(directoryPath, { search: objectName });

    if (error) {
      throw new Error(`Failed to verify uploaded object: ${error.message}`);
    }

    return (data ?? []).some((object) => object.name === objectName);
  }

  async deleteObject(storageKey: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET_NAME)
      .remove([storageKey]);

    if (error) {
      throw new Error(`Failed to delete storage object: ${error.message}`);
    }
  }
}
