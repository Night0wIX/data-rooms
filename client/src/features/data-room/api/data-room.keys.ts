export const dataRoomKeys = {
  all: ["data-rooms"] as const,
  lists: () => [...dataRoomKeys.all, "list"] as const,
  shared: () => [...dataRoomKeys.all, "shared"] as const,
  detail: (id: string) => [...dataRoomKeys.all, "detail", id] as const,
};
