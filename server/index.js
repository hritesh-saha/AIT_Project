import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import addOnRoutes from './routes/addOnRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import userRoutes from './routes/userRoutes.js';

import connectDB from './configs/db.js';
import compression from "compression";

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors({
  origin: '*'
}));// <-- allow all origins
app.use(express.json());
app.use(compression());

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/addons', addOnRoutes);

app.get('/', (req, res) => {
  res.send('API is working!');
});

// ✅ Start Server (for local or non-serverless deployment)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
