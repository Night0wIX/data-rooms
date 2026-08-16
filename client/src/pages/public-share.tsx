import { useParams } from "react-router-dom";

export function PublicShare() {
  const { token } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Public view</h1>
      <p className="text-sm text-muted-foreground">
        TODO: shared content for token {token}
      </p>
    </div>
  );
}
