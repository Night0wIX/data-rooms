export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Or
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}
