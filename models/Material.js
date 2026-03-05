import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  turma: { type: String, required: true },
  type: { type: String, default: 'pdf' },
  authorId: { type: String },
}, { timestamps: true });

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);