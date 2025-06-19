import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import bankRoutes from './routes/route';

dotenv.config();

const app = express();
app.use(express.json());
connectDB();

app.use('/api/bank-verification', bankRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
