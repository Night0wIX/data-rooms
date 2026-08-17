export const API_PREFIX = "api/v1";

export const ROUTES = {
  users: {
    root: "users",
    currentUser: "me",
  },
  dataRooms: {
    root: "data-rooms",
    shared: "shared",
    byId: ":dataRoomId",
  },
  folders: {
    root: "folders",
    byId: ":folderId",
    breadcrumb: ":folderId/breadcrumb",
    deletionPreview: ":folderId/deletion-preview",
  },
  files: {
    root: "files",
    byId: ":fileId",
    initUpload: "upload/init",
    completeUpload: ":fileId/upload/complete",
    move: ":fileId/move",
    downloadUrl: ":fileId/download-url",
  },
  share: {
    root: "share",
    byId: ":shareId",
    byToken: "public/:token",
    tokenContents: "public/:token/contents",
    tokenBreadcrumb: "public/:token/breadcrumb",
    tokenFileDownloadUrl: "public/:token/files/:fileId/download-url",
  },
} as const;
