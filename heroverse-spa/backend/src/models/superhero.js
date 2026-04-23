import mongoose from "mongoose";

const SuperheroSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    nombreReal: { type: String, trim: true },
    anioAparicion: { type: Number, required: true, min: 1900, max: 2100 },
    casa: { type: String, enum: ["marvel", "dc"], required: true },
    biografia: { type: String, required: true, trim: true },
    equipamiento: [{ type: String, trim: true }],
    imagenes: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "Debe tener al menos una imagen",
      },
    },
  },
  { timestamps: true }
);

SuperheroSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Superhero = mongoose.model("Superhero", SuperheroSchema);

