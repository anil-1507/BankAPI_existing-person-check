import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema({
  name: String,
  bankAccount: { type: String, required: true },
  ifsc: { type: String, required: true },
  bankName: String,
  branch: String,
  city: String,
  phone: String,
  userId: String,
  status: { type: String, default: 'PENDING' },
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Verification', VerificationSchema);
