// services/authService.js
import prisma from "../utils/database.js";
import bcrypt from "bcryptjs";

export class AuthService {
  // User operations
  static async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        isVerified: true,
        tenant: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    return await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        loginAttempts: 0,
        isVerified: false,
      },
    });
  }

  static async updateUser(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  static async verifyUserEmail(id) {
    return await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // OTP operations
  static async createOTPRequest(email, otpCode, purpose) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return await prisma.otpRequest.create({
      data: {
        email,
        otpCode,
        purpose,
        expiresAt,
      },
    });
  }

  static async findValidOTP(email, otpCode, purpose) {
    return await prisma.otpRequest.findFirst({
      where: {
        email,
        otpCode,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
        attempts: { lt: 3 }, // Max 3 attempts
      },
    });
  }

  static async markOTPAsUsed(id) {
    return await prisma.otpRequest.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  static async incrementOTPAttempts(id) {
    return await prisma.otpRequest.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  static async cleanupExpiredOTPs() {
    return await prisma.otpRequest.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true },
        ],
      },
    });
  }
}