import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Buscar superhéroe por nombre…" }: SearchBarProps) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-11 bg-input border-2 border-foreground shadow-comic-sm font-medium"
      />
    </div>
  );
};
