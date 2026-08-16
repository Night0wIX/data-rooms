import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layouts/app-layout";
import { ROUTES } from "@/shared/constants/routes";
import { lazyNamed } from "@/shared/utils/lazy-named";
import { ProtectedRoute } from "./protected-route/protected-route";
import { PublicRoute } from "./public-route/public-route";

const LoginPage = lazyNamed(() => import("@/pages/login"), "Login");
const DataRoomsListPage = lazyNamed(
  () => import("@/pages/data-rooms"),
  "DataRooms",
);
const DataRoomPage = lazyNamed(() => import("@/pages/data-room"), "DataRoom");
const FolderPage = lazyNamed(() => import("@/pages/folder"), "Folder");
const PublicSharePage = lazyNamed(
  () => import("@/pages/public-share"),
  "PublicShare",
);
const UnauthorizedPage = lazyNamed(
  () => import("@/pages/unauthorized"),
  "Unauthorized",
);
const NotFoundPage = lazyNamed(() => import("@/pages/not-found"), "NotFound");

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.dataRooms, element: <DataRoomsListPage /> },
          { path: ROUTES.dataRoom, element: <DataRoomPage /> },
          { path: ROUTES.folder, element: <FolderPage /> },
          { path: ROUTES.unauthorized, element: <UnauthorizedPage /> },
        ],
      },
      {
        element: <PublicRoute />,
        children: [{ path: ROUTES.login, element: <LoginPage /> }],
      },
      { path: ROUTES.publicShare, element: <PublicSharePage /> },
      { path: ROUTES.notFound, element: <NotFoundPage /> },
    ],
  },
]);
