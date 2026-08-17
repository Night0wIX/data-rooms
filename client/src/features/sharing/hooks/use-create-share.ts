import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sharingService } from "../api/sharing.service";
import { shareKeys } from "../api/sharing.keys";
import type { CreateSharePayload } from "../api/sharing.types";

export function useCreateShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSharePayload) => sharingService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shareKeys.list(variables.resourceType, variables.resourceId),
      });
    },
  });
}
