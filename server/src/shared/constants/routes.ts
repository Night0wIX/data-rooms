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
} as const;
