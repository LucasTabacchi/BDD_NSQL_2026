import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onCreate: () => void;
}

const navItems = [
  { to: "/", label: "TODOS", end: true },
  { to: "/marvel", label: "MARVEL" },
  { to: "/dc", label: "DC" },
];

export const Navbar = ({ onCreate }: NavbarProps) => {
  const { pathname } = useLocation();
  const isDetail = pathname.startsWith("/heroe/");

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between py-4 gap-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="font-display text-3xl text-stroke text-accent">
            HERO<span className="text-marvel">VERSE</span>
          </div>
        </NavLink>

        {!isDetail && (
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "px-5 py-2 font-display tracking-widest text-lg border-2 transition-all",
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-comic-sm"
                      : "border-transparent hover:border-foreground hover:bg-muted"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <Button
          onClick={onCreate}
          className="font-display tracking-widest text-base bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-foreground shadow-comic-sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          NUEVO
        </Button>
      </div>

      {/* Mobile nav */}
      {!isDetail && (
        <nav className="md:hidden container pb-3 flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 font-display tracking-wider text-sm border-2 whitespace-nowrap",
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/30"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};
