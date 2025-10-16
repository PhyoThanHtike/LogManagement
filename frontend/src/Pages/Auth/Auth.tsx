import { Login, SignUp } from "@/apiEndpoints/Auth";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/context/ThemeToggle";
import TenantDropdown from "@/AppComponents/Dropdowns/TenantDropdown";

import { useUserStore } from "@/store/UserStore";
import { useFilterStore } from "@/store/FilterStore";

type authMode = "login" | "signup";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData extends LoginFormData {
  name: string;
  tenant: string;
  email: string;
  password: string;
}

const setUser = useUserStore.getState().setUser;
const setTenant = useFilterStore.getState().setTenant;

const Auth = () => {
  const [mode, setMode] = useState<authMode>("login");
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState<SignupFormData>({
    name: "",
    tenant: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (mode == "login") {
      setLoginData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setSignUpData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTenantChange = (value: string) => {
    setSignUpData((prev) => ({
      ...prev,
      tenant: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        console.log(loginData);
        const response = await Login(loginData);
        if ("user" in response) {
          toast.success("Login Successful");
          setUser(response.user);
          if (response.user.role !== "ADMIN") {
            setTenant(response.user.tenant);
          }
          navigate("/dashboard");
        } else {
          toast.error(response.message);
        }
      } else {
        console.log(signUpData);
        const response = await SignUp(signUpData);
        if (response.success) {
          toast.success(response.message);
          navigate("/verifyOTP/REGISTRATION", { state: { email: signUpData.email } });
        } else {
          toast.error(response.message);
        }

        // Pass email to verify OTP page
        navigate("/verifyOTP/REGISTRATION", {
          state: { email: signUpData.email },
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError(null);
  };

  const currentFormData = mode === "login" ? loginData : signUpData;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-50 via-purple-50 to-blue-50 
    dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800 transition-colors duration-300"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-50 dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200  p-8 transition-colors duration-300">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          {/* Logo with animation */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center justify-center mb-8"
          >
            {/* <img
              src={
                // user.image
                "https://www.pngmart.com/files/7/Green-Energy-PNG-Photos.png"
              }
              alt="Logo"
              className="w-12"
              referrerPolicy="no-referrer"
            /> */}
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              <motion.span
                className="text-green-700 dark:text-emerald-700"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                Log
              </motion.span>
              ify
            </span>
          </motion.div>

          <h2 className="text-xl text-center text-gray-800 dark:text-gray-100 mb-6">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={signUpData.name}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tenant
                  </label>
                  <TenantDropdown
                    value={signUpData.tenant}
                    onValueChange={handleTenantChange}
                  />
                </motion.div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={currentFormData.email}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={currentFormData.password}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={
                  mode === "login" ? "Enter your password" : "Create a password"
                }
              />
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                  onClick={() => navigate("/forgotPassword")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                loading
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
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium hover:underline"
                >
                  Create new
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
