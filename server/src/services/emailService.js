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

   static async sendAlertEmail(adminEmails, alert, log) {
    const subject = `🚨 Security Alert: ${alert.ruleName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Security Alert</h2>
        
        <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #d32f2f;">
          <h3 style="color: #d32f2f; margin-top: 0;">${alert.ruleName}</h3>
          <p><strong>Severity:</strong> ${alert.severity}/10</p>
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Timestamp:</strong> ${new Date(log.timestamp).toLocaleString()}</p>
        </div>

        <div style="margin: 20px 0;">
          <h4>Event Details:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${log.source}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Type</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${log.eventType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>User</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${log.user || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Host</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${log.host || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source IP</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${log.srcIp || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <p style="color: #666; font-size: 14px;">
          This alert was generated automatically by the security monitoring system.
        </p>
      </div>
    `;

    try {
      const emailPromises = adminEmails.map(email =>
        resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: email,
          subject,
          html,
        })
      );

      await Promise.all(emailPromises);
      console.log(`Alert emails sent to ${adminEmails.length} admins`);
      return true;
    } catch (error) {
      console.error('Alert email sending error:', error);
      return false;
    }
  }
}
