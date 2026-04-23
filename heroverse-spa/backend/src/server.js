import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { superheroesRouter } from "./routes/superheroes.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/heroverse";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

await mongoose.connect(MONGO_URI);

const app = express();
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/superheroes", superheroesRouter);

// Error handler mínimo con mensajes útiles para el frontend
// (ej: validación de mongoose)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err?.name === "ValidationError" ? 400 : 500;
  const message = err?.message || "Error interno";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on :${PORT}`);
});

