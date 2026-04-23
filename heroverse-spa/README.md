# Heroverse (SPA + API + MongoDB)

Proyecto full-stack para la práctica #6 (UADER): **SPA** para gestionar superhéroes Marvel/DC con **CRUD**, vista detalle, carrusel de imágenes y filtros.

## Estructura

- `frontend/`: React + Vite + TypeScript + Tailwind + shadcn/ui (Radix)
- `backend/`: Node + Express + Mongoose (API REST)
- `docker-compose.yml`: receta global (Mongo + API + Frontend)

## Requisitos

- Node.js 18+ (recomendado 20/22) si corrés sin Docker
- Docker Desktop si corrés con Docker

## Levantar todo con Docker (recomendado)

Desde la raíz:

```bash
docker compose up -d --build
docker compose exec -T api node scripts/seed.js
```

URLs:

- Frontend (Docker): `http://localhost:8081`
- API (Docker): `http://localhost:3000`
- Health: `http://localhost:3000/health`

## Variables de entorno

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3000/api
```

Backend (opcional, si corrés sin Docker): ver `backend/.env.example`.

## Desarrollo local (sin Docker)

1) Mongo (podés levantar solo Mongo con Docker):

```bash
docker compose up -d mongo
```

2) API:

```bash
cd backend
npm install
npm run dev
```

Seed:

```bash
cd C:\Users\lucas\Desktop\heroverse-spa
docker compose exec -T api node scripts/seed.js
```

3) Frontend:

```bash
cd frontend
npm install
npm run dev
```

Por defecto Vite corre en `http://localhost:8080`.

## Contrato de API (REST)

Base path: `/api`

| Método | Ruta                  | Body (JSON)      | Respuesta          |
|--------|-----------------------|------------------|-------------------|
| GET    | `/superheroes`        | —                | `Superhero[]`     |
| GET    | `/superheroes/:id`    | —                | `Superhero` o 404 |
| POST   | `/superheroes`        | `SuperheroInput` | `Superhero` (201) |
| PUT    | `/superheroes/:id`    | `SuperheroInput` | `Superhero` o 404 |
| DELETE | `/superheroes/:id`    | —                | 204 o 404         |

### Esquema `Superhero`

```ts
{
  id: string;             // ObjectId de Mongo serializado
  nombre: string;
  nombreReal?: string;
  anioAparicion: number;
  casa: "marvel" | "dc";
  biografia: string;
  equipamiento?: string[];
  imagenes: string[];     // mínimo 1
}
```

## Endpoints principales

- `GET http://localhost:3000/api/superheroes`
- `GET http://localhost:3000/api/superheroes/:id`
- `POST http://localhost:3000/api/superheroes`
- `PUT http://localhost:3000/api/superheroes/:id`
- `DELETE http://localhost:3000/api/superheroes/:id`

## Troubleshooting

- **“No aparecen personajes”**: corré el seed `docker compose exec -T api node scripts/seed.js`.
- **“Error al cargar”**: asegurate de que la API esté arriba (`/health`) y que `VITE_API_URL` apunte al backend.
- **Imágenes en blanco**: suele ser un 404 en la URL de `imagenes[0]`; re-seedear arregla si venían URLs viejas.

## Notas

- El frontend requiere backend configurado con `VITE_API_URL`.
- El backend transforma `_id` → `id` para que el frontend lo use como key y en rutas.
