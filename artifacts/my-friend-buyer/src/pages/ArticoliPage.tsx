import { useState } from "react";
import { useListSkus, useCreateSku, useUpdateSku, useDeleteSku, getListSkusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ArticoliPage() {
  const { data: skus, isLoading } = useListSkus();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Articoli</h1>
          <p className="text-muted-foreground">Catalogo prodotti e SKU</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Articolo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nome Prodotto</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tracciabilità</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Caricamento...</TableCell>
                </TableRow>
              ) : skus?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Nessun articolo trovato</TableCell>
                </TableRow>
              ) : (
                skus?.map((sku) => (
                  <TableRow key={sku.id}>
                    <TableCell className="font-mono text-xs">{sku.sku}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {sku.name}
                      </div>
                    </TableCell>
                    <TableCell>{sku.brand || "-"}</TableCell>
                    <TableCell>
                      {sku.category ? (
                        <Badge variant="outline">{sku.category}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground uppercase font-medium">
                        {sku.identifierType || "Nessuna"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setEditingSku(sku)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteSkuDialog sku={sku} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SkuDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      <SkuDialog 
        open={!!editingSku} 
        onOpenChange={(open) => !open && setEditingSku(null)} 
        sku={editingSku} 
      />
    </div>
  );
}

function SkuDialog({ open, onOpenChange, sku }: { open: boolean, onOpenChange: (open: boolean) => void, sku?: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!sku;
  
  const createMutation = useCreateSku();
  const updateMutation = useUpdateSku();
  
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    identifierType: "none",
    active: true
  });

  useState(() => {
    if (open) {
      if (sku) {
        setFormData({
          sku: sku.sku,
          name: sku.name,
          category: sku.category || "",
          brand: sku.brand || "",
          identifierType: sku.identifierType || "none",
          active: sku.active
        });
      } else {
        setFormData({ sku: "", name: "", category: "", brand: "", identifierType: "none", active: true });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (isEditing) {
      updateMutation.mutate({
        id: sku.id,
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSkusQueryKey() });
          toast({ title: "Articolo aggiornato" });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSkusQueryKey() });
          toast({ title: "Articolo creato" });
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Codice Univoco)</Label>
            <Input 
              id="sku" 
              value={formData.sku} 
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              className="font-mono"
              required
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome Prodotto (Obbligatorio)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input 
                id="brand" 
                value={formData.brand} 
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="es: Apple, Samsung..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="es: Smartphone, Accessori..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="identifier">Tracciabilità seriali</Label>
            <Select value={formData.identifierType} onValueChange={(val) => setFormData({...formData, identifierType: val})}>
              <SelectTrigger id="identifier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna tracciabilità</SelectItem>
                <SelectItem value="imei">IMEI (Telefonia)</SelectItem>
                <SelectItem value="serial">Seriale (Accessori/Hardware)</SelectItem>
                <SelectItem value="iccid">ICCID (SIM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={!formData.name || !formData.sku || createMutation.isPending || updateMutation.isPending}>
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSkuDialog({ sku }: { sku: any }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSku();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = () => {
    deleteMutation.mutate({ id: sku.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSkusQueryKey() });
        toast({ title: "Articolo eliminato" });
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
          <DialogTitle>Elimina articolo</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {sku.name}? Non potrai eliminarlo se è stato movimentato.
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
