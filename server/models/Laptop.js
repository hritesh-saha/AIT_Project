import mongoose from "mongoose";
import Device from "./BaseDevice.js";

const Laptop = Device.discriminator("Laptop", new mongoose.Schema({
  processor: String,
  has_touchscreen: Boolean
}));

export default Laptop;