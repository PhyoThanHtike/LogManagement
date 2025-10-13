import "./App.css";
import { Button } from "@/components/ui/button";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Pages/Dashboard";
import { Suspense } from "react";
import Auth from "./Pages/Auth/Auth";
// import About from "./Pages/About";
// import Products from "./Pages/Products";
// import Order from "./Pages/Order";
// import History from "./Pages/History";
// import Profile from "./Pages/Profile";
// import ProtectRoute from "./Layout/ProtectRoute";
// import ProductDetail from "./Pages/ProductDetail";
// import OrderForm from "./Pages/OrderForm";
// import AuthSuccess from "./Auth/AuthSuccess";
import ErrorPage from "./Pages/ErrorPage";
import RegisterOTPVerify from "./Pages/Auth/VerifyOTP";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // <Outlet /> renders here
    errorElement: <ErrorPage />,
    children: [
      // {
      //   element: (
      //       <ProtectRoute>
      //         <HomeLayout />
      //       </ProtectRoute>
      //   ),
      //   children: [
      //     { index: true, element: <Dashboard/> },
      //     { path: "products", element: <Products/> },
      //     {
      //       path: "products/:id",
      //       element: <ProductDetail />,
      //     },
      //     { path: "order", element: <Order/> },
      //     {
      //       path: "order/form/:id",
      //       element: <OrderForm />,
      //     },
      //     { path: "history", element: <History/> },
      //     { path: "profile", element: <Profile/> },
      //   ],
      // },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      // {
      //   path: "auth/success",
      //   element: <AuthSuccess/>,
      // }
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
