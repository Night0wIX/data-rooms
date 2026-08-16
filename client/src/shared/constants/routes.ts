export const ROUTES = {
  login: "/login",
  signUp: "/sign-up",
  dataRooms: "/",
  dataRoom: "/data-rooms/:dataRoomId",
  folder: "/data-rooms/:dataRoomId/folders/:folderId",
  publicShare: "/shares/:token",
  unauthorized: "/403",
  notFound: "*",
} as const;
