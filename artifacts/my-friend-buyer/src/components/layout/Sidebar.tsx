import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Store, 
  Warehouse, 
  Truck, 
  Package, 
  Settings, 
  Users, 
  UserCircle,
  ShoppingCart,
  ShoppingBag,
  ArrowLeftRight,
  Wallet,
  KanbanSquare,
  TrendingUp,
  BellRing,
  Upload
} from "lucide-react";

const navigation = [
  {
    title: "Dashboard",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "Anagrafiche",
    items: [
      { name: "Società", href: "/anagrafiche/societa", icon: Building2 },
      { name: "Punti Vendita", href: "/anagrafiche/punti-vendita", icon: Store },
      { name: "Magazzini", href: "/anagrafiche/magazzini", icon: Warehouse },
      { name: "Fornitori", href: "/anagrafiche/fornitori", icon: Truck },
      { name: "Articoli", href: "/anagrafiche/articoli", icon: Package },
    ]
  },
  {
    title: "Operazioni",
    items: [
      { name: "Magazzino", href: "/operazioni/magazzino", icon: Warehouse },
      { name: "Acquisti", href: "/operazioni/acquisti", icon: ShoppingBag },
      { name: "Vendite", href: "/operazioni/vendite", icon: ShoppingCart },
      { name: "Resi", href: "/operazioni/resi", icon: ArrowLeftRight },
      { name: "Flussi Cassa", href: "/operazioni/flussi-cassa", icon: Wallet },
      { name: "Kanban", href: "/operazioni/kanban", icon: KanbanSquare },
      { name: "Competition", href: "/operazioni/competition", icon: TrendingUp },
      { name: "Soglie", href: "/operazioni/soglie", icon: BellRing },
      { name: "Import", href: "/operazioni/import", icon: Upload },
    ]
  },
  {
    title: "Sistema",
    items: [
      { name: "Utenti", href: "/sistema/utenti", icon: Users },
      { name: "Impostazioni", href: "/sistema/impostazioni", icon: Settings },
      { name: "Profilo", href: "/profilo", icon: UserCircle },
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="h-14 flex items-center px-4 font-bold text-lg border-b border-sidebar-border tracking-tight">
        My Friend Buyer
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {navigation.map((group) => (
          <div key={group.title} className="mb-6 px-3">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
