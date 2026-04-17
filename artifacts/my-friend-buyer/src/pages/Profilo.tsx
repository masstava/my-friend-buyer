import { useGetMe } from "@workspace/api-client-react";
import { useClerk, useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Shield, User } from "lucide-react";

export default function Profilo() {
  const { data: me, isLoading } = useGetMe();
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo</h1>
        <p className="text-muted-foreground">I tuoi dati account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Dati utente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isLoading || !me ? (
            <p className="text-muted-foreground">Caricamento…</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{me.email ?? user?.primaryEmailAddress?.emailAddress ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{me.fullName ?? user?.fullName ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {me.roles && me.roles.length > 0
                    ? me.roles.join(", ")
                    : "Nessun ruolo assegnato"}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={() => signOut({ redirectUrl: basePath || "/" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Esci
      </Button>
    </div>
  );
}
