import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  turma: { type: String, required: true },
  role: { type: String, default: 'student' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('CSCJUsers', UserSchema);