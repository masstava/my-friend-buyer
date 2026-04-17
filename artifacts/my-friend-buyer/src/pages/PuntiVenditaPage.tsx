import { useState } from "react";
import { 
  useListStores, useCreateStore, useUpdateStore, useDeleteStore, getListStoresQueryKey,
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
import { Plus, Pencil, Trash2, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PuntiVenditaPage() {
  const { data: stores, isLoading } = useListStores();
  const { data: companies } = useListCompanies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Punti Vendita</h1>
          <p className="text-muted-foreground">Gestione dei negozi WindTre</p>
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
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Società</TableHead>
                <TableHead>Città</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Caricamento...</TableCell>
                </TableRow>
              ) : stores?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Nessun punto vendita trovato</TableCell>
                </TableRow>
              ) : (
                stores?.map((store) => {
                  const company = companies?.find(c => c.id === store.companyId);
                  return (
                    <TableRow key={store.id}>
                      <TableCell className="font-mono text-xs">{store.code || "-"}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="h-4 w-4 text-muted-foreground" />
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>{company?.name || "Sconosciuta"}</TableCell>
                      <TableCell>{store.city || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={store.active ? "default" : "secondary"}>
                          {store.active ? "Attivo" : "Inattivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setEditingStore(store)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteStoreDialog store={store} />
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

      <StoreDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        companies={companies || []}
      />
      <StoreDialog 
        open={!!editingStore} 
        onOpenChange={(open) => !open && setEditingStore(null)} 
        store={editingStore}
        companies={companies || []}
      />
    </div>
  );
}

function StoreDialog({ open, onOpenChange, store, companies }: { open: boolean, onOpenChange: (open: boolean) => void, store?: any, companies: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!store;
  
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    companyId: "",
    address: "",
    city: "",
    active: true
  });

  useState(() => {
    if (open) {
      if (store) {
        setFormData({
          name: store.name,
          code: store.code || "",
          companyId: store.companyId,
          address: store.address || "",
          city: store.city || "",
          active: store.active
        });
      } else {
        setFormData({ name: "", code: "", companyId: companies[0]?.id || "", address: "", city: "", active: true });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyId) return;

    if (isEditing) {
      updateMutation.mutate({
        id: store.id,
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
          toast({ title: "Punto vendita aggiornato" });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
          toast({ title: "Punto vendita creato" });
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Punto Vendita" : "Nuovo Punto Vendita"}</DialogTitle>
          <DialogDescription>
            I punti vendita gestiscono lo stock locale e le vendite al dettaglio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Codice PDV</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="es: RM01"
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
              placeholder="WindTre Milano Duomo"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input 
                id="city" 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
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
            <Label htmlFor="active" className="cursor-pointer">Negozio attivo</Label>
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

function DeleteStoreDialog({ store }: { store: any }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = () => {
    deleteMutation.mutate({ id: store.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStoresQueryKey() });
        toast({ title: "Punto vendita eliminato" });
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
          <DialogTitle>Elimina punto vendita</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {store.name}?
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
