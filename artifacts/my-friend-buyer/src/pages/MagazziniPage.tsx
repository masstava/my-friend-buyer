import { useState } from "react";
import { 
  useListWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse, getListWarehousesQueryKey,
  useListCompanies
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MagazziniPage() {
  const { data: warehouses, isLoading } = useListWarehouses();
  const { data: companies } = useListCompanies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Magazzini Centrali</h1>
          <p className="text-muted-foreground">Poli logistici principali delle società</p>
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
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Società</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Caricamento...</TableCell>
                </TableRow>
              ) : warehouses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Nessun magazzino trovato</TableCell>
                </TableRow>
              ) : (
                warehouses?.map((wh) => {
                  const company = companies?.find(c => c.id === wh.companyId);
                  return (
                    <TableRow key={wh.id}>
                      <TableCell className="font-mono text-xs">{wh.code || "-"}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                          {wh.name}
                        </div>
                      </TableCell>
                      <TableCell>{company?.name || "Sconosciuta"}</TableCell>
                      <TableCell>{wh.address || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={wh.active ? "default" : "secondary"}>
                          {wh.active ? "Attivo" : "Inattivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setEditingWarehouse(wh)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteWarehouseDialog warehouse={wh} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WarehouseDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        companies={companies || []}
      />
      <WarehouseDialog 
        open={!!editingWarehouse} 
        onOpenChange={(open) => !open && setEditingWarehouse(null)} 
        warehouse={editingWarehouse}
        companies={companies || []}
      />
    </div>
  );
}

function WarehouseDialog({ open, onOpenChange, warehouse, companies }: { open: boolean, onOpenChange: (open: boolean) => void, warehouse?: any, companies: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!warehouse;
  
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    companyId: "",
    address: "",
    active: true
  });

  useState(() => {
    if (open) {
      if (warehouse) {
        setFormData({
          name: warehouse.name,
          code: warehouse.code || "",
          companyId: warehouse.companyId,
          address: warehouse.address || "",
          active: warehouse.active
        });
      } else {
        setFormData({ name: "", code: "", companyId: companies[0]?.id || "", address: "", active: true });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyId) return;

    if (isEditing) {
      updateMutation.mutate({
        id: warehouse.id,
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWarehousesQueryKey() });
          toast({ title: "Magazzino aggiornato" });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWarehousesQueryKey() });
          toast({ title: "Magazzino creato" });
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Magazzino" : "Nuovo Magazzino"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Codice</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="es: WH-MAIN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Società</Label>
              <Select value={formData.companyId} onValueChange={(val) => setFormData({...formData, companyId: val})}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Seleziona società" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome (Obbligatorio)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="active"
              className="h-4 w-4 rounded border-gray-300"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
            />
            <Label htmlFor="active" className="cursor-pointer">Magazzino attivo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={!formData.name || !formData.companyId || createMutation.isPending || updateMutation.isPending}>
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteWarehouseDialog({ warehouse }: { warehouse: any }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteWarehouse();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = () => {
    deleteMutation.mutate({ id: warehouse.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWarehousesQueryKey() });
        toast({ title: "Magazzino eliminato" });
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
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
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
