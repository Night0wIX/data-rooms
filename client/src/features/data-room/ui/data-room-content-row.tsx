import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface DataRoomContentRowProps {
  icon: ReactNode;
  name: string;
  meta: string;
  linkTo?: string;
  onClick?: (() => void) | undefined;
  actions?: ReactNode;
  status?: ReactNode;
  disabled?: boolean;
}

export function DataRoomContentRow({
  icon,
  name,
  meta,
  linkTo,
  onClick,
  actions,
  status,
  disabled = false,
}: DataRoomContentRowProps) {
  const label = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="truncate text-sm font-medium text-foreground"
          title={name}
        >
          {name}
        </span>
        {status}
      </div>
      <div
        className="mt-0.5 truncate text-xs text-muted-foreground"
        title={meta}
      >
        {meta}
      </div>
    </>
  );

  const nameClassName =
    "min-w-0 flex-1 rounded-sm px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-muted/50 focus-within:bg-muted/50">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>

      {linkTo && !disabled ? (
        <Link to={linkTo} className={nameClassName}>
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick || disabled}
          className={nameClassName}
        >
          {label}
        </button>
      )}

      {actions && !disabled && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
