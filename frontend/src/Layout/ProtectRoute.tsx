import React, { type ReactNode } from "react";
import { useUserStore } from "@/store/UserStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useUserStore();
  const location = useLocation();

  console.log(user);

  if (!user.isAuthenticated) {
    return (
      <>
        {/* {toast.error("You need to login to your account.")} */}
        <Navigate to="/auth" state={{ from: location }} replace />
      </>
    );
  }
  return children || <Outlet/>;
};

export default ProtectRoute;