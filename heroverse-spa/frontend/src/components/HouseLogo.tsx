import type { House } from "@/types/superhero";
import { cn } from "@/lib/utils";

interface HouseLogoProps {
  house: House;
  className?: string;
  showLabel?: boolean;
}

/**
 * Logo institucional de cada casa, dibujado como SVG abstracto
 * para no depender de marcas registradas literales.
 */
export const HouseLogo = ({ house, className, showLabel = true }: HouseLogoProps) => {
  if (house === "marvel") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center bg-marvel text-primary-foreground font-display tracking-widest border-2 border-foreground shadow-comic-sm px-4 py-2",
          className
        )}
        aria-label="Casa Marvel"
      >
        {showLabel && <span className="text-2xl leading-none">MARVEL</span>}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center bg-dc text-primary-foreground font-display tracking-widest border-2 border-foreground shadow-comic-sm rounded-full w-16 h-16",
        className
      )}
      aria-label="Casa DC"
    >
      {showLabel && <span className="text-2xl leading-none">DC</span>}
    </div>
  );
};
