import express from "express";
import { Superhero } from "../models/superhero.js";

export const superheroesRouter = express.Router();

const pickInput = (body) => ({
  nombre: body?.nombre,
  nombreReal: body?.nombreReal,
  anioAparicion: body?.anioAparicion,
  casa: body?.casa,
  biografia: body?.biografia,
  equipamiento: body?.equipamiento,
  imagenes: body?.imagenes,
});

superheroesRouter.get("/", async (_req, res, next) => {
  try {
    const list = await Superhero.find().sort({ nombre: 1 }).lean();
    // Cuando usamos lean(), no corre toJSON -> mapeamos id manual.
    const normalized = list.map((h) => {
      const { _id, __v, ...rest } = h;
      return { ...rest, id: _id.toString() };
    });
    res.json(normalized);
  } catch (err) {
    next(err);
  }
});

superheroesRouter.get("/:id", async (req, res, next) => {
  try {
    const hero = await Superhero.findById(req.params.id);
    if (!hero) return res.status(404).end();
    res.json(hero.toJSON());
  } catch (err) {
    next(err);
  }
});

superheroesRouter.post("/", async (req, res, next) => {
  try {
    const created = await Superhero.create(pickInput(req.body));
    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
});

superheroesRouter.put("/:id", async (req, res, next) => {
  try {
    const updated = await Superhero.findByIdAndUpdate(req.params.id, pickInput(req.body), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).end();
    res.json(updated.toJSON());
  } catch (err) {
    next(err);
  }
});

superheroesRouter.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Superhero.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).end();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
