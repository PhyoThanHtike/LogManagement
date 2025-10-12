// workers/otpWorker.js
import { Worker } from 'bullmq';
import { redis } from '../../../config/redis-client.js';
// import { EmailService } from '../services/emailService.js';
import { EmailService } from '../../services/emailService.js';

export const otpWorker = new Worker('otpQueue', 
  async (job) => {
    const { email, otpCode, purpose } = job.data;
    console.log(`Processing OTP job for: ${email}`);
    
    const success = await EmailService.sendOTPEmail(email, otpCode, purpose);
    
    if (!success) {
      throw new Error('Failed to send OTP email');
    }
    
    return { success: true, email };
  },
  { 
    connection: redis,
    concurrency: 5,
  }
);

otpWorker.on('completed', (job) => {
  console.log(`OTP email sent successfully to: ${job.data.email}`);
});

otpWorker.on('failed', (job, err) => {
  console.error(`OTP email failed for ${job?.data?.email}:`, err.message);
});