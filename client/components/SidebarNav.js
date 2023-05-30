/* eslint-disable @next/next/no-img-element */
import useStore from "@/store/store";
import { useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  FolderIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import Avatar from "react-avatar";
import { ToastContainer } from "react-toastify";
import { meeAPI } from "../graphql/querys/mee";
import { logout } from "../helpers/helper";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

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
  const creditLeft = useStore((state) => state.creditLeft);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const path = router.pathname;
  console.log(path);
  useEffect(() => {
    setUrl(path);
  }, [path]);

  const [topBarStyle, setTopBarStyle] = useState({});
  useEffect(() => {
    const pathname = router.pathname.split("/")[1];
    console.log(pathname);
    if (router.pathname === "/") {
      setTopBarStyle({});
      return;
    }
    setTopBarStyle({ backgroundColor: "white" });
  }, [router]);

  const updateCredit = useStore((state) => state.updateCredit);
  useEffect(() => {
    updateCredit();
  }, []);

  const navigation = [
    {
      name: "Generate New",
      href: "/",
      icon: PlusCircleIcon,
      current: url === "/",
    },
    {
      name: "Published Blogs",
      href: "/published",
      icon: PaperAirplaneIcon,
      current: url === "/published",
    },
    {
      name: "Saved Blogs",
      href: "/saved",
      icon: FolderIcon,
      current: url === "/saved",
    },
  ];
  console.log("hello");

  const navigation_bottom = [
    {
      name: "FAQ's",
      href: "/faq",
      icon: QuestionMarkCircleIcon,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Cog6ToothIcon,
      current: url === "/settings",
    },
    {
      name: "Logout",
      href: "/",
      icon: ArrowRightOnRectangleIcon,
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
    onError: ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case "UNAUTHENTICATED":
              localStorage.clear();
              window.location.href = "/";
          }
        }
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        if (
          `${networkError}` ===
          "ServerError: Response not successful: Received status code 401"
        ) {
          localStorage.clear();
          toast.error("Session Expired! Please Login Again..", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      }
    },
  });
  useEffect(() => {
    const regex = /^\/dashboard\/[6|4][a-zA-Z0-9]*$/;
    if (window.location.search === "?isPublished=true") {
      setTitle("Published Blog");
    } else if (window.location.pathname === "/saved") {
      setTitle("Saved Blog(s)");
    } else if (window.location.pathname === "/dashboard") {
      setTitle("Generated Blog(s)");
    } else if (window.location.pathname === "/settings") {
      setTitle("Settings");
    } else if (window.location.pathname === "/published") {
      setTitle("Published");
    } else if (regex.test(window.location.pathname)) {
      setTitle("Saved Blog");
    }
  }, []);

  return (
    <>
      <ToastContainer />
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
                              : "text-[#415A77] hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-[#415A77]"
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
                    <Link
                      href="/upgrade"
                      className="ml-6 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      style={{
                        margin: "0em 0.5em",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "var(--primary-blue)",
                      }}
                    >
                      UPGRADE
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[12.4rem] lg:flex-col z-20 ">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <Link href="/">
                <div className="flex flex-shrink-0 items-center justify-center px-4">
                  <img
                    className="h-12 w-auto"
                    src="/lille_logo_new.png"
                    alt="Your Company"
                  />
                </div>
              </Link>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-[#E0E6FF] text-gray-900 active"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium sidebar-links"
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
            {!meeData?.me?.isSubscribed && !meeLoading && (
              <div className="flex flex-shrink-0 pb-0 pt-4">
                <Link
                  href="/upgrade"
                  className="ml-6 inline-flex items-center rounded-md bg-[#4062FF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  style={{
                    margin: "0em 0.5em",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  UPGRADE
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 pl-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            )}
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
        <div
          className="flex flex-1 flex-col w-full fixed top-0 z-10"
          style={{
            ...topBarStyle,
            paddingLeft: "var(--sidebar-width)",
            height: "var(--topbar-height)",
          }}
        >
          <div className="sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1 ">
            <div className="py-2 pb-4">
              <div className="mx-auto max-w-7xl px-2 flex relative">
                <div className="pt-4">
                  {path !== "/" ? (
                    <button onClick={() => router.back()}>
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
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex">
                  <h1 className="text-2xl font-semibold text-gray-900 p-3">
                    {title}
                  </h1>

                  {/* <div
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
                  </div> */}
                </div>
                <div
                  style={{
                    alignSelf: "center",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2em",
                  }}
                >
                  {!meeLoading && (
                    <div
                      className="flex text-center font-bold text-sm w-auto rounded border border-gray"
                      href="/settings"
                    >
                      <div className="flex p-2 items-center">
                        <svg
                          width="21"
                          height="14"
                          viewBox="0 0 21 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2"
                        >
                          <path
                            d="M20.8023 1.556V1.70157H0V1.556C0 0.698922 0.698967 0 1.556 0H19.2464C19.4627 0 19.6666 0.0457936 19.8497 0.12067C20.4113 0.357659 20.8024 0.91102 20.8024 1.556H20.8023Z"
                            fill="#EEC800"
                          />
                          <path
                            d="M0 5.32031V12.4433C0 12.697 0.066518 12.9341 0.174827 13.1464C0.432713 13.6498 0.952828 13.9993 1.55618 13.9993H19.2465C20.1036 13.9993 20.8026 13.3045 20.8026 12.4433L20.8024 5.32031H0ZM2.49631 8.45323H5.54181C5.7748 8.45323 5.9578 8.64042 5.9578 8.86922C5.9578 9.09803 5.77479 9.28521 5.54181 9.28521H2.49631C2.26751 9.28521 2.08032 9.09803 2.08032 8.86922C2.08014 8.64042 2.26751 8.45323 2.49631 8.45323ZM10.0057 11.3655H2.49631C2.26751 11.3655 2.08032 11.1783 2.08032 10.9495C2.08032 10.7207 2.26751 10.5335 2.49631 10.5335H10.0057C10.2346 10.5335 10.4217 10.7207 10.4217 10.9495C10.4217 11.1783 10.2346 11.3655 10.0057 11.3655ZM16.8372 11.7941C16.4045 11.7941 15.9843 11.6443 15.6555 11.3697C15.331 11.636 14.915 11.7941 14.4657 11.7941C13.4298 11.7941 12.5851 10.9496 12.5851 9.9093C12.5851 8.86923 13.4296 8.02454 14.4657 8.02454C14.915 8.02454 15.3311 8.18265 15.6555 8.44889C15.9843 8.17429 16.4045 8.02454 16.8372 8.02454C17.8772 8.02454 18.7219 8.86906 18.7219 9.91349C18.7219 10.9496 17.8772 11.7941 16.8372 11.7941V11.7941Z"
                            fill="#EEC800"
                          />
                          <path
                            d="M0 2.53711H20.8027V4.49257H0V2.53711Z"
                            fill="#EEC800"
                          />
                        </svg>
                        {console.log("creditLeft", creditLeft)}
                        {meeData?.me?.totalCredits - creditLeft}/
                        {meeData?.me?.totalCredits} Credits used
                      </div>
                    </div>
                  )}
                  {!meeLoading && (
                    <Link
                      // className=" w-[50px]"
                      href="/settings"
                      onMouseEnter={() => {
                        document
                          .getElementById("trialenddiv")
                          ?.classList.remove("hidden");
                      }}
                      onMouseLeave={() => {
                        document
                          .getElementById("trialenddiv")
                          ?.classList.add("hidden");
                      }}
                    >
                      <Avatar
                        size="50"
                        name={meeData?.me?.name + " " + meeData?.me?.lastName}
                        src={meeData?.me?.profileImage}
                        round={true}
                      />
                      {/* {meeData?.me?.paid || (
                        <div
                          id="trialenddiv"
                          className="hidden"
                          style={{
                            border: "1px solid",
                            fontSize: "0.65em",
                            width: "max-content",
                            borderRadius: "5px",
                            textAlign: "center",
                            padding: "0.25em 0.75em",
                            position: "absolute",
                            top: "105%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: "100",
                            backgroundColor: "#EEC800",
                          }}
                        >
                          Upgrade Now!
                        </div>
                      )} */}
                    </Link>
                  )}
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
