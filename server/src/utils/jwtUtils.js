// utils/jwtUtils.js
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { 
      userId,
      type: 'access'
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER || 'your-app',
      audience: process.env.JWT_AUDIENCE || 'your-app-users',
    }
  );

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  });

  return token;
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER || 'your-app',
    audience: process.env.JWT_AUDIENCE || 'your-app-users',
  });
};

export const clearToken = (res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  });
};