export const API_PREFIX = "api/v1";

export const ROUTES = {
  users: {
    root: "users",
    currentUser: "me",
  },
  dataRoom: {
    root: "data-room",
    byId: ":dataRoomId",
  },
} as const;
