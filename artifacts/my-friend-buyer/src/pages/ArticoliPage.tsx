import { useEffect, useState } from "react";
import {
  useListSkus,
  useCreateSku,
  useUpdateSku,
  useDeleteSku,
  getListSkusQueryKey,
} from "@workspace/api-client-react";
import type { Sku } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

export default function ArticoliPage() {
  const { data: skus, isLoading } = useListSkus();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Sku | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Articoli</h1>
          <p className="text-muted-foreground">Catalogo SKU</p>
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
                <TableHead>Codice</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Caricamento…
                  </TableCell>
                </TableRow>
              ) : !skus || skus.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nessun articolo
                  </TableCell>
                </TableRow>
              ) : (
                skus.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {s.code}
                      </div>
                    </TableCell>
                    <TableCell>{s.brand ?? "—"}</TableCell>
                    <TableCell>{s.description ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.isSerialized ? "default" : "secondary"}>
                        {s.isSerialized ? "Seriale" : "Sfuso"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteSkuDialog sku={s} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SkuDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <SkuDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        sku={editing}
      />
    </div>
  );
}

function SkuDialog({
  open,
  onOpenChange,
  sku,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku?: Sku | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!sku;
  const createMutation = useCreateSku();
  const updateMutation = useUpdateSku();

  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [isSerialized, setIsSerialized] = useState(false);

  useEffect(() => {
    if (open) {
      setCode(sku?.code ?? "");
      setBrand(sku?.brand ?? "");
      setDescription(sku?.description ?? "");
      setIsSerialized(sku?.isSerialized ?? false);
    }
  }, [open, sku]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const data = {
      code,
      brand: brand || null,
      description: description || null,
      isSerialized,
    };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListSkusQueryKey() });
      toast({ title: isEditing ? "Articolo aggiornato" : "Articolo creato" });
      onOpenChange(false);
    };
    if (isEditing && sku) {
      updateMutation.mutate({ id: sku.id, data }, { onSuccess });
    } else {
      createMutation.mutate({ data }, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle>
          <DialogDescription>Codice prodotto, marca e descrizione.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Codice</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isSerialized"
              checked={isSerialized}
              onCheckedChange={(v) => setIsSerialized(v === true)}
            />
            <Label htmlFor="isSerialized" className="font-normal cursor-pointer">
              Articolo a matricola (seriale)
            </Label>
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
                !code.trim() ||
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

function DeleteSkuDialog({ sku }: { sku: Sku }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSku();
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
          <DialogTitle>Elimina articolo</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare {sku.code}?
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
                { id: sku.id },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: getListSkusQueryKey(),
                    });
                    toast({ title: "Articolo eliminato" });
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
