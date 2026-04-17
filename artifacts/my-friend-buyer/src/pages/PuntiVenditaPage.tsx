import { useEffect, useMemo, useState } from "react";
import {
  useListStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useListCompanies,
  getListStoresQueryKey,
} from "@workspace/api-client-react";
import type { Store } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Store as StoreIcon } from "lucide-react";

export default function PuntiVenditaPage() {
  const { data: stores, isLoading } = useListStores();
  const { data: companies } = useListCompanies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);

  const companyMap = useMemo(
    () => new Map((companies ?? []).map((c) => [c.id, c.name])),
    [companies],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Punti Vendita</h1>
          <p className="text-muted-foreground">I 16 negozi del gruppo</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Punto Vendita
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Società</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Caricamento…
                  </TableCell>
                </TableRow>
              ) : !stores || stores.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nessun punto vendita
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <StoreIcon className="h-4 w-4 text-muted-foreground" />
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell>{companyMap.get(s.companyId) ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteStoreDialog store={s} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StoreDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <StoreDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        store={editing}
      />
    </div>
  );
}

function StoreDialog({
  open,
  onOpenChange,
  store,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!store;
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  const { data: companies } = useListCompanies();

  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName(store?.name ?? "");
      setCompanyId(store?.companyId ?? "");
    }
  }, [open, store]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyId) return;
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
      toast({ title: isEditing ? "Punto vendita aggiornato" : "Punto vendita creato" });
      onOpenChange(false);
    };
    if (isEditing && store) {
      updateMutation.mutate(
        { id: store.id, data: { name, companyId } },
        { onSuccess },
      );
    } else {
      createMutation.mutate({ data: { name, companyId } }, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Punto Vendita" : "Nuovo Punto Vendita"}
          </DialogTitle>
          <DialogDescription>Nome e società di appartenenza.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Società</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona società" />
              </SelectTrigger>
              <SelectContent>
                {(companies ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() ||
                !companyId ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteStoreDialog({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina punto vendita</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {store.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() =>
              deleteMutation.mutate(
                { id: store.id },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: getListStoresQueryKey(),
                    });
                    toast({ title: "Punto vendita eliminato" });
                    setOpen(false);
                  },
                },
              )
            }
          >
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
