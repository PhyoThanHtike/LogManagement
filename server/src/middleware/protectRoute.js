// middleware/protectRoute.js
import { verifyToken } from "../utils/jwtUtils.js";
import { AuthService } from "../services/authService.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    const decoded = verifyToken(token);
    
    const user = await AuthService.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found. Token invalid." 
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        success: false, 
        message: "Account is restricted or suspended." 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email address." 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token." 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired." 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
