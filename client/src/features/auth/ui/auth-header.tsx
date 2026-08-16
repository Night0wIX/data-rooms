import type { LucideIcon } from "lucide-react";

interface AuthHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function AuthHeader({ icon: Icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary">
        <Icon className="size-7 text-primary-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
