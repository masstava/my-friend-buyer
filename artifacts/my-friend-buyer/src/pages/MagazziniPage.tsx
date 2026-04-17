import { useEffect, useMemo, useState } from "react";
import {
  useListWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  useListStores,
  getListWarehousesQueryKey,
} from "@workspace/api-client-react";
import type { Warehouse } from "@workspace/api-client-react";
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
import { Plus, Pencil, Trash2, Warehouse as WarehouseIcon } from "lucide-react";

export default function MagazziniPage() {
  const { data: warehouses, isLoading } = useListWarehouses();
  const { data: stores } = useListStores();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);

  const storeMap = useMemo(
    () => new Map((stores ?? []).map((s) => [s.id, s.name])),
    [stores],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Magazzini</h1>
          <p className="text-muted-foreground">Magazzini collegati ai negozi</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Magazzino
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Punto Vendita</TableHead>
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
              ) : !warehouses || warehouses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nessun magazzino
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                        {w.name}
                      </div>
                    </TableCell>
                    <TableCell>{storeMap.get(w.storeId) ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(w)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteWarehouseDialog warehouse={w} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WarehouseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <WarehouseDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        warehouse={editing}
      />
    </div>
  );
}

function WarehouseDialog({
  open,
  onOpenChange,
  warehouse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!warehouse;
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const { data: stores } = useListStores();

  const [name, setName] = useState("");
  const [storeId, setStoreId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName(warehouse?.name ?? "");
      setStoreId(warehouse?.storeId ?? "");
    }
  }, [open, warehouse]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storeId) return;
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListWarehousesQueryKey() });
      toast({ title: isEditing ? "Magazzino aggiornato" : "Magazzino creato" });
      onOpenChange(false);
    };
    if (isEditing && warehouse) {
      updateMutation.mutate(
        { id: warehouse.id, data: { name, storeId } },
        { onSuccess },
      );
    } else {
      createMutation.mutate({ data: { name, storeId } }, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Magazzino" : "Nuovo Magazzino"}
          </DialogTitle>
          <DialogDescription>Nome e punto vendita di appartenenza.</DialogDescription>
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
            <Label>Punto Vendita</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona punto vendita" />
              </SelectTrigger>
              <SelectContent>
                {(stores ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
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
                !storeId ||
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

function DeleteWarehouseDialog({ warehouse }: { warehouse: Warehouse }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteWarehouse();
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
          <DialogTitle>Elimina magazzino</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {warehouse.name}?
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
                { id: warehouse.id },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: getListWarehousesQueryKey(),
                    });
                    toast({ title: "Magazzino eliminato" });
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
