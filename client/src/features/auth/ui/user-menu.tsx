import { LogOut } from "lucide-react";
import { useCurrentUser } from "../hooks/use-current-user";
import { useLogout } from "../hooks/use-logout";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";

export function UserMenu() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const logout = useLogout();

  if (isLoading) return <Skeleton className="size-6 rounded-full" />;
  if (isError || !user) return null;

  const initial = user.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer text-sm text-foreground transition-colors motion-reduce:transition-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-40 truncate">{user.email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
