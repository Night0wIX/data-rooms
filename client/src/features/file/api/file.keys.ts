export const fileKeys = {
  all: ["files"] as const,

  lists: () => [...fileKeys.all, "list"] as const,

  list: (params: {
    dataRoomId: string;
    folderId?: string;
    searchByName?: string;
  }) => [...fileKeys.lists(), params] as const,
};
