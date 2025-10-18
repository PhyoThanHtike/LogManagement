import React, { type ReactNode } from "react";
import { useUser } from "@/store/UserStore";
import { Outlet } from "react-router-dom";
import ErrorPage from "@/Pages/ErrorPage";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useUser();

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