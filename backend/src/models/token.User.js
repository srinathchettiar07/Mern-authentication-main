import mongoose, { Schema } from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    token:{
        type:String,
        required:true
    }
} , {timestamps:true});

const token = mongoose.model("token" , tokenSchema);
export default token;