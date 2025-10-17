import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Pages/Dashboard";
import { Suspense } from "react";
import Auth from "./Pages/Auth/Auth";
import ErrorPage from "./Pages/ErrorPage";
import RegisterOTPVerify from "./Pages/Auth/VerifyOTP";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";
import Management from "./Pages/Management";

// triggering CI
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // <Outlet /> renders here
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "management",
        element: <Management />,
      }
    ],
  },
  {
    path: "auth",
    element: <Auth />,
  },
  {
    path: "forgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "resetPassword",
    element: <ResetPassword />,
  },
  {
    path: "verifyOTP/:purpose",
    element: <RegisterOTPVerify />,
  },
]);

function App() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;
