// middleware/adminAuthorization.js
import { AuthService } from "../services/authService.js";

export const adminAuthorization = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required." 
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      });
    }

    next();
  } catch (error) {
    console.log("Error in adminAuthorization middleware:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Optional: RBAC middleware for different roles
// export const requireRole = (allowedRoles) => {
//   return (req, res, next) => {
//     try {
//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({ 
//           success: false, 
//           message: "Authentication required." 
//         });
//       }

//       if (!allowedRoles.includes(user.role)) {
//         return res.status(403).json({ 
//           success: false, 
//           message: "Insufficient permissions." 
//         });
//       }

//       next();
//     } catch (error) {
//       console.log("Error in requireRole middleware:", error.message);
//       res.status(500).json({ 
//         success: false, 
//         message: "Internal server error" 
//       });
//     }
//   };
// };