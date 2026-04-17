import { useGetDashboardSummary, useGetDashboardRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Store, Warehouse, Package, Truck, Activity } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica del sistema e attività recenti</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Società" value={summary?.companies} icon={Building2} loading={isLoadingSummary} />
        <KpiCard title="Punti Vendita" value={summary?.stores} icon={Store} loading={isLoadingSummary} />
        <KpiCard title="Magazzini" value={summary?.warehouses} icon={Warehouse} loading={isLoadingSummary} />
        <KpiCard title="Fornitori" value={summary?.suppliers} icon={Truck} loading={isLoadingSummary} />
        <KpiCard title="Articoli" value={summary?.skus} icon={Package} loading={isLoadingSummary} />
        <KpiCard title="Unità in Stock" value={summary?.unitsInStock} icon={Activity} loading={isLoadingSummary} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ultimi Movimenti</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.skuName || "Articolo sconosciuto"}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: it })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase px-2 py-1 bg-muted rounded-md">
                        {item.movementType}
                      </span>
                      <span className={`font-bold ${item.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.quantity > 0 ? "+" : ""}{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nessun movimento recente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, loading }: { title: string, value?: number, icon: any, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value?.toLocaleString("it-IT") || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
