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

import serverless from 'serverless-http';

const app = express();

// Use CORS middleware properly
const allowedOrigins = [
  "http://localhost:5173",          // your frontend local dev URL
  "https://your-production-frontend.com"  // add your production frontend URL here
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,  // if you need cookies, else remove this line
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

// Remove app.listen for Vercel deployment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export app for serverless deployment
export default serverless(app);
