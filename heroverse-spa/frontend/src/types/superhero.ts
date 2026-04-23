export type House = "marvel" | "dc";

export interface Superhero {
  id: string;
  nombre: string;
  nombreReal?: string;
  anioAparicion: number;
  casa: House;
  biografia: string;
  equipamiento?: string[];
  imagenes: string[];
}

export type SuperheroInput = Omit<Superhero, "id">;
