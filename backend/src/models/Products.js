// models/Products.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },
    unit: {
      type: String,
      required: true,
      enum: ["pcs", "kg", "litre", "box"]
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    minStock: {
      type: Number,
      required: true,
      min: 0
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISCONTINUED"],
      default: "ACTIVE"
    },
    lastRestockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Check if model exists before creating a new one
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;