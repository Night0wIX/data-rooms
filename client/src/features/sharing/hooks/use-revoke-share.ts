import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sharingService } from "../api/sharing.service";
import { shareKeys } from "../api/sharing.keys";
import type { ShareResourceType } from "../api/sharing.types";

interface RevokeShareInput {
  shareId: string;
  resourceType: ShareResourceType;
  resourceId: string;
}

export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shareId }: RevokeShareInput) =>
      sharingService.revoke(shareId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shareKeys.list(variables.resourceType, variables.resourceId),
      });
    },
  });
}
