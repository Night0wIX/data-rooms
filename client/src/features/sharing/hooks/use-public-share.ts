import { useQuery } from "@tanstack/react-query";
import { sharingService } from "../api/sharing.service";

export function usePublicResource(token: string) {
  return useQuery({
    queryKey: ["public-share", token],
    queryFn: () => sharingService.getPublicResource(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function usePublicContents(
  token: string,
  folderId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["public-share", token, "contents", folderId ?? "root"],
    queryFn: () => sharingService.getPublicContents(token, folderId),
    enabled: Boolean(token) && enabled,
  });
}

export function usePublicBreadcrumb(token: string, folderId?: string) {
  return useQuery({
    queryKey: ["public-share", token, "breadcrumb", folderId ?? "root"],
    queryFn: () =>
      sharingService.getPublicBreadcrumb(token, folderId as string),
    enabled: Boolean(token && folderId),
  });
}
