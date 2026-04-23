import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Superhero, SuperheroInput, House } from "@/types/superhero";

interface SuperheroFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Superhero;
  onSubmit: (input: SuperheroInput) => Promise<unknown>;
}

const empty: SuperheroInput = {
  nombre: "",
  nombreReal: "",
  anioAparicion: new Date().getFullYear(),
  casa: "marvel",
  biografia: "",
  equipamiento: [],
  imagenes: [],
};

export const SuperheroFormDialog = ({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: SuperheroFormDialogProps) => {
  const [form, setForm] = useState<SuperheroInput>(empty);
  const [imagenesText, setImagenesText] = useState("");
  const [equipoText, setEquipoText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          nombre: initial.nombre,
          nombreReal: initial.nombreReal ?? "",
          anioAparicion: initial.anioAparicion,
          casa: initial.casa,
          biografia: initial.biografia,
          equipamiento: initial.equipamiento ?? [],
          imagenes: initial.imagenes,
        });
        setImagenesText(initial.imagenes.join("\n"));
        setEquipoText((initial.equipamiento ?? []).join(", "));
      } else {
        setForm(empty);
        setImagenesText("");
        setEquipoText("");
      }
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagenes = imagenesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (imagenes.length === 0) return;
    const equipamiento = equipoText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        nombreReal: form.nombreReal?.trim() || undefined,
        imagenes,
        equipamiento: equipamiento.length ? equipamiento : undefined,
      });
      onOpenChange(false);
    } catch {
      // error mostrado por hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-foreground shadow-comic">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-wide">
            {initial ? "EDITAR SUPERHÉROE" : "NUEVO SUPERHÉROE"}
          </DialogTitle>
          <DialogDescription>
            Completa los datos. Mínimo una imagen es requerida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del superhéroe *</Label>
              <Input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreReal">Nombre real</Label>
              <Input
                id="nombreReal"
                value={form.nombreReal}
                onChange={(e) => setForm({ ...form, nombreReal: e.target.value })}
                className="border-2 border-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año de aparición *</Label>
              <Input
                id="anio"
                type="number"
                required
                min={1900}
                max={2100}
                value={form.anioAparicion}
                onChange={(e) =>
                  setForm({ ...form, anioAparicion: Number(e.target.value) })
                }
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Casa *</Label>
              <Select
                value={form.casa}
                onValueChange={(v) => setForm({ ...form, casa: v as House })}
              >
                <SelectTrigger className="border-2 border-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marvel">Marvel</SelectItem>
                  <SelectItem value="dc">DC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía *</Label>
            <Textarea
              id="bio"
              required
              rows={4}
              value={form.biografia}
              onChange={(e) => setForm({ ...form, biografia: e.target.value })}
              className="border-2 border-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipo">Equipamiento (separado por comas)</Label>
            <Input
              id="equipo"
              value={equipoText}
              onChange={(e) => setEquipoText(e.target.value)}
              placeholder="Escudo, lanza, capa…"
              className="border-2 border-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imgs">URLs de imágenes (una por línea, mín. 1) *</Label>
            <Textarea
              id="imgs"
              required
              rows={3}
              value={imagenesText}
              onChange={(e) => setImagenesText(e.target.value)}
              placeholder="https://...\nhttps://..."
              className="border-2 border-foreground font-mono text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-foreground shadow-comic-sm font-display tracking-widest"
            >
              {submitting ? "GUARDANDO…" : initial ? "GUARDAR" : "CREAR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
