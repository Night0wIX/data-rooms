import { useParams } from "react-router-dom";

export function Folder() {
  const { dataRoomId, folderId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Folder {folderId}</h1>
      <p className="text-sm text-muted-foreground">
        TODO: folder contents, breadcrumb for data room {dataRoomId}
      </p>
    </div>
  );
}
