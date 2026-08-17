import { useQuery } from "@tanstack/react-query";
import { sharingService } from "../api/sharing.service";
import { shareKeys } from "../api/sharing.keys";
import type { ShareResourceType } from "../api/sharing.types";

export function useShares(resourceType: ShareResourceType, resourceId: string) {
  return useQuery({
    queryKey: shareKeys.list(resourceType, resourceId),
    queryFn: () => sharingService.listForResource(resourceType, resourceId),
    enabled: Boolean(resourceId),
  });
}
