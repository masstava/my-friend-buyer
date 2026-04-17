import { useGetMe, useListStores, useListWarehouses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserButton } from "@clerk/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Store, Shield } from "lucide-react";

export default function Profilo() {
  const { data: me, isLoading: isLoadingMe } = useGetMe();
  const { data: stores } = useListStores();
  const { data: warehouses } = useListWarehouses();

  if (isLoadingMe) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const store = stores?.find(s => s.id === me?.storeId);
  const warehouse = warehouses?.find(w => w.id === me?.warehouseId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo Utente</h1>
        <p className="text-muted-foreground">Gestisci le tue informazioni e le preferenze del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Account</CardTitle>
          <CardDescription>
            I tuoi dati provengono dall'account Clerk. Usa il pulsante qui sotto per modificarli.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <p className="font-medium">Account Accesso</p>
              <p className="text-sm text-muted-foreground">{me?.email || "Email non disponibile"}</p>
            </div>
            <UserButton afterSignOutUrl="/login" />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Assegnazioni nel Sistema
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ruoli assegnati</p>
                  <div className="flex gap-2 mt-1">
                    {me?.roles && me.roles.length > 0 ? (
                      me.roles.map(role => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Nessun ruolo assegnato</span>
                    )}
                  </div>
                </div>
              </div>

              {(me?.storeId || store) && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Punto Vendita Assegnato</p>
                    <p className="text-sm text-muted-foreground">
                      {store ? store.name : "ID: " + me.storeId}
                    </p>
                  </div>
                </div>
              )}

              {(me?.warehouseId || warehouse) && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Magazzino Assegnato</p>
                    <p className="text-sm text-muted-foreground">
                      {warehouse ? warehouse.name : "ID: " + me.warehouseId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
