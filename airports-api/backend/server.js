const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { createClient } = require('redis');

const {
  MONGO_URI = 'mongodb://localhost:27017',
  MONGO_DB = 'airport_db',
  REDIS_GEO_URL = 'redis://localhost:6379',
  REDIS_POP_URL = 'redis://localhost:6380',
  PORT = 3000,
  SEED_ON_START = 'true',
} = process.env;

const GEO_KEY = 'airports-geo';
const POP_KEY = 'airport_popularity';

async function main() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(MONGO_DB);
  const col = db.collection('airports');
  await col.createIndex({ iata_faa: 1 }, { unique: true, sparse: true });

  const rGeo = createClient({ url: REDIS_GEO_URL });
  const rPop = createClient({ url: REDIS_POP_URL });
  rGeo.on('error', e => console.error('redis-geo', e));
  rPop.on('error', e => console.error('redis-pop', e));
  await rGeo.connect();
  await rPop.connect();

  // TTL inicial del set de popularidad
  await rPop.expire(POP_KEY, 86400).catch(() => {});

  if (SEED_ON_START === 'true') {
    const count = await col.countDocuments();
    if (count === 0) {
      const file = path.join(__dirname, 'data', 'airports.json');
      if (fs.existsSync(file)) {
        console.log('Seeding airports...');
        const data = JSON.parse(fs.readFileSync(file, 'utf8'))
          .filter(a => a.iata_faa && a.iata_faa.trim() && a.lat != null && a.lng != null);
        // dedupe
        const seen = new Set();
        const unique = data.filter(a => {
          if (seen.has(a.iata_faa)) return false;
          seen.add(a.iata_faa); return true;
        });
        await col.insertMany(unique, { ordered: false }).catch(e => console.warn(e.message));
        const geoItems = unique
          .filter(a => Math.abs(a.lat) <= 85 && Math.abs(a.lng) <= 180)
          .map(a => ({ longitude: a.lng, latitude: a.lat, member: a.iata_faa }));
        // GEOADD por lotes
        const batch = 1000;
        for (let i = 0; i < geoItems.length; i += batch) {
          await rGeo.geoAdd(GEO_KEY, geoItems.slice(i, i + batch));
        }
        console.log(`Seeded ${unique.length} airports.`);
      }
    } else {
      console.log(`Mongo already has ${count} airports.`);
    }
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // GET todos
  app.get('/airports', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10000, 20000);
    const docs = await col.find({}, { projection: { _id: 0 } }).limit(limit).toArray();
    res.json(docs);
  });

  // GET cercanos (antes del :iata)
  app.get('/airports/nearby', async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 100;
    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: 'lat/lng requeridos' });
    const results = await rGeo.geoSearchWith(
      GEO_KEY,
      { longitude: lng, latitude: lat },
      { radius, unit: 'km' },
      ['WITHCOORD', 'WITHDIST']
    );
    const codes = results.map(r => r.member);
    const docs = await col.find({ iata_faa: { $in: codes } }, { projection: { _id: 0 } }).toArray();
    const map = Object.fromEntries(docs.map(d => [d.iata_faa, d]));
    res.json(results.map(r => ({
      ...map[r.member],
      distance_km: parseFloat(r.distance),
    })));
  });

  // GET populares
  app.get('/airports/popular', async (req, res) => {
    const top = parseInt(req.query.top) || 10;
    const raw = await rPop.zRangeWithScores(POP_KEY, 0, top - 1, { REV: true });
    const codes = raw.map(r => r.value);
    const docs = await col.find({ iata_faa: { $in: codes } }, { projection: { _id: 0 } }).toArray();
    const map = Object.fromEntries(docs.map(d => [d.iata_faa, d]));
    res.json(raw.map(r => ({ ...map[r.value], visits: r.score })));
  });

  // GET por IATA (suma popularidad)
  app.get('/airports/:iata', async (req, res) => {
    const iata = req.params.iata.toUpperCase();
    const doc = await col.findOne({ iata_faa: iata }, { projection: { _id: 0 } });
    if (!doc) return res.status(404).json({ error: 'no encontrado' });
    await rPop.zIncrBy(POP_KEY, 1, iata);
    await rPop.expire(POP_KEY, 86400);
    res.json(doc);
  });

  // POST crear
  app.post('/airports', async (req, res) => {
    const a = req.body;
    if (!a.iata_faa || a.lat == null || a.lng == null)
      return res.status(400).json({ error: 'iata_faa, lat y lng requeridos' });
    a.iata_faa = a.iata_faa.toUpperCase();
    try {
      await col.insertOne(a);
      await rGeo.geoAdd(GEO_KEY, { longitude: a.lng, latitude: a.lat, member: a.iata_faa });
      res.status(201).json(a);
    } catch (e) {
      res.status(409).json({ error: e.message });
    }
  });

  // PUT modificar
  app.put('/airports/:iata', async (req, res) => {
    const iata = req.params.iata.toUpperCase();
    const upd = { ...req.body };
    delete upd._id;
    const r = await col.findOneAndUpdate(
      { iata_faa: iata },
      { $set: upd },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    if (!r) return res.status(404).json({ error: 'no encontrado' });
    if (upd.lat != null && upd.lng != null) {
      await rGeo.geoAdd(GEO_KEY, { longitude: upd.lng, latitude: upd.lat, member: iata });
    }
    res.json(r);
  });

  // DELETE
  app.delete('/airports/:iata', async (req, res) => {
    const iata = req.params.iata.toUpperCase();
    const r = await col.deleteOne({ iata_faa: iata });
    if (!r.deletedCount) return res.status(404).json({ error: 'no encontrado' });
    await rGeo.zRem(GEO_KEY, iata);
    await rPop.zRem(POP_KEY, iata);
    res.json({ deleted: iata });
  });

  app.get('/', (_, res) => res.json({ ok: true, name: 'TP6 Airports API' }));

  app.listen(PORT, () => console.log(`API on :${PORT}`));
}

main().catch(e => { console.error(e); process.exit(1); });
