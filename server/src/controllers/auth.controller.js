// controllers/authController.js
import { AuthService } from "../services/authService.js";
import { addOTPJob } from "../jobs/queue/otpQueue.js";
import { generateToken, clearToken } from "../utils/jwtUtils.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const signUp = async (req, res) => {
  try {
    const { email, name, password, role, tenant } = req.body;

    // Validate input
    if (!email || !name || !password || !tenant) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user exists
    const existingUser = await AuthService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create user (unverified)
    const user = await AuthService.createUser({
      email,
      name,
      password,
      role: role || "USER",
      tenant,
    });

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in database
    await AuthService.createOTPRequest(email, otpCode, 'REGISTRATION');
    
    // Add OTP email to queue
    await addOTPJob(email, otpCode, 'REGISTRATION');

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
      userId: user.id,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode, purpose } = req.body;

    const otpRequest = await AuthService.findValidOTP(email, otpCode, purpose);
    
    if (!otpRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    await AuthService.markOTPAsUsed(otpRequest.id);

    if (purpose === 'REGISTRATION') {
      // Verify user email and activate account
      const user = await AuthService.findUserByEmail(email);
      await AuthService.verifyUserEmail(user.id);

      // Generate token after successful verification
      generateToken(user.id, res);

      res.json({
        success: true,
        message: "Email verified successfully",
        user: {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
        },
      });
    } else if (purpose === 'PASSWORD_RESET') {
      // For password reset, just return success - actual reset happens in separate endpoint
      res.json({
        success: true,
        message: "OTP verified successfully. You can now reset your password.",
      });
    }
  } catch (error) {
    console.log("Error in verifyOTP controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: "Account is restricted. Please contact support.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await AuthService.updateUser(user.id, {
        loginAttempts: user.loginAttempts + 1,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await AuthService.updateUser(user.id, {
      loginAttempts: 0,
    });

    generateToken(user.id, res);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.id,
        email: user.email,
        userName: user.name,
        role: user.role,
        tenant: user.tenant,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: "If the email exists, a reset code has been sent.",
      });
    }

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in database
    await AuthService.createOTPRequest(email, otpCode, 'PASSWORD_RESET');
    
    // Add OTP email to queue
    await addOTPJob(email, otpCode, 'PASSWORD_RESET');

    res.json({
      success: true,
      message: "If the email exists, a reset code has been sent.",
    });
  } catch (error) {
    console.log("Error in forgotPassword controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Verify OTP first
    // const otpRequest = await AuthService.findValidOTP(email, otpCode, 'PASSWORD_RESET');
    
    // if (!otpRequest) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid or expired OTP",
    //   });
    // }

    // // Mark OTP as used
    // await AuthService.markOTPAsUsed(otpRequest.id);

    // Update password
    const user = await AuthService.findUserByEmail(email);
    await AuthService.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logOut = (req, res) => {
  try {
    clearToken(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const checkUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      user: {
        userId: user.id,
        userName: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("User checking error", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Cleanup expired OTPs (can be called by a cron job)
export const cleanupOTPs = async (req, res) => {
  try {
    const result = await AuthService.cleanupExpiredOTPs();
    res.json({
      success: true,
      message: `Cleaned up ${result.count} expired OTPs`,
    });
  } catch (error) {
    console.log("Error in cleanupOTPs controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Additional method for authController.js
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Email and purpose are required",
      });
    }

    // Check if user exists for registration purpose
    if (purpose === 'REGISTRATION') {
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already verified",
        });
      }
    }

    // Generate new OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in database
    await AuthService.createOTPRequest(email, otpCode, purpose);
    
    // Add OTP email to queue
    await addOTPJob(email, otpCode, purpose);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Error in resendOTP controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const updatedUser = await AuthService.updateUser(userId, { name });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        userId: updatedUser.id,
        userName: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        tenant: updatedUser.tenant,
      },
    });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};