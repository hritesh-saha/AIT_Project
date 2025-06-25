import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  device_type: {
    type: String,
    enum: ["Mobile", "Laptop", "Tablet", "Addon"],
    required: true
  },
  name: String,
  quantity_sold: {
    type: Number,
    default: 1,
    min: 1
  },
  final_price: Number,       // Price per unit at time of sale
  total_price: Number,       // Computed = final_price × quantity_sold
  discount: Number,
  manufacturer: String
}, { _id: false }); // prevent auto _id for subdocuments

const saleSchema = new mongoose.Schema({
  items: {
    type: [saleItemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  payment_method: {
    type: String,
    required: true
  },
  location: String,
  date: {
    type: String,
    default: () => new Date().toISOString().split("T")[0]
  },
  time: {
    type: String,
    default: () => new Date().toTimeString().split(" ")[0]
  }
}, { timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
