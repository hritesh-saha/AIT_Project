import mongoose from "mongoose";
import Device from "./BaseDevice";

const Tablet = Device.discriminator("Tablet", new mongoose.Schema({
  stylus_support: Boolean
}));

export default Tablet;