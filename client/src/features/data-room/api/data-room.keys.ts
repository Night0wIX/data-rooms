export const dataRoomKeys = {
  all: ["data-rooms"] as const,
  lists: () => [...dataRoomKeys.all, "list"] as const,
};
