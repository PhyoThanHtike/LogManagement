import React, { type ReactNode } from "react";
import { useUser } from "@/store/UserStore";
import { Navigate, Outlet } from "react-router-dom";
// import { toast } from "sonner";
import ErrorPage from "@/Pages/ErrorPage";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useUser();
//   const location = useLocation();

  console.log(user);

  if (user && user.role != 'ADMIN') {
    return (
      <>
        <ErrorPage/>
      </>
    );
  }
  return children || <Outlet/>;
};

export default ProtectRoute;