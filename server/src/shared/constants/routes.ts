export const API_PREFIX = "api/v1";

export const ROUTES = {
  users: {
    root: "users",
    currentUser: "me",
  },
  dataRooms: {
    root: "data-rooms",
    byId: ":dataRoomId",
  },
  folders: {
    root: "folders",
    byId: ":folderId",
    children: ":folderId/children",
    breadcrumb: ":folderId/breadcrumb",
  },
  files: {
    root: "files",
    byId: ":fileId",
    initUpload: "upload/init",
    completeUpload: ":fileId/upload/complete",
    move: ":fileId/move",
    downloadUrl: ":fileId/download-url",
  },
} as const;
