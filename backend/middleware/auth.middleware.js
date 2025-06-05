import User from "../models/user.model.js";
import jwt from "jsonwebtoken";



export const protectRoute = async (req, res, next) => {
    try {
        
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                message: "Unauthorized access, No access token provided"
            });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({
            message: "Unauthorized - invalid access token",
            error: error.message
        });

    }
}

export const adminRoute = async (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next();
    } else {
        return res.status(403).json({
            message: "Forbidden - Admin access required"
        });
    }
}