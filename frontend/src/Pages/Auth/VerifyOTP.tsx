import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/context/ThemeToggle';
import { verifyOTP, resendOTP } from '@/apiEndpoints/Auth';

type Purpose = "REGISTRATION" | "PASSWORD_RESET";

interface VerifyOTPData {
  email: string;
  otpCode: string;
  purpose: Purpose;
}

const VerifyOTP = () => {
  const { purpose } = useParams<{ purpose: Purpose }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const [verifyData, setVerifyData] = useState<VerifyOTPData>({
    email: location.state?.email || '',
    otpCode: '',
    purpose: purpose || 'REGISTRATION'
  });
  console.log(verifyData);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Refs for OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue) {
      // Update OTP code
      const newOtp = verifyData.otpCode.split('');
      newOtp[index] = numericValue;
      const newOtpCode = newOtp.join('');
      
      setVerifyData(prev => ({
        ...prev,
        otpCode: newOtpCode
      }));

      // Auto-focus next input
      if (index < 5 && numericValue) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!verifyData.otpCode[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
      
      // Clear current input
      const newOtp = verifyData.otpCode.split('');
      newOtp[index] = '';
      const newOtpCode = newOtp.join('');
      
      setVerifyData(prev => ({
        ...prev,
        otpCode: newOtpCode
      }));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pasteData.length === 6) {
      setVerifyData(prev => ({
        ...prev,
        otpCode: pasteData
      }));
      
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verifyData.otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }

    if (!verifyData.email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);

    try {
      // Replace this with your actual OTP verification API call
      const response = await verifyOTP(verifyData);
      
      if (response.success) {
        toast.success(response.message);        
        // Navigate based on purpose
        if (verifyData.purpose === 'REGISTRATION') {
          navigate('/');
        } else {
          navigate('/resetPassword', {
          state: { email: verifyData.email },
        });
        }
      } else {
        toast.error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('An error occurred during OTP verification');
      console.error('OTP Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !verifyData.email) return;

    setResendLoading(true);

    try {
      // Replace this with your actual resend OTP API call
      const response = await resendOTP({
        email: verifyData.email,
        purpose: verifyData.purpose
      });

      if (response.success) {
        toast.success('OTP sent successfully!');
        setCountdown(60); // 60 seconds countdown
        
        // Clear OTP and focus first input
        setVerifyData(prev => ({ ...prev, otpCode: '' }));
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };


  const getPurposeText = () => {
    switch (verifyData.purpose) {
      case 'REGISTRATION':
        return 'account registration';
      case 'PASSWORD_RESET':
        return 'password reset';
      default:
        return 'account verification';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-50 via-purple-50 to-blue-50 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-end"><ThemeToggle/></div>
            <div className="flex justify-center items-center">
              <div>
                <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                  Verify OTP
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  Enter the 6-digit code sent to your email
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Display */}
            {verifyData.email && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Code sent to: <span className="font-medium">{verifyData.email}</span>
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input Boxes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  OTP Code
                </label> */}
                
                <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      // block body -> returns void
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={verifyData.otpCode[index] || ''}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  ))}
                </div>
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Enter the 6-digit verification code
                </p>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  disabled={loading || verifyData.otpCode.length !== 6}
                  className="w-full h-11 bg-gradient-to-br from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    `Verify ${getPurposeText().split(' ')[0]}`
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Resend OTP Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={resendLoading || countdown > 0 || !verifyData.email}
                  className="w-full h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </div>

              {/* Back to Login/Signup */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                >
                  ← Back to {verifyData.purpose === 'REGISTRATION' ? 'Sign Up' : 'Login'}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Purpose Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verifying for: <span className="font-medium capitalize">{getPurposeText()}</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;