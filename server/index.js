import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import addOnRoutes from "./routes/addOnRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import connectDB from './configs/db.js';

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/addons", addOnRoutes);

app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
