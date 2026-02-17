import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const ensureAuthenticated = async (req,res , next )=>{
try {
    const token = req.cookies.jwt;
    console.log("Token from cookie:", token); // Debugging log
    if (!token) {
        return res.status(401).json({message: "Unauthorized access, no token provided"});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({message: "Unauthorized access, invalid token"});
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
        return res.status(401).json({message: "Unauthorized access, user not found"});
    }
    console.log("Authenticated user:", user); // Debugging log
    req.user = user;
    next();
    
    
} catch (error) {
    console.error("Error in authentication middleware:", error);
    return res.status(500).json({message: "Internal server error"});
    
}
}