import axiosInstance from "@/Axios/axios";
// import { setLogOutUser } from "@/store/slices/UserSlice";

type Purpose = "REGISTRATION" | "PASSWORD_RESET";

interface loginData {
  email: String;
  password: String;
}

interface signupData {
  name: string;
  email: string;
  tenant: string;
  password: string;
}

interface verifyOtpData {
  email: string;
  otpCode: string;
  purpose: Purpose;
}

interface resendOtpData {
  email: string;
  purpose: Purpose;
}

interface resetPasswordData {
    email: string;
    newPassword: string;
}

export interface loginResponse {
  success: boolean;
  message: string;
  user: any;
}
export interface errorResponse {
  success: boolean;
  message: string;
}

export const Login = async (
  credentials: loginData
): Promise<loginResponse | errorResponse> => {
  try {
    const response = await axiosInstance.post("/api/auth/login", credentials);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "Login failed",
      success: error.response.data.success || false,
    };
  }
};

export const SignUp = async (
  credentials: signupData
): Promise<loginResponse | errorResponse> => {
  try {
    const response = await axiosInstance.post("/api/auth/signup", credentials);
    return response.data;
  } catch (error: any) {
    // The request was made and the server responded with a status code
    return {
      message: error.response.data.message || "Signup failed",
      success: error.response.data.status || false,
    };
  }
};

export const forgotPassword = async (data: resendOtpData) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/forgot-password",
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "Send OTP failed",
      success: error.response.data.status || false,
    };
  }
};

export const resetPassword = async (data: resetPasswordData) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/reset-password",
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "Send OTP failed",
      success: error.response.data.status || false,
    };
  }
};

export const verifyOTP = async (
  data: verifyOtpData
): Promise<loginResponse | errorResponse> => {
  try {
    const response = await axiosInstance.post("/api/auth/verify-otp", data);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "OTP verification failed",
      success: error.response.data.status || false,
    };
  }
};

export const resendOTP = async (
  data: resendOtpData
): Promise<loginResponse | errorResponse> => {
  try {
    const response = await axiosInstance.post("/api/auth/resend-otp", data);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response.data.message || "OTP verification failed",
      success: error.response.data.status || false,
    };
  }
};

// export const SignOut = async () => {
//   try {
//     const response = await axiosInstance.post("/api/auth/logout", {
//       withCredentials: true,
//     });
//     store.dispatch(setLogOutUser());
//     window.location.href = "/auth";
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error?.response?.data?.message || "Failed to sign out");
//   }
// };

// export const GetUser = async (): Promise<GetUserResponse> => {
//   try {
//     const response = await axiosInstance.get("/api/auth/getUser");
//     return response.data;
//   } catch (error: any) {
//     const err: errorResponse = {
//       message: error.response?.data?.message || "Failed getting all user info",
//       success: error.response?.data?.success || false,
//     };

//     throw new Error(err.message); // ✅ Throw instead of return
//   }
// };
