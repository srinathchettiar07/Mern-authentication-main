import mongoose, { Schema } from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// TTL index: auto-delete OTP after 5 minutes

const Token = mongoose.model("Token", tokenSchema);
export default Token;
