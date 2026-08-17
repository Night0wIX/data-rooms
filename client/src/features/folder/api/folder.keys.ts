export const folderKeys = {
  all: ["folders"] as const,

  lists: () => [...folderKeys.all, "list"] as const,

  list: (params: { dataRoomId: string; parentFolderId?: string }) =>
    [...folderKeys.lists(), params] as const,

  breadcrumb: (folderId: string) =>
    [...folderKeys.all, "breadcrumb", folderId] as const,
};
