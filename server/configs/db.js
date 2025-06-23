import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DB_URI = process.env.DB_URI;

const connectDB = async () => {
  try {
    const con = await mongoose.connect(DB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

export default connectDB;
