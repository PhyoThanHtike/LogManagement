// queues/otpQueue.js
import { Queue } from 'bullmq';
import { redis } from '../../../config/redis-client.js';

export const otpQueue = new Queue('otpQueue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const addOTPJob = async (email, otpCode, purpose) => {
  return await otpQueue.add('sendOTP', {
    email,
    otpCode,
    purpose,
  });
};