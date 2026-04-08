# TurismoGeo — API de Puntos de Interés

Trabajo Práctico N°3 — Bases de Datos NoSQL  
Licenciatura en Sistemas de Información — UADER FCYT

## Stack

| Capa       | Tecnología                  |
|------------|-----------------------------|
| Backend    | Python 3.11 + FastAPI       |
| Base de datos | Redis 7 (comandos GEO)   |
| Frontend   | React 18 + Lucide Icons     |
| Containers | Docker + Docker Compose     |

## Estructura

```
tourism-api/
├── backend/
│   ├── app/main.py        # API FastAPI
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         # NearbyPage, AddPlacePage, ManagePage
│   │   ├── components/    # Navbar, GroupSelector, PlaceCard, Toast
│   │   ├── api.js         # Cliente Axios
│   │   └── App.js
│   ├── public/index.html
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

## Levantar el proyecto

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000  
- Backend (Swagger): http://localhost:8000/docs  
- Redis: localhost:6379

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/groups` | Lista los grupos de interés |
| GET | `/places/{group}` | Lista todos los lugares de un grupo |
| POST | `/places/{group}` | Agrega un lugar al grupo |
| DELETE | `/places/{group}/{name}` | Elimina un lugar |
| POST | `/nearby/{group}?radius=5` | Lugares dentro de X km del usuario |
| POST | `/distance/{group}?place_name=X` | Distancia exacta al lugar elegido |

## Grupos disponibles

- `cervecerias` — Cervecerías Artesanales
- `universidades` — Universidades
- `farmacias` — Farmacias
- `emergencias` — Centros de Atención de Emergencias
- `supermercados` — Supermercados

## Comandos Redis utilizados

- `GEOADD` — Agregar punto geoespacial
- `GEORADIUS` — Buscar en radio (cercanos)
- `GEODIST` — Distancia entre dos puntos
- `GEOPOS` — Obtener coordenadas de un miembro
- `ZRANGE` / `ZREM` — Listado y eliminación
- `HSET` / `HGETALL` — Metadatos del lugar
