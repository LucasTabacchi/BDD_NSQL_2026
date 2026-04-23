import type { Superhero, SuperheroInput } from "@/types/superhero";

/**
 * API Client (REST).
 *
 * Define el backend en .env:
 *   VITE_API_URL=http://localhost:3000/api
 *
 * El backend debe exponer:
 *   GET    /superheroes
 *   GET    /superheroes/:id
 *   POST   /superheroes
 *   PUT    /superheroes/:id
 *   DELETE /superheroes/:id
 *
 * Ver README.md para el contrato completo.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

// Limpieza de compatibilidad: si antes usabas el mock/localStorage, eliminamos el store legacy.
const LEGACY_MOCK_STORAGE_KEY = "superheroes_store_v1";
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(LEGACY_MOCK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const getApiBaseUrl = (): string | undefined => {
  if (!API_URL) return undefined;
  try {
    // Base con trailing slash para resolver recursos relativos correctamente:
    // - API_URL = http://host/api  + "uploads/a.jpg" -> http://host/api/uploads/a.jpg
    // - API_URL = /api            + "uploads/a.jpg" -> http://frontend/api/uploads/a.jpg (mismo origen)
    const base = `${API_URL.replace(/\/?$/, "/")}`;
    if (typeof window !== "undefined") return new URL(base, window.location.origin).toString();
    return new URL(base).toString();
  } catch {
    return undefined;
  }
};

const API_BASE_URL = getApiBaseUrl();

const isProbablyWindowsPath = (value: string) => /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("\\\\");

const normalizeId = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const v = value.trim();
    return v ? v : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.$oid === "string" && obj.$oid.trim()) return obj.$oid.trim();
    if (typeof obj.oid === "string" && obj.oid.trim()) return obj.oid.trim();
  }
  return undefined;
};

const normalizeImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const src = value.trim();
  if (!src) return undefined;
  if (/^(data:|blob:|https?:\/\/)/i.test(src)) return src;
  if (isProbablyWindowsPath(src)) return undefined;

  // Resolver rutas relativas contra el base path del API (incluye /api/ si corresponde).
  if (API_BASE_URL) {
    try {
      return new URL(src, API_BASE_URL).toString();
    } catch {
      // continúa a fallback
    }
  }

  // Fallback: hacerlas root-relative para que no dependan de /heroe/:id, /marvel, etc.
  if (src.startsWith("/")) return src;
  return `/${src}`;
};

const normalizeImagenes = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return list
    .flatMap((v) => {
      if (typeof v === "string") return [v];
      if (v && typeof v === "object" && "url" in v && typeof (v as { url?: unknown }).url === "string") {
        return [(v as { url: string }).url];
      }
      return [];
    })
    .map(normalizeImageUrl)
    .filter((v): v is string => Boolean(v));
};

const normalizeHeroFromApi = (hero: unknown): Superhero => {
  const h = (hero ?? {}) as Record<string, unknown>;
  const id = normalizeId(h.id) ?? normalizeId(h._id) ?? "";
  if (!id && import.meta.env.DEV) {
    // Si falta `id`/`_id`, React reutiliza keys y podés ver "cards" con datos cruzados (nombre vs imagen).
    console.warn("[api] Superhero sin id válido; revisá que el backend devuelva `id` string o `_id` serializable", h);
  }
  return {
    ...(h as unknown as Superhero),
    id,
    imagenes: normalizeImagenes(h.imagenes),
  };
};

const missingConfigError = () =>
  new Error("Falta configurar VITE_API_URL (ej: http://localhost:3000/api). Reiniciá el frontend después de cambiar .env.");

// ----- HTTP CLIENT (REST) -----
const httpClient = {
  async list(): Promise<Superhero[]> {
    if (!API_URL) throw missingConfigError();
    const res = await fetch(`${API_URL}/superheroes`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = (await res.json()) as unknown;
    return Array.isArray(json) ? json.map(normalizeHeroFromApi) : [];
  },
  async get(id: string): Promise<Superhero | undefined> {
    if (!API_URL) throw missingConfigError();
    const res = await fetch(`${API_URL}/superheroes/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return normalizeHeroFromApi(await res.json());
  },
  async create(input: SuperheroInput): Promise<Superhero> {
    if (!API_URL) throw missingConfigError();
    const res = await fetch(`${API_URL}/superheroes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return normalizeHeroFromApi(await res.json());
  },
  async update(id: string, input: SuperheroInput): Promise<Superhero> {
    if (!API_URL) throw missingConfigError();
    const res = await fetch(`${API_URL}/superheroes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return normalizeHeroFromApi(await res.json());
  },
  async remove(id: string): Promise<void> {
    if (!API_URL) throw missingConfigError();
    const res = await fetch(`${API_URL}/superheroes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error ${res.status}`);
  },
};

const missingClient = {
  async list(): Promise<Superhero[]> {
    throw missingConfigError();
  },
  async get(_id: string): Promise<Superhero | undefined> {
    throw missingConfigError();
  },
  async create(_input: SuperheroInput): Promise<Superhero> {
    throw missingConfigError();
  },
  async update(_id: string, _input: SuperheroInput): Promise<Superhero> {
    throw missingConfigError();
  },
  async remove(_id: string): Promise<void> {
    throw missingConfigError();
  },
};

export const api = API_URL ? httpClient : missingClient;
export const apiConfigured = Boolean(API_URL);
