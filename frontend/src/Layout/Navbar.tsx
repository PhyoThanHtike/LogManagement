import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
// import { SignOut } from "@/apiEndpoints/Auth";
import { toast } from "sonner";
import { useUser, useUserStore } from "@/store/UserStore";
import { useFilterStore } from "@/store/FilterStore";
import { ThemeToggle } from "@/context/ThemeToggle";
import TenantFilter from "@/AppComponents/Dropdowns/TenantFilter";
import { SignOut } from "@/apiEndpoints/Auth";
import CustomAlertDialog from "@/AppComponents/Dialogs/CustomAlertDialog";

const Navbar = () => {
  // const userId = useSelector((state: any) => state.user.userId);
  // const profilePicture = useSelector((state: any)=> state.user.profilePicture);

  const user = useUser();
  const clearUser = useUserStore.getState().clearUser;
  console.log(user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // const [activeLink, setActiveLink] = useState("");

  // const handleTenantChange = (value: string) => {
  //   setTenant(value);
  // };

  const filters = useFilterStore();
  useEffect(() => {
    if (user) {
      filters.initializeTenant(user.role, user.tenant);
    }
  }, [user, filters]); // Add filters to dependencies
  const handleSignOut = async () => {
    try {
      const response = await SignOut();
      clearUser();
      toast.success(response.message);
      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   setActiveLink(window.location.pathname);
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full bg-gray-500 dark:bg-gray-600 backdrop-blur-lg supports-[backdrop-filter]:bg-gray-200/80 dark:supports-[backdrop-filter]:bg-blue-950/80"
    >
      <div className="container w-[90%] mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo - Preserved original styling */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
        >
          <Link
            to="/"
            className="flex items-center"
            // onClick={() => setActiveLink("")}
          >
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
          </Link>
        </motion.div>

        {/* User Profile with Enhanced Dropdown */}
        <div className="flex justify-between items-center gap-4">
          <TenantFilter
            value={filters.tenant}
            onValueChange={filters.setTenant}
            userRole={user?.role}
            userTenant={user?.tenant}
          />
          <ThemeToggle />
          <div className="relative" ref={dropdownRef}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDropdown}
            >
              {user && user.userId ? (
                <button className="flex items-center gap-2 focus:outline-none">
                  <div className="relative h-10 w-10 rounded-full">
                    <img
                      src="https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"
                      alt="User profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-purple-500/30 hover:border-purple-500/60 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                </button>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/auth"
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all"
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </motion.div>
            <AnimatePresence>
              {isDropdownOpen && user && user.userId && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-gray-800 border border-gray-700 z-50 overflow-hidden"
                >
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">
                        {user.userName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/"
                      className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-all"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/management"
                      className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-all"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Management
                    </Link>
                    <CustomAlertDialog
                      onLogOut={handleSignOut}
                      trigger={
                        <button
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 w-full transition-all"
                          onClick={() => {
                            setIsDropdownOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      }
                      description="You gonna be logged out from Logify Dashboard"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
