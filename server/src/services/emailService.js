// services/emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendOTPEmail(email, otpCode, purpose) {
    const subject =
      purpose === 'REGISTRATION'
        ? 'Verify Your Email Address'
        : 'Reset Your Password';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        // ✅ Use verified/sandbox sender (from your working .env)
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject,
        html,
      });

      console.log('Email sent result:', result);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      if (error?.response) {
        console.error('Resend response:', error.response);
      }
      return false;
    }
  }
}
