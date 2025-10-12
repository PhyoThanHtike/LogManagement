// utils/otpUtils.js
import crypto from 'crypto';

export class OTPUtils {
  static generateOTP(length = 6) {
    return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  }

  static generateNumericOTP(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max).toString();
  }

  static generateAlphanumericOTP(length = 8) {
    return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static calculateExpiryTime(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isOTPExpired(expiresAt) {
    return new Date() > new Date(expiresAt);
  }
}