import mongoose from 'mongoose';

const FormulaCacheSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    topic: { type: String, required: true },
    name: { type: String, required: true },
    latex: { type: String, required: true },
    explanation: { type: String, required: true },
    domain: {
      type: String,
      enum: ["thermodynamics", "quantum", "fourier", "biology", "economics", "general"],
      default: "general",
    },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('FormulaCache', FormulaCacheSchema);

