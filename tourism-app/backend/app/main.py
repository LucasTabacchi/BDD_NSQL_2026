from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import redis
import os

app = FastAPI(title="Tourism API - Geo Redis", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

GROUPS = {
    "cervecerias": "Cervecerías Artesanales",
    "universidades": "Universidades",
    "farmacias": "Farmacias",
    "emergencias": "Centros de Atención de Emergencias",
    "supermercados": "Supermercados",
}

GEO_KEY_PREFIX = "geo:"


class Place(BaseModel):
    name: str
    latitude: float
    longitude: float
    description: Optional[str] = ""


class UserLocation(BaseModel):
    latitude: float
    longitude: float


@app.get("/")
def root():
    return {"message": "Tourism API running", "groups": list(GROUPS.keys())}


@app.get("/groups")
def get_groups():
    return [{"id": k, "label": v} for k, v in GROUPS.items()]


@app.post("/places/{group}")
def add_place(group: str, place: Place):
    if group not in GROUPS:
        raise HTTPException(status_code=404, detail=f"Group '{group}' not found")
    key = GEO_KEY_PREFIX + group
    result = r.geoadd(key, (place.longitude, place.latitude, place.name))
    # Store metadata
    meta_key = f"meta:{group}:{place.name}"
    r.hset(meta_key, mapping={
        "name": place.name,
        "description": place.description or "",
        "group": group,
    })
    return {"status": "added", "place": place.name, "group": group}


@app.get("/places/{group}")
def get_places(group: str):
    if group not in GROUPS:
        raise HTTPException(status_code=404, detail=f"Group '{group}' not found")
    key = GEO_KEY_PREFIX + group
    members = r.zrange(key, 0, -1)
    result = []
    for m in members:
        pos = r.geopos(key, m)
        meta = r.hgetall(f"meta:{group}:{m}")
        if pos and pos[0]:
            result.append({
                "name": m,
                "longitude": pos[0][0],
                "latitude": pos[0][1],
                "description": meta.get("description", ""),
            })
    return result


@app.post("/nearby/{group}")
def get_nearby(group: str, location: UserLocation, radius: float = 5.0):
    if group not in GROUPS:
        raise HTTPException(status_code=404, detail=f"Group '{group}' not found")
    key = GEO_KEY_PREFIX + group
    results = r.georadius(
        key,
        location.longitude,
        location.latitude,
        radius,
        unit="km",
        withcoord=True,
        withdist=True,
        sort="ASC",
    )
    places = []
    for item in results:
        name, dist, (lon, lat) = item
        meta = r.hgetall(f"meta:{group}:{name}")
        places.append({
            "name": name,
            "distance_km": round(dist, 3),
            "latitude": lat,
            "longitude": lon,
            "description": meta.get("description", ""),
        })
    return {"group": group, "label": GROUPS[group], "radius_km": radius, "places": places}


@app.post("/distance/{group}")
def get_distance(group: str, location: UserLocation, place_name: str):
    if group not in GROUPS:
        raise HTTPException(status_code=404, detail=f"Group '{group}' not found")
    key = GEO_KEY_PREFIX + group
    # Temporarily add user location
    tmp_name = "__user_location__"
    r.geoadd(key, (location.longitude, location.latitude, tmp_name))
    dist = r.geodist(key, tmp_name, place_name, unit="km")
    r.zrem(key, tmp_name)
    if dist is None:
        raise HTTPException(status_code=404, detail=f"Place '{place_name}' not found in group '{group}'")
    return {
        "place": place_name,
        "group": group,
        "distance_km": round(dist, 3),
        "user_location": location,
    }


@app.delete("/places/{group}/{place_name}")
def delete_place(group: str, place_name: str):
    if group not in GROUPS:
        raise HTTPException(status_code=404, detail=f"Group '{group}' not found")
    key = GEO_KEY_PREFIX + group
    removed = r.zrem(key, place_name)
    r.delete(f"meta:{group}:{place_name}")
    if not removed:
        raise HTTPException(status_code=404, detail=f"Place '{place_name}' not found")
    return {"status": "deleted", "place": place_name}
