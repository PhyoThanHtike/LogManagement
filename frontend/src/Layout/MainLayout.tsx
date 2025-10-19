import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 dark:bg-neutral-950">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
