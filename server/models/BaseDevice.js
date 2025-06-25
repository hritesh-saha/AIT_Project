import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];  // "YYYY-MM-DD"
}

function getCurrentTime() {
  return new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"
}


const baseDeviceSchema = new mongoose.Schema({
  name: String,
  color: String,
  cost_price: Number,
  sales_price: Number,
  uid: { type: String, unique: true, default: () => uuidv4() },
  date: { type: String, default: getCurrentDate },
  time: { type: String, default: getCurrentTime },
  location: String,
  battery: Number,
  ram: Number,
  screen: String,
  manufacturer: String,
  discount: Number,
  final_price: Number,
  payment_method: String,
  also_bought_together: [String],
  device_screen_size: Number,
  inventory_qty: Number,
  sold_qty: Number
}, {
  discriminatorKey: 'device_type',
  timestamps: true
});

const Device = mongoose.model("Device", baseDeviceSchema);

export default Device;
