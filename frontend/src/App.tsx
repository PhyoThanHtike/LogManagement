import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

// Layouts
import MainLayout from "./Layout/MainLayout";
import ProtectRoute from "./Layout/ProtectRoute";
import ProtectUser from "./Layout/ProtectUser";

// Lazy-loaded pages for better performance
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Auth = lazy(() => import("./Pages/Auth/Auth"));
const ErrorPage = lazy(() => import("./Pages/ErrorPage"));
const RegisterOTPVerify = lazy(() => import("./Pages/Auth/VerifyOTP"));
const ForgotPassword = lazy(() => import("./Pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/Auth/ResetPassword"));
const Management = lazy(() => import("./Pages/Management"));

//  animated loader
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <motion.div
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectRoute>
        <MainLayout />
      </ProtectRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Dashboard /> },
      {
        path: "/management",
        element: (
          <ProtectUser>
            <Management />
          </ProtectUser>
        ),
      },
    ],
  },
  { path: "/auth", element: <Auth /> },
  { path: "/forgotPassword", element: <ForgotPassword /> },
  { path: "/resetPassword", element: <ResetPassword /> },
  { path: "/verifyOTP/:purpose", element: <RegisterOTPVerify /> },
]);

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
