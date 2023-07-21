/* eslint-disable @next/next/no-img-element */
import ReactLoading from "react-loading";
import useStore, {
  useBlogDataStore,
  useTabOptionStore,
  useThreadsUIStore,
  useTwitterThreadStore,
} from "@/store/store";
import { useQuery } from "@apollo/client";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ClockIcon,
  FolderIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import { ToastContainer, toast } from "react-toastify";
import { meeAPI } from "../graphql/querys/mee";
import { logout } from "../helpers/helper";
import { LocalCreditCardIcon } from "./localicons/localicons";
import useUserTimeSave from "@/hooks/useUserTimeSave";

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
      name: "Published Contents",
      href: "/published",
      icon: PaperAirplaneIcon,
      current: url === "/published",
    },
    {
      name: "Saved Contents",
      href: "/saved",
      icon: FolderIcon,
      current: url === "/saved",
    },

    {
      name: "FAQs",
      href: "/faq",
      icon: QuestionMarkCircleIcon,
    },
  ];

  const navigation_bottom = [
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
      console.log("GRAPH QL ERRORS");
      console.log(graphQLErrors);
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
      setTitle("Published Content");
    } else if (window.location.pathname === "/saved") {
      setTitle("Saved Content(s)");
    } else if (window.location.pathname === "/dashboard") {
      setTitle("Generated Content");
    } else if (window.location.pathname === "/settings") {
      setTitle("Settings");
    } else if (window.location.pathname === "/published") {
      setTitle("Published Content(s)");
    } else if (regex.test(window.location.pathname)) {
      setTitle("Saved Content");
    }
  }, []);

  const sideBarHeightRef = useRef(null);
  const { blogData, setBlogData } = useBlogDataStore();

  useEffect(() => {
    const MINIMUM_HEIGHT = 125;
    const elementHeight =
      sideBarHeightRef.current.offsetHeight > MINIMUM_HEIGHT
        ? sideBarHeightRef.current.offsetHeight
        : MINIMUM_HEIGHT;
    console.log(elementHeight);
    console.log("element height");
    document.documentElement.style.setProperty(
      "--my-mobile-sidebar-height",
      `${elementHeight}px`
    );
  }, []);
  const { setShowTwitterThreadUI } = useThreadsUIStore();
  const { option, setOption } = useTabOptionStore();
  const { setTwitterThreadData } = useTwitterThreadStore();
  function handleEditorReset() {
    setOption("blog");
    setBlogData([]);
    setShowTwitterThreadUI(false);
    setTwitterThreadData([]);
  }
  useEffect(() => { console.log('mee data'); console.log(meeData) }, [meeData]);
  const [selectedOption, setSelectedOption] = useState('today');
  const [savedTime, setSavedTime] = useState('00:00');

  // Function to update the saved time based on the selected option
  const updateSavedTime = (option) => {
    // You can implement the logic to fetch the saved time from the API based on the selected option
    // For now, we'll just use a dummy value.
    let newSavedTime = '00:00';
    if (option === 'week') {
      newSavedTime = '10:30';
    } else if (option === 'month') {
      newSavedTime = '25:15';
    }

    setSavedTime(newSavedTime);
  };
  const { userTimeSave, loading: userTimeSaveLoading, error, refreshData:refreshDataForUserTime} = useUserTimeSave();
  useEffect(()=>{
    refreshDataForUserTime();
  },[])
  return (
    <>
      <ToastContainer />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 mt-[70px] lg:mt-0 lg:hidden"
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

            <div className="fixed inset-0 z-40 flex flex-row-reverse lg:flex">
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
                    <div className="absolute top-0 -left-16 lg:right-0 -mr-12 pt-2">
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
                          onClick={handleEditorReset}
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
                    onClick={handleEditorReset}
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
          className="hidden lg:flex flex-1 flex-row lg:flex-col w-full fixed top-0 z-10 "
          style={{
            ...topBarStyle,
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
          <main className="flex-1" ref={sideBarHeightRef}>
            <div className="py-2 pb-4 w-[85%] float-right">
              <div className="mx-auto max-w-7xl px-2 flex relative">
                <div className="pt-4">
                  {path !== "/" ? (
                    <button
                      onClick={() => {
                        handleEditorReset();
                        router.back();
                      }}
                    >
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
                  {
                    meeData?.me?.totalCredits  && <UserSaveTime data={userTimeSave} dataLoading={userTimeSaveLoading} />
                  }
                  {!meeLoading && (
                    <div
                      className="flex text-center font-bold text-sm w-auto rounded border border-gray"
                      href="/settings"
                    >
                      <div className="flex p-2 items-center">
                        <LocalCreditCardIcon />
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
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        <div
          className="flex lg:hidden flex-1 flex-col lg:flex-col w-full fixed top-0 z-10 mobile_sidebar bg-white"
          style={{
            ...topBarStyle,
          }}
          ref={sideBarHeightRef}
        >
          <div className="flex-row flex">
            <div className="lg:hidden flex flex-row justify-center items-center py-2 pb-4">
              <Link href={"/"}>
                <img
                  className="h-8 w-auto"
                  src="/lille_logo_new.png"
                  alt="Your Company"
                />
              </Link>
            </div>
            <main className="flex-1 flex-col">
              <div className="py-2 pb-4">
                <div className="mx-auto max-w-7xl px-2 flex relative">
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
                          <LocalCreditCardIcon />
                          {meeData?.me?.totalCredits - creditLeft}/
                          {meeData?.me?.totalCredits} Credits used
                        </div>
                      </div>
                    )}
                    {/* {!meeLoading && (
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

                      </Link>
                    )} */}
                    <button
                      type="button"
                      className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <span className="sr-only">Open sidebar</span>
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
          {path !== "/" ? (
            <div className="flex flex-row px-2 ">
              <div className="pt-4">
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
              </div>
              <div className="flex">
                <h1 className="text-2xl font-semibold text-gray-900 p-3">
                  {title}
                </h1>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}


export function UserSaveTime(data, dataLoading) {
  // const [selectedOption, setSelectedOption] = useState(data[);
  // firstdata
  console.log(data.data);
  data = data.data;
  const [selectedOption, setSelectedOption] = useState('Day');

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-indigo-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:opacity-75 border-indigo-600 border-l-8  outline-white">
          {/* small width verticial line */}
          <ClockIcon className="h-5 w-5" aria-hidden="true" />
          <span className="font-light">Time Saved for the {selectedOption}</span> {data == null || dataLoading == true ? <ReactLoading
            width={25}
            height={25}
            round={true}
          /> :
            data && `- ${data[selectedOption]?.hours} h : ${data[selectedOption]?.minutes} m`}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      {
        (dataLoading == false ||  data !== null) &&
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        { 
          Object.keys(data).map((key, index) => {
            return (
              <Menu.Item key={index}>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                    onClick={() => {
                      setSelectedOption(key);
                      console.log(key);
                      console.log(data[key]);
                    }}
                  >
                    <div className="flex text-indigo-600 justify-between items-center">
                      <div>{key}</div>
                      <div>{data[key]?.seconds}</div>
                    </div>
                  </a>
                )}
              </Menu.Item>
            )
          })
        }

      </div>
    </Menu.Items>
  </Transition>
}
    </Menu>
  )
}