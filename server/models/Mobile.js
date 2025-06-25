import mongoose from "mongoose";
import Device from "./BaseDevice.js";

const Mobile = Device.discriminator("Mobile", new mongoose.Schema({
  camera_mp: Number
}));

export default Mobile;