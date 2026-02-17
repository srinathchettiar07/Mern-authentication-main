import mongoose from "mongoose";

const supplierOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantityOrdered: {
          type: Number,
          required: true,
          min: 1
        },
        costPrice: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    orderStatus: {
      type: String,
      enum: ["INCOMING", "DELIVERED", "CANCELLED"],
      default: "INCOMING"
    },

    expectedDeliveryDate: {
      type: Date,
      required: function () {
        return this.orderStatus === "INCOMING";
      },
      default: null
    },

    deliveredAt: {
      type: Date,
      default: null
    },

    totalOrderCost: {
      type: Number,
      required: true,
      min: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
const order = mongoose.model("SupplierOrder", supplierOrderSchema);
export default order;