import { useParams } from "react-router-dom";

export function DataRoom() {
  const { dataRoomId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Data Room {dataRoomId}</h1>
      <p className="text-sm text-muted-foreground">
        TODO: top-level folders and files
      </p>
    </div>
  );
}
