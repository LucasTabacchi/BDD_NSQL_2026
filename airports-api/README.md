# TP6 · API Aeropuertos (MongoDB + Redis + Leaflet)

Práctica de Bases de Datos NSQL — Licenciatura en Sistemas de Información (UADER).

## Stack
- **MongoDB** — almacenamiento principal (colección `airports`).
- **Redis GEO** — `airports-geo` para búsquedas por cercanía.
- **Redis Popularidad** — ZSET `airport_popularity` con TTL 1 día.
- **Backend** — Node.js + Express.
- **Frontend** — HTML + Leaflet.js + Leaflet.markercluster.
- **Docker Compose** — orquesta todo.

## Levantar el proyecto
```bash
docker compose up --build
```

- API: http://localhost:3000
- Frontend: http://localhost:8080

En el primer arranque, el backend detecta la colección vacía y carga `data/airports.json` (8108 aeropuertos) en MongoDB y en Redis GEO.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET    | `/airports` | Lista todos |
| GET    | `/airports/:iata` | Devuelve uno y **+1 en popularidad** |
| POST   | `/airports` | Crea (Mongo + GEOADD) |
| PUT    | `/airports/:iata` | Modifica (re-GEOADD si cambian coords) |
| DELETE | `/airports/:iata` | Borra de Mongo, GEO y Popularidad |
| GET    | `/airports/nearby?lat=..&lng=..&radius=km` | Cercanos (GEOSEARCH) |
| GET    | `/airports/popular?top=10` | Top populares (ZREVRANGE) |

## Importar JSON manualmente al contenedor Mongo (alternativa)
```bash
docker cp data/airports.jsonl tp6-mongo:/tmp/airports.jsonl
docker exec -it tp6-mongo mongoimport \
  --db airport_db --collection airports --drop \
  --file /tmp/airports.jsonl
```

## Verificar Redis
```bash
docker exec -it tp6-redis-geo redis-cli ZCARD airports-geo
docker exec -it tp6-redis-pop redis-cli ZREVRANGE airport_popularity 0 9 WITHSCORES
docker exec -it tp6-redis-pop redis-cli TTL airport_popularity
```
