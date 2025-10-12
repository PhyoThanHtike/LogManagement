// send-test-email.js
import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

(async () => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const r = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'hello@yourdomain.com',
      to: 'phyothanhtike.ethan@gmail.com',
      subject: 'Test email from Resend',
      html: '<p>If you see this, delivery works!</p>',
    });
    console.log('Send test result:', r);
  } catch (e) {
    console.error('Send test error:', e);
  }
})();
