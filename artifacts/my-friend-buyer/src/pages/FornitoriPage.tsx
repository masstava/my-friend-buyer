import { useState } from "react";
import { useListSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, getListSuppliersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FornitoriPage() {
  const { data: suppliers, isLoading } = useListSuppliers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fornitori</h1>
          <p className="text-muted-foreground">Distributori e partner commerciali</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Fornitore
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>P.IVA</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Caricamento...</TableCell>
                </TableRow>
              ) : suppliers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nessun fornitore trovato</TableCell>
                </TableRow>
              ) : (
                suppliers?.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {supplier.name}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.vatNumber || "-"}</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {supplier.contactEmail && <div>{supplier.contactEmail}</div>}
                        {supplier.contactPhone && <div className="text-muted-foreground">{supplier.contactPhone}</div>}
                        {!supplier.contactEmail && !supplier.contactPhone && "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.active ? "default" : "secondary"}>
                        {supplier.active ? "Attivo" : "Inattivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setEditingSupplier(supplier)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteSupplierDialog supplier={supplier} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SupplierDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      <SupplierDialog 
        open={!!editingSupplier} 
        onOpenChange={(open) => !open && setEditingSupplier(null)} 
        supplier={editingSupplier} 
      />
    </div>
  );
}

function SupplierDialog({ open, onOpenChange, supplier }: { open: boolean, onOpenChange: (open: boolean) => void, supplier?: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!supplier;
  
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  
  const [formData, setFormData] = useState({
    name: "",
    vatNumber: "",
    contactEmail: "",
    contactPhone: "",
    active: true
  });

  useState(() => {
    if (open) {
      if (supplier) {
        setFormData({
          name: supplier.name,
          vatNumber: supplier.vatNumber || "",
          contactEmail: supplier.contactEmail || "",
          contactPhone: supplier.contactPhone || "",
          active: supplier.active
        });
      } else {
        setFormData({ name: "", vatNumber: "", contactEmail: "", contactPhone: "", active: true });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isEditing) {
      updateMutation.mutate({
        id: supplier.id,
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
          toast({ title: "Fornitore aggiornato" });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
          toast({ title: "Fornitore creato" });
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Fornitore" : "Nuovo Fornitore"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ragione Sociale (Obbligatorio)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat">Partita IVA</Label>
            <Input 
              id="vat" 
              value={formData.vatNumber} 
              onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.contactEmail} 
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input 
                id="phone" 
                value={formData.contactPhone} 
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="active"
              className="h-4 w-4 rounded border-gray-300"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
            />
            <Label htmlFor="active" className="cursor-pointer">Fornitore attivo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSupplierDialog({ supplier }: { supplier: any }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSupplier();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = () => {
    deleteMutation.mutate({ id: supplier.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
        toast({ title: "Fornitore eliminato" });
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
          <DialogTitle>Elimina fornitore</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {supplier.name}?
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
