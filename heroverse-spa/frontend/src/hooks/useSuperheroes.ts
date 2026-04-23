import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Superhero, SuperheroInput } from "@/types/superhero";
import { toast } from "sonner";

export const useSuperheroes = () => {
  const [data, setData] = useState<Superhero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.list();
      setData(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error("No se pudieron cargar los superhéroes", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: SuperheroInput) => {
      try {
        const created = await api.create(input);
        toast.success("¡Superhéroe creado!", { description: created.nombre });
        await refresh();
        return created;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        toast.error("No se pudo crear", { description: msg });
        throw err;
      }
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, input: SuperheroInput) => {
      try {
        const updated = await api.update(id, input);
        toast.success("Cambios guardados", { description: updated.nombre });
        await refresh();
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        toast.error("No se pudo actualizar", { description: msg });
        throw err;
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string, nombre?: string) => {
      try {
        await api.remove(id);
        toast.success("Superhéroe eliminado", { description: nombre });
        await refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        toast.error("No se pudo eliminar", { description: msg });
        throw err;
      }
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
};
