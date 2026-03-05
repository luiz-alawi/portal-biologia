import mongoose from 'mongoose';

const SpeciesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: String,
  imageUrl: { type: String, required: true },
  description: String,
  turma: { type: String, required: true },
  authorId: { type: String },
}, { timestamps: true });

export default mongoose.models.Species || mongoose.model('Species', SpeciesSchema);