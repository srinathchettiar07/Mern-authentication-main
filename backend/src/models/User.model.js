import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profilePic:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:["owner", "admin" , "staff"],
        default:"staff",
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    
} , {timestamps:true})

const User = mongoose.model("Users", userSchema);
export default User;
