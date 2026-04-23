import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Superhero } from "@/types/superhero";
import { cn } from "@/lib/utils";
import heroFallback from "@/assets/hero-bg.jpg";

interface SuperheroCardProps {
  hero: Superhero;
  index?: number;
}

const truncate = (text: string, max = 110) =>
  text.length <= max ? text : text.slice(0, max).trimEnd() + "…";

export const SuperheroCard = ({ hero, index = 0 }: SuperheroCardProps) => {
  const isMarvel = hero.casa === "marvel";
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    setCoverIndex(0);
  }, [hero.id]);

  const coverSrc = hero.imagenes[coverIndex] ?? heroFallback;

  return (
    <Link
      to={`/heroe/${hero.id}`}
      className={cn(
        "group relative block bg-card border-2 border-foreground overflow-hidden",
        "shadow-comic transition-all duration-200",
        "hover:-translate-y-1 hover:translate-x-[-2px]",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={coverSrc}
          alt={hero.nombre}
          loading="lazy"
          className="h-full w-full object-cover grayscale-[20%] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          onError={(e) => {
            // Intentar siguientes imágenes antes de caer al fallback.
            if (coverIndex < hero.imagenes.length - 1) {
              setCoverIndex((i) => i + 1);
              return;
            }
            if (coverIndex < hero.imagenes.length) {
              setCoverIndex(hero.imagenes.length);
              return;
            }
            e.currentTarget.src = heroFallback;
          }}
        />
        {/* Halftone overlay */}
        <div className="absolute inset-0 halftone opacity-30 mix-blend-multiply pointer-events-none" />
        {/* Gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/70 to-transparent" />
        {/* House tag */}
        <div
          className={cn(
            "absolute top-3 left-3 font-display tracking-widest text-sm px-3 py-1 border-2 border-foreground shadow-comic-sm",
            isMarvel ? "bg-marvel text-primary-foreground" : "bg-dc text-primary-foreground"
          )}
        >
          {isMarvel ? "MARVEL" : "DC"}
        </div>
        {/* Image count */}
        {hero.imagenes.length > 1 && (
          <div className="absolute top-3 right-3 bg-background/90 border-2 border-foreground text-xs font-bold px-2 py-1 shadow-comic-sm">
            {hero.imagenes.length} 📷
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2 relative">
        <h3 className="font-display text-2xl leading-tight tracking-wide">
          {hero.nombre}
        </h3>
        {hero.nombreReal && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">
            {hero.nombreReal}
          </p>
        )}
        <p className="text-sm text-foreground/80 line-clamp-3 min-h-[3.75rem]">
          {truncate(hero.biografia, 130)}
        </p>
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>EST. {hero.anioAparicion}</span>
          <span
            className={cn(
              "font-display tracking-wider",
              isMarvel ? "text-marvel-glow" : "text-dc-glow"
            )}
          >
            VER →
          </span>
        </div>
      </div>
    </Link>
  );
};
