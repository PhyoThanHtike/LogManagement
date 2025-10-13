import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
  return (
    <>
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
              className="h-8 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              data-slot="icon"
              aria-hidden="true"
              className="size-6"
            >
              <path
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <a href="#" className="text-sm/6 font-semibold text-gray-900">
            Product
          </a>
          <a href="#" className="text-sm/6 font-semibold text-gray-900">
            Features
          </a>
          <a href="#" className="text-sm/6 font-semibold text-gray-900">
            Marketplace
          </a>
          <a href="#" className="text-sm/6 font-semibold text-gray-900">
            Company
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* <Link to={"/auth"}>
              <button className="text-sm/6 font-semibold text-gray-900 hover:cursor-pointer">
                Log in <span aria-hidden="true">&rarr;</span>
              </button>
          </Link> */}
            <Button onClick={()=>{
                navigate("/auth")
            }}>
                Login
            </Button>

        </div>
      </nav>
    </>
  );
};

export default Navbar;
