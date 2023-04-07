import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  FolderIcon,
  PlusCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../helpers/helper";
import Link from "next/link";
import Avatar from "react-avatar";
import { useQuery } from "@apollo/client";
import { meeAPI } from "../graphql/querys/mee";
import {
  AiFillCheckCircle,
  AiOutlineLinkedin,
  AiOutlineTwitter,
} from "react-icons/ai";
import { useRouter } from "next/router";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  var getToken, linkedInUserData;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
    linkedInUserData = localStorage.getItem("linkedInAccessToken");
  }
  const [url, setUrl] = useState("");
  const router = useRouter();
  const path = router.pathname;
  useEffect(() => {
    setUrl(path);
  }, [path]);

  const navigation = [
    {
      name: "Generate New",
      href: "/",
      icon: PlusCircleIcon,
      current: url === "/",
    },
    {
      name: "Published Blogs",
      href: "#",
      icon: PaperAirplaneIcon,
      current: url === "/publised",
    },
    {
      name: "Saved Blogs",
      href: "/saved",
      icon: FolderIcon,
      current: url === "/saved",
    },
  ];

  const navigation_bottom = [
    {
      name: "Setting",
      href: "/settings",
      icon: Cog6ToothIcon,
      current: url === "/settings",
    },
    {
      name: "Logout",
      href: "/",
      icon: PaperAirplaneIcon,
      current: false,
    },
  ];

  const {
    data: meeData,
    loading: meeLoading,
    error: meeError,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
  });
  useEffect(() => {
    if (window.location.pathname === "/saved") {
      setTitle("Saved Articles");
    } else if (window.location.pathname === "/dashboard") {
      setTitle("Generated Blogs(s)");
    } else if(window.location.pathname === "/settings") {
      setTitle("Settings")
    }
  }, []);

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <Link href={"/"}>
                        <img
                          className="h-8 w-auto"
                          src="/lille_logo_new.png"
                          alt="Your Company"
                        />
                      </Link>
                    </div>
                    <nav className="mt-5 space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="flex flex-shrink-0 pb-0 pt-4">
                    <a
                      href="#"
                      className="ml-6 inline-flex items-center rounded-md bg-[#4A3AFE] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      UPGRADE
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Link href={"/"}>
                  <img
                    className="h-12 w-auto"
                    src="/lille_logo_new.png"
                    alt="Your Company"
                  />
                </Link>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 pb-0 pt-4">
              <a
                href="#"
                className="ml-6 inline-flex items-center rounded-md bg-[#4A3AFE] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                UPGRADE
              </a>
            </div>
            <nav className="mt-5 space-y-1 bg-white px-2 pb-8">
              {navigation_bottom.map((item) => (
                <Link
                  onClick={() => {
                    logout(item);
                  }}
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 h-6 w-6 flex-shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex relative">
                <div className="pt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex">
                  <h1 className="text-2xl font-semibold text-gray-900 p-3">
                    {title}
                  </h1>

                  <div
                    // className={styles.linkedInWrapper}
                    style={{
                      position: "absolute",
                      right: "200px",
                      height: "50px",
                    }}
                    onMouseEnter={() => {
                      // setHover("linkedin");
                    }}
                    onMouseLeave={() => {
                      // setHideHover();
                    }}
                  >
                    <AiOutlineLinkedin
                      size={35}
                      // className={`${styles.icon} ${styles.linkedIn}`}

                      onClick={() =>
                        // handleHandleSocialLogin(SocialTypes.LINKEDIN)
                        {}
                      }
                      onMouseEnter={() => {
                        // setHover("linkedin");
                      }}
                      onMouseLeave={() => {
                        // setHideHover();
                      }}
                    />
                    {linkedInUserData ? (
                      // <AiFillCheckCircle className={styles.checkLinkdedin} />
                      <AiFillCheckCircle />
                    ) : (
                      ""
                    )}
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      right: "20px",
                      height: "50px",
                    }}
                    className=" w-[50px]"
                  >
                    <Avatar
                      name={meeData?.me?.name + " " + meeData?.me?.lastName}
                      round={true}
                    />
                  </div>
                </div>
              </div>

              {/* <div className="r-0  h-[50px] w-[50px] "></div> */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
