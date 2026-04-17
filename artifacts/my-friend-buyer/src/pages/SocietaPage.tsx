import { useState } from "react";
import { useListCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany, getListCompaniesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function SocietaPage() {
  const { data: companies, isLoading } = useListCompanies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Società</h1>
          <p className="text-muted-foreground">Gestione delle holding operative</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Società
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Partita IVA</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Caricamento...</TableCell>
                </TableRow>
              ) : companies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nessuna società trovata</TableCell>
                </TableRow>
              ) : (
                companies?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {company.name}
                      </div>
                    </TableCell>
                    <TableCell>{company.vatNumber || "-"}</TableCell>
                    <TableCell>{company.address || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(company.createdAt), "dd MMM yyyy", { locale: it })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCompany(company)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteCompanyDialog company={company} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CompanyDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      <CompanyDialog 
        open={!!editingCompany} 
        onOpenChange={(open) => !open && setEditingCompany(null)} 
        company={editingCompany} 
      />
    </div>
  );
}

function CompanyDialog({ open, onOpenChange, company }: { open: boolean, onOpenChange: (open: boolean) => void, company?: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!company;
  
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  
  const [formData, setFormData] = useState({
    name: "",
    vatNumber: "",
    address: ""
  });

  // Reset form when dialog opens/closes
  useState(() => {
    if (open) {
      if (company) {
        setFormData({
          name: company.name,
          vatNumber: company.vatNumber || "",
          address: company.address || ""
        });
      } else {
        setFormData({ name: "", vatNumber: "", address: "" });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isEditing) {
      updateMutation.mutate({
        id: company.id,
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
          toast({ title: "Società aggiornata" });
          onOpenChange(false);
        }
      });
    } else {
      createMutation.mutate({
        data: formData
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
          toast({ title: "Società creata" });
          onOpenChange(false);
          setFormData({ name: "", vatNumber: "", address: "" });
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Società" : "Nuova Società"}</DialogTitle>
          <DialogDescription>
            Inserisci i dati della società operativa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome (Obbligatorio)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Es: WindTre Retail S.r.l."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat">Partita IVA</Label>
            <Input 
              id="vat" 
              value={formData.vatNumber} 
              onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
              placeholder="IT12345678901"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo Sede Legale</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Via Roma 1, Milano"
            />
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

function DeleteCompanyDialog({ company }: { company: any }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = () => {
    deleteMutation.mutate({ id: company.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        toast({ title: "Società eliminata" });
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
          <DialogTitle>Elimina società</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la società {company.name}? Questa azione non può essere annullata.
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
