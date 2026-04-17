import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4" />
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground hidden sm:inline">
          {user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? ""}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </Button>
      </div>
    </header>
  );
}
