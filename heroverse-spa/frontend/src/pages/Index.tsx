import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { SuperheroCard } from "@/components/SuperheroCard";
import { SuperheroFormDialog } from "@/components/SuperheroFormDialog";
import { useSuperheroes } from "@/hooks/useSuperheroes";
import type { House } from "@/types/superhero";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroesListPageProps {
  filterHouse?: House;
}

const HeroesListPage = ({ filterHouse }: HeroesListPageProps) => {
  const { data, loading, error, create } = useSuperheroes();
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(() => {
    let list = data;
    if (filterHouse) list = list.filter((h) => h.casa === filterHouse);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((h) => h.nombre.toLowerCase().includes(q));
    return list;
  }, [data, filterHouse, query]);

  const title = filterHouse === "marvel" ? "MARVEL" : filterHouse === "dc" ? "DC" : "MULTIVERSO";
  const subtitle =
    filterHouse === "marvel"
      ? "Vengadores, mutantes y más allá"
      : filterHouse === "dc"
      ? "La Liga de la Justicia y sus rivales"
      : "Todos los personajes del Heroverso";

  return (
    <div className="min-h-screen">
      <Navbar onCreate={() => setOpenCreate(true)} />

      {/* Hero banner */}
      <section className="relative overflow-hidden border-b-2 border-foreground">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="absolute inset-0 halftone opacity-20" />
        </div>
        <div className="container relative py-16 md:py-24">
          <p className="font-display tracking-[0.4em] text-accent text-sm md:text-base mb-3">
            HEROVERSE · {data.length} PERSONAJES
          </p>
          <h1 className="font-display text-6xl md:text-8xl text-stroke leading-none">
            {title}
          </h1>
          <p className="mt-4 text-lg text-foreground/80 max-w-xl">{subtitle}</p>
          <div className="mt-8">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container py-10">
        {error ? (
          <div className="text-center py-20 border-2 border-destructive/60 bg-destructive/5">
            <p className="font-display text-3xl tracking-wide mb-2">
              ERROR AL CARGAR
            </p>
            <p className="text-muted-foreground mb-3">
              No se pudieron obtener los superhéroes desde la API.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {String(error)}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Verificá que el backend esté corriendo y que <span className="font-mono">VITE_API_URL</span> apunte al endpoint <span className="font-mono">/superheroes</span>.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 font-display text-2xl tracking-widest text-muted-foreground">
            CARGANDO HÉROES…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-foreground/30">
            <p className="font-display text-3xl tracking-wide mb-2">SIN RESULTADOS</p>
            <p className="text-muted-foreground">
              {query ? `No hay héroes que coincidan con "${query}"` : "Aún no hay personajes en esta casa."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-bold text-foreground">{filtered.length}</span> de {data.length}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((hero, idx) => (
                <SuperheroCard key={`${hero.id || "noid"}-${hero.nombre}-${hero.casa}-${hero.anioAparicion}`} hero={hero} index={idx} />
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="border-t border-border mt-16">
        <div className="container py-8 text-center text-xs text-muted-foreground">
          HEROVERSE SPA · Práctica #6 — Bases de Datos NoSQL · UADER
        </div>
      </footer>

      <SuperheroFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSubmit={create}
      />
    </div>
  );
};

// Wrapper para rutas con/sin filtro
const Index = () => {
  const params = useParams();
  // Cuando se monta como /marvel o /dc, react-router pasa la ruta
  // y leemos el path desde window. Pero usamos rutas explícitas en App.
  return <HeroesListPage filterHouse={(params.casa as House | undefined) ?? undefined} />;
};

export default Index;
export { HeroesListPage };
