import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Superhero } from "../src/models/superhero.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/heroverse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_SEED_PATH = path.resolve(__dirname, "../seed/seed.json");
if (!fs.existsSync(JSON_SEED_PATH)) {
  throw new Error(`No se encontró seed.json en ${JSON_SEED_PATH}`);
}
const SEED = JSON.parse(fs.readFileSync(JSON_SEED_PATH, "utf8"));

const main = async () => {
  await mongoose.connect(MONGO_URI);
  await Superhero.deleteMany({});
  await Superhero.insertMany(SEED);
  // eslint-disable-next-line no-console
  console.log(`[seed] inserted ${SEED.length} superheroes`);
  await mongoose.disconnect();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
