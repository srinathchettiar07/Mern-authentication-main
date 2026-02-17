import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["SALE", "PURCHASE"],
      required: true
    },

    referenceType: {
      type: String,
      enum: ["Sale", "SupplierOrder"],
      required: true
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType"
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "BANK_TRANSFER"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PARTIAL", "FAILED"],
      default: "PAID"
    },

    transactionDate: {
      type: Date,
      default: Date.now
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const transaction =  mongoose.model("Transaction", transactionSchema);
export default transaction;