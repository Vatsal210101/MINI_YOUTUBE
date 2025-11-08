import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const optionalAuth = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/Bearer\s*/i, "").trim();
        
        if (!token) {
            // No token, continue without user
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (user) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
});
