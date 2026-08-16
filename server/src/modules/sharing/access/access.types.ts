import { ShareResourceType, ShareRole } from "@/generated/prisma/client.js";

export { ShareResourceType, ShareRole };

export type AccessCheckInput = {
  userId: string;
  resourceType: ShareResourceType;
  resourceId: string;
};

export type ResolvedResourceAncestry = {
  dataRoomId: string;
  folderId: string | null;
};
