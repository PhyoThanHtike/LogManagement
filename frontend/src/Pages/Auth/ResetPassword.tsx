import { resetPassword } from "@/apiEndpoints/Auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/context/ThemeToggle";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// type Purpose = "REGISTRATION" | "PASSWORD_RESET";

interface resetPasswordData {
  email: string;
  newPassword: string;
}

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [retypePassword, setRetypePassword] = useState("");

  const location = useLocation();
  const [resetData, setResetData] = useState<resetPasswordData>({
    email: location.state?.email,
    newPassword: "",
  });

  const navigate = useNavigate();

  // Check if passwords match
  const passwordsMatch = resetData.newPassword === retypePassword;
  // Check if form is valid (both fields filled and passwords match)
  const isFormValid = resetData.newPassword && retypePassword && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match before proceeding
    if (!passwordsMatch) {
      toast.error("Passwords do not match!");
      return;
    }

    console.log(resetData);
    setLoading(true);
    try {
      const response = await resetPassword(resetData);
      if (response.success) {
        toast.success(response.message);
        setLoading(false);
        navigate("/auth");
      }
    } catch (error) {
      toast.error("Unexpected error occurred!");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRetypePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRetypePassword(e.target.value);
  };

  console.log(resetData);

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
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
            <div className="flex justify-center items-center">
              <div>
                <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  Enter your new password
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={resetData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your new password"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Retype Password
                </label>
                <input
                  id="retypePassword"
                  name="retypePassword"
                  type="password"
                  required
                  value={retypePassword}
                  onChange={handleRetypePasswordChange}
                  className={`w-full bg-white dark:bg-gray-700 border rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    retypePassword && !passwordsMatch
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  }`}
                  placeholder="Retype your new password"
                />
                {retypePassword && !passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    Passwords do not match
                  </motion.p>
                )}
                {retypePassword && passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-green-500 text-sm mt-1"
                  >
                    Passwords match
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                disabled={loading || !isFormValid}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  loading || !isFormValid
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-br from-green-600 to-cyan-600 hover:bg-gradient-to-tl hover:from-green-700 hover:to-cyan-700 shadow-lg"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>
            {/* Back to Login/Signup */}
            <div className="pt-2 flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
              >
                ← Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;