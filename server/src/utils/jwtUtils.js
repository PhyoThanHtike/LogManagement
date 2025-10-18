// utils/jwtUtils.js
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER || "your-app",
      audience: process.env.JWT_AUDIENCE || "your-app-users",
    }
  );

  // Build cookie options conditionally
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProd, // must be true in production for SameSite=None to work
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  // Only attach domain if explicitly configured (avoid setting to undefined)
  if (process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie("jwt", token, cookieOptions);

  return token;
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  });
};

export const clearToken = (res) => {
  const cookieOptions = {
    maxAge: 0,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie("jwt", "", cookieOptions);
};
