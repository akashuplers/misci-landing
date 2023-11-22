import Link from "next/link";
import { useState } from "react";
import {
ChevronDownIcon,
} from "@heroicons/react/20/solid";

const DesktopNavigation = ({
  setAuthenticationModalOpen,
  setAuthneticationModalType,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="mx-auto max-w-full 2xl:max-w-[95rem] px-4 sm:px-6 lg:px-8">
      <div className="h-[52.56px] justify-between items-center flex">
        <Link href="/">
          <img className="w-[104.90px] h-full" src="/lille_logo_new.png" />
        </Link>
         <div className="justify-center items-center gap-6 flex">
          {desktopNavigationRoutes.map((route, index) => (
            <div
              key={route.name}
              className="group p-2 justify-center items-center gap-2.5 flex relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={route.href}>
                <div className="text-slate-600 text-[16px] font-normal flex align-middle items-center">
                  {route.name}
                  {route.subNav && <ChevronDownIcon className="text-[#1c1c1c] ml-2" height={15} width={15} />}
                </div>
              </Link>
              {/* Sub-navigation */}
              {route.subNav && hoveredIndex === index && (
                <div className="absolute top-full left-0 mt-[0px] w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition ease-in-out duration-200 z-10">
                  <div className="py-1">
                    {route.subNav.map((subItem, subIndex) => (
                      <a key={subIndex} href={subItem.href}>
                        <a className="block px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white transition ease-in-out duration-150">
                          {subItem.name}
                        </a>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="justify-center items-center gap-6 flex">
          <button
            onClick={() => {
              setAuthenticationModalOpen(true);
              setAuthneticationModalType("login");
            }}
            className="p-2 justify-center items-center gap-2.5 flex"
          >
            <span className="text-slate-600 text-[16px] font-normal">
              Login
            </span>
          </button>
        <button
          onClick={() => {
            setAuthenticationModalOpen(true);
            setAuthneticationModalType("signup");
          }}
          className="px-5 py-2.5 text-white bg-indigo-600 border border-indigo-600 rounded-lg shadow-md flex justify-center items-center gap-2.5 hover:bg-indigo-700 hover:shadow-lg hover:border-indigo-700 active:bg-indigo-800 active:shadow-inner transition-all ease-in-out duration-200 transform hover:scale-105"
        >
          <span className="text-[16px] font-bold">
            Start your free trial today
          </span>
        </button>

        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;
var desktopNavigationRoutes = [
  {
    name: "Features",
    href: "/features",
    current: false,
  },
  {
    name: "Value",
    href: "/aboutus",
    current: false,
  },
  {
    name: "AI SaaS Apps",
    href: "http://saleslille.ai",
    current: false,
    subNav:[
    {
      name: "SalesLille.ai",
      href: "http://saleslille.ai",
    },
    {
      name: "Lille.ai",
      href: "http://lille.ai", 
    }
    ],
  },
  {
    name: "Community",
    href: "/library",
    current: false,
     subNav:[
    {
      name: "Library",
      href: "/library",
    },
    {
      name: "Blogs",
      href: "https://blogs.lille.ai",
    },
     ],
  },
  {
    name: "Pricing",
    href: "/pricing",
    current: false,
  },
  {
    name: "FAQs",
    href: "/faq",
    current: false,
  },
];
