import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema({
  name: String,
  bankAccount: String,
  ifsc: String,
  phone: String,
  userId: String,
  referenceId: String,
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Verification', VerificationSchema);
