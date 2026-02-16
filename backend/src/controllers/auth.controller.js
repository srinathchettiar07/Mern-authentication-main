import User from "../models/User.model.js";
import token from "../models/token.User.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcrypt";
import { sendMail } from "../lib/nodeMailer.js";

export const signup = async (req , res)=>{
    const {fullname ,role ,  email ,password , } = req.body
    try {
    if(!fullname || !email || !password || !role) return res.status(400).json({message:"All fields are required "})

    if(password.length < 8) return res.status(400).json({message:"Password must be atleast 8 characters long"})

    const user = await User.findOne({email})
    if(user) return res.status(400).json({message:"User already exists try logging in"})
     const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password , salt);

    const newUser = new User(
        {
            fullname,
            email:email.toLowerCase(),
            password:hashedPassword,
            role,
            isVerified:false
        }
    );       
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const isEmail = sendMail(newUser , otp);
    if(isEmail)
        {
            await newUser.save();
            await token.findOneAndUpdate(
            { userId: newUser._id },
            { token: otp },
            { upsert: true, new: true, setDefaultsOnInsert: true });
            console.log("OTP sent to email");
            res.status(201).json({
                user: {
                    fullname: newUser.fullname,
                    email: newUser.email,
                    role: newUser.role,
                    _id: newUser._id,
                    isVerified: newUser.isVerified
                 }
            })
        } 
    
    } catch (error) {
        console.log(error + "error in signup controller");
    }

}

export const requestVerification = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // if the account is already verified there's nothing to do
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        const storedOtp = await token.findOne({ userId: user._id });
        if (!storedOtp) {
            return res.status(404).json({ message: "OTP not found or already used" });
        }

        if (otp !== storedOtp.token) {
            return res.status(400).json({ message: "Invalid OTP, try again" });
        }

        const isExpired = new Date() - storedOtp.createdAt > 5 * 60 * 1000;
        if (isExpired) {
            // throw away the old token but keep the user so they can request a new one
            await token.deleteOne({ userId: user._id });
            return res.status(400).json({ error: "OTP expired" });
        }

        const signupExpired = new Date() - storedOtp.createdAt > 24 * 60 * 60 * 1000;
        if (signupExpired) {
            // do not automatically delete a verified user; simply inform them
            await token.deleteOne({ userId: user._id });
            return res.status(400).json({ error: "Signup request expired. Please register again or request a new code." });
        }

        user.isVerified = true;
        await user.save();

        await token.deleteOne({ userId: user._id });

        generateToken(user._id, res);

        res.status(201).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
            role:user.role,
            isVerified: true
        });

    } catch (error) {
        console.log(error + " - error in request verification");
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = async (req, res) =>
{
    try {
        res.cookie("jwt" , "" , {
            httpOnly: true,
            maxAge: 0, // Set maxAge to 0 to delete the cookie
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
        });
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log(error + " in logout controller");
        res.status(500).json({message:"Internal server error"});
    }
}

export const login = async(req , res)=>{
    const {email , password} = req.body;
    try {
        if(!email || !password) return res.status(400).json({error:"Please enter both email and password"});
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Email Not found , please Signup First !"});
        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch) return res.status(400).json({message:"Invalid Credentials!"});
        if(!user.isVerified) return res.status(400).json({message:"Please verify your email first!"});
         generateToken(user._id, res);
        res.status(200).json({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
            role:user.role,
            isVerified:user.isVerified
            });
    } catch (error) {
        console.log(error + " in login controller");
        res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfile = async (req, res) =>
{
    const {profilePic } = req.body;
    try {
        if(!profilePic) return res.status(400).json({error:"Please enter profile picture"});
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const user = await User.findByIdAndUpdate(req.user._id , {
            profilePic: uploadResponse.secure_url
        } , {new:true})
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message:"Internal error"});
    }
}

export const checkAuth = (req , res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log(error + " in checkAuth controller");
        res.status(500).json({message:"Internal server error"});
    }
}