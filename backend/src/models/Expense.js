import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseType: {
      type: String,
      required: true,
      trim: true
      // Examples: Rent, Salary, Electricity, Internet
    },

    category: {
      type: String,
      enum: [
        "FIXED",
        "VARIABLE",
        "OPERATIONAL",
        "ADMINISTRATIVE"
      ],
      required: true
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

    expenseDate: {
      type: Date,
      required: true
    },

    paidTo: {
      type: String,
      default: ""
      // Example: Landlord, Electricity Board, Employee Name
    },

    referenceTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null
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

const expense = mongoose.model("Expense", expenseSchema);
export default expense;