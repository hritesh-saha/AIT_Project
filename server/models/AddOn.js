import mongoose from "mongoose";
import Device from "./BaseDevice";

const addonSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Headphone", "Charger", "Power Bank", "Mouse", "Screen Guard"],
    required: true,
  },
  compatibility: [String],             // e.g., ["Mobile", "Laptop"]
  related_device_uids: [String],       // UIDs of devices this addon is related to
  sold_standalone: { type: Number, default: 0 },
  sold_with_device: { type: Number, default: 0 },
});

// Create discriminator model for Addon using the base Device schema
const Addon = Device.discriminator("Addon", addonSchema);

export default Addon;
