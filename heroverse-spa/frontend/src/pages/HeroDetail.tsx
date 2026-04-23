import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Calendar, ImageIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HouseLogo } from "@/components/HouseLogo";
import { SuperheroFormDialog } from "@/components/SuperheroFormDialog";
import { useSuperheroes } from "@/hooks/useSuperheroes";
import { cn } from "@/lib/utils";
import heroFallback from "@/assets/hero-bg.jpg";

const HeroDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, update, remove, create } = useSuperheroes();
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const hero = data.find((h) => h.id === id);
  const isMarvel = hero?.casa === "marvel";

  useEffect(() => {
    if (!loading && !hero) {
      // No existe -> redirigir a home tras breve delay
      const t = setTimeout(() => navigate("/", { replace: true }), 800);
      return () => clearTimeout(t);
    }
  }, [hero, loading, navigate]);

  if (loading || !hero) {
    return (
      <div className="min-h-screen">
        <Navbar onCreate={() => setOpenCreate(true)} />
        <div className="container py-20 text-center font-display tracking-widest text-muted-foreground">
          {loading ? "CARGANDO…" : error ? "ERROR AL CARGAR" : "HÉROE NO ENCONTRADO"}
        </div>
        {error && (
          <div className="container pb-10 text-center">
            <div className="inline-block border-2 border-destructive/60 bg-destructive/5 px-6 py-4">
              <p className="text-sm text-muted-foreground mb-2">
                No se pudo obtener la información desde la API.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {String(error)}
              </p>
            </div>
          </div>
        )}
        <SuperheroFormDialog open={openCreate} onOpenChange={setOpenCreate} onSubmit={create} />
      </div>
    );
  }

  const handleDelete = async () => {
    await remove(hero.id, hero.nombre);
    setOpenDelete(false);
    navigate("/", { replace: true });
  };

  const accent = isMarvel ? "marvel" : "dc";
  const images = hero.imagenes.length ? hero.imagenes : [heroFallback];

  return (
    <div className="min-h-screen">
      <Navbar onCreate={() => setOpenCreate(true)} />

      {/* Backlink */}
      <div className="container pt-6">
        <Button
          variant="ghost"
          asChild
          className="font-display tracking-widest text-sm hover:bg-muted"
        >
          <Link to={isMarvel ? "/marvel" : hero.casa === "dc" ? "/dc" : "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" /> VOLVER
          </Link>
        </Button>
      </div>

      <section className="container py-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Carousel / image */}
        <div className="lg:col-span-3">
          {images.length > 1 ? (
            <Carousel className="w-full border-2 border-foreground shadow-comic">
              <CarouselContent>
                {images.map((src, i) => (
                  <CarouselItem key={i}>
                    <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                      <img
                        src={src}
                        alt={`${hero.nombre} ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          e.currentTarget.src = heroFallback;
                        }}
                      />
                      <div className="absolute inset-0 halftone opacity-20 mix-blend-multiply pointer-events-none" />
                      <div className="absolute bottom-3 right-3 bg-background/90 border-2 border-foreground text-xs font-bold px-2 py-1 shadow-comic-sm">
                        {i + 1} / {images.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 border-2 border-foreground bg-background/90" />
              <CarouselNext className="right-3 border-2 border-foreground bg-background/90" />
            </Carousel>
          ) : (
            <div className="relative aspect-[4/5] bg-muted border-2 border-foreground shadow-comic overflow-hidden">
              <img
                src={images[0]}
                alt={hero.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = heroFallback;
                }}
              />
              <div className="absolute inset-0 halftone opacity-20 mix-blend-multiply pointer-events-none" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <HouseLogo house={hero.casa} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpenEdit(true)}
                className="border-2 border-foreground shadow-comic-sm"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setOpenDelete(true)}
                className="border-2 border-foreground shadow-comic-sm"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h1
              className={cn(
                "font-display text-5xl md:text-6xl leading-none text-stroke",
                isMarvel ? "text-marvel-glow" : "text-dc-glow"
              )}
            >
              {hero.nombre}
            </h1>
            {hero.nombreReal && (
              <p className="mt-2 text-lg text-muted-foreground italic">
                {hero.nombreReal}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Badge
              variant="outline"
              className={cn(
                "border-2 border-foreground gap-1.5 px-3 py-1",
                `bg-${accent}/10`
              )}
            >
              <Calendar className="h-3 w-3" /> {hero.anioAparicion}
            </Badge>
            <Badge
              variant="outline"
              className="border-2 border-foreground gap-1.5 px-3 py-1"
            >
              <ImageIcon className="h-3 w-3" /> {images.length} imagen
              {images.length !== 1 && "es"}
            </Badge>
          </div>

          <div>
            <h2 className="font-display tracking-widest text-sm text-muted-foreground mb-2">
              BIOGRAFÍA
            </h2>
            <p className="text-foreground/90 leading-relaxed">{hero.biografia}</p>
          </div>

          {hero.equipamiento && hero.equipamiento.length > 0 && (
            <div>
              <h2 className="font-display tracking-widest text-sm text-muted-foreground mb-2">
                EQUIPAMIENTO
              </h2>
              <ul className="flex flex-wrap gap-2">
                {hero.equipamiento.map((item) => (
                  <li
                    key={item}
                    className="px-3 py-1.5 bg-muted border-2 border-foreground text-sm shadow-comic-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <SuperheroFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        initial={hero}
        onSubmit={(input) => update(hero.id, input)}
      />
      <SuperheroFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSubmit={create}
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="border-2 border-foreground shadow-comic">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl tracking-wide">
              ¿ELIMINAR A {hero.nombre.toUpperCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El superhéroe será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HeroDetail;
