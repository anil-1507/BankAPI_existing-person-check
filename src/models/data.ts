import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema({
  name: { type: String },
  bankAccount: { type: String, required: true },
  ifsc: { type: String, required: true },
  phone: { type: String },
  userId: { type: String },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Verification', VerificationSchema);
