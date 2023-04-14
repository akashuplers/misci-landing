/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Fragment, useState } from "react";
import { Dialog, Switch, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Layout from "../components/Layout";
import { useQuery } from "@apollo/client";
import { meeAPI } from "../graphql/querys/mee";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import LoaderPlane from "../components/LoaderPlane";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ReactLoading from "react-loading";
import fillerProfileImage from "../public/profile-filler.jpg"
import axios from "axios";

const navigation = [
  { name: "Home", href: "#", icon: HomeIcon, current: false },
  { name: "Jobs", href: "#", icon: BriefcaseIcon, current: false },
  {
    name: "Applications",
    href: "#",
    icon: DocumentMagnifyingGlassIcon,
    current: false,
  },
  {
    name: "Messages",
    href: "#",
    icon: ChatBubbleOvalLeftEllipsisIcon,
    current: false,
  },
  { name: "Team", href: "#", icon: UsersIcon, current: false },
  { name: "Settings", href: "#", icon: CogIcon, current: true },
];

const secondaryNavigation = [
  { name: "Help", href: "#", icon: QuestionMarkCircleIcon },
  { name: "Logout", href: "#", icon: ArrowLeftOnRectangleIcon },
];

const tabs = [
  { name: "General", href: "", current: true },
  // { name: "Password", href: "#", current: false },
  // { name: "Notifications", href: "#", current: false },
  // { name: "Plan", href: "#", current: false },
  // { name: "Billing", href: "#", current: false },
  // { name: "Team Members", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [updateProfileData, setUpdateProfileData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
  });
  const [updateLoader, setUpdateLoader] = useState(false);

  const [automaticTimezoneEnabled, setAutomaticTimezoneEnabled] =
    useState(true);
  const [autoUpdateApplicantDataEnabled, setAutoUpdateApplicantDataEnabled] =
    useState(false);

  const [linkedin, setlinkedin] = useState(false);

  useEffect(() => {
    var linkedInAccessToken;
    if (typeof window !== "undefined") {
      linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
      if (linkedInAccessToken) setlinkedin(true);
    }
  }, []);

  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

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
    if (meeData != null) {
      setUpdateProfileData({
        firstName: meeData.me.name,
        lastName: meeData.me.lastName,
        profileImage: meeData.me.profileImage ?? fillerProfileImage.src,
      });
    }
  }, [meeData]);

  console.log("meeData", meeData);

  const handleUpdate = (e) => {
    if (
      meeData.me.name === updateProfileData.firstName &&
      meeData.me.lastName === updateProfileData.lastName &&
      meeData.me.profileImage === updateProfileData.profileImage
    ) {
      toast.success("Profile up to Date!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    setUpdateLoader(true);
    axios.put(API_BASE_PATH + API_ROUTES.UPDATE_PROFILE, updateProfileData, {
      headers: {
        Authorization: `Bearer ${getToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.data.errors === false) {
          toast.success(res.data.message, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } else {
          toast.error(res.data.message, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      })
      .catch((err) => console.error(err.message))
      .finally(() => setUpdateLoader(false));
  };

  const handleInputChange = ({ target }) => {
    let { value, name } = target;

    if (target.id === "profileImageInput") {
      const selectedfile = target.files[0];
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const srcData = fileReader.result;
        // console.log('base64:', srcData)

        const myHeaders = {
          "Content-Type": "application/json",
        };

        const imageRaw = {
          path: "profile",
          base64: srcData,
        };

        const config = {
          method: "POST",
          url: API_BASE_PATH + API_ROUTES.IMAGE_UPLOAD,
          headers: myHeaders,
          data: imageRaw,
          redirect: "follow",
        };

        axios(config)
          .then((response) => {
            console.log(response.data);
            setUpdateProfileData((prev) => {
              return {
                ...prev,
                profileImage: response.data.url,
              };
            });
          })
          .catch((error) => {
            console.log("error", error);
          });
      };

      fileReader.readAsDataURL(selectedfile);
      return;
    }

    setUpdateProfileData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  useEffect(() => {
    console.log(updateProfileData);
  }, [updateProfileData]);

  function handleDate(){
    const lastInvoicedDate = new Date(meeData?.me?.lastInvoicedDate)
    console.log(lastInvoicedDate.toLocaleDateString('in-IN'))
    const upcomingInvoicedDate = new Date(meeData?.me?.upcomingInvoicedDate)
    console.log(upcomingInvoicedDate.toLocaleDateString('in-IN'))
    const string = <span style={{fontWeight:"600"}}>``</span>
    return `You are on a ${string} plan`
  }

  if (meeLoading) return <LoaderPlane />;

  return (
    <>
      <div>
        <ToastContainer />
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
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-14 p-1">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Close sidebar</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=600"
                      alt="Easywire"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="flex h-full flex-col">
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "border-purple-600 bg-purple-50 text-purple-600"
                                : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                              "group flex items-center border-l-4 py-2 px-3 text-base font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            <item.icon
                              className={classNames(
                                item.current
                                  ? "text-purple-500"
                                  : "text-gray-400 group-hover:text-gray-500",
                                "mr-4 h-6 w-6 flex-shrink-0"
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        ))}
                      </div>
                      <div className="mt-auto space-y-1 pt-10">
                        {secondaryNavigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="group flex items-center border-l-4 border-transparent py-2 px-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <item.icon
                              className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Layout />

        {/* Content area */}
        <div className="lg:pl-64">
          <div className="lg:px-8">
            <div className="mx-auto flex flex-col lg:max-w-4xl">
              <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
                <button
                  type="button"
                  className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex flex-1 justify-between px-4 lg:px-0">
                  <div className="flex flex-1">
                    <form
                      className="flex w-full lg:ml-0"
                      action="#"
                      method="GET"
                    >
                      <label htmlFor="mobile-search-field" className="sr-only">
                        Search
                      </label>
                      <label htmlFor="desktop-search-field" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                          <MagnifyingGlassIcon
                            className="h-5 w-5 flex-shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          name="mobile-search-field"
                          id="mobile-search-field"
                          className="h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:hidden"
                          placeholder="Search"
                          type="search"
                        />
                        <input
                          name="desktop-search-field"
                          id="desktop-search-field"
                          className="hidden h-full w-full border-transparent py-2 pl-8 pr-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:block"
                          placeholder="Search jobs, applicants, and more"
                          type="search"
                        />
                      </div>
                    </form>
                  </div>
                  <div className="ml-4 flex items-center lg:ml-6">
                    <button
                      type="button"
                      className="rounded-full bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">View notifications</span>
                    </button>
                  </div>
                </div>
              </div>

              <main className="flex-1">
                <div className="relative mx-auto max-w-4xl">
                  <div className=" pb-16">
                    <div className="px-4 sm:px-6 lg:px-0">
                      <div className="pb-6">
                        {/* Tabs */}
                        <div className="lg:hidden">
                          <label htmlFor="selected-tab" className="sr-only">
                            Select a tab
                          </label>
                          <select
                            id="selected-tab"
                            name="selected-tab"
                            className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"
                            defaultValue={tabs.find((tab) => tab.current).name}
                          >
                            {tabs.map((tab) => (
                              <option key={tab.name}>{tab.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden lg:block">
                          <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                              {tabs.map((tab) => (
                                <a
                                  key={tab.name}
                                  href={tab.href}
                                  className={classNames(
                                    tab.current
                                      ? "border-purple-500 text-purple-600"
                                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                                  )}
                                >
                                  {tab.name}
                                </a>
                              ))}
                            </nav>
                          </div>
                        </div>

                        {/* Description list with inline editing */}
                        <div className="mt-10 divide-y divide-gray-200">
                          <div className="space-y-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              Profile
                            </h3>
                            <p className="max-w-2xl text-sm text-gray-500">
                              This information will be displayed publicly so be
                              careful what you share.
                            </p>
                          </div>
                          <div className="mt-6">
                            <dl className="divide-y divide-gray-200">
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  First Name
                                </dt>
                                <dd className="updateSettingsField firstName mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                  <input
                                    type="text"
                                    className="flex-grow"
                                    value={updateProfileData.firstName}
                                    onChange={handleInputChange}
                                    name="firstName"
                                    style={{
                                      border: "none",
                                      padding: "0 0.25em",
                                    }}
                                  />
                                  {/* <span className="ml-4 flex-shrink-0">
                                    <button
                                      type="button"
                                      className="rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                      onClick={handleUpdate}
                                    >
                                      Update
                                    </button>
                                  </span> */}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Last Name
                                </dt>
                                <dd className="updateSettingsField lastName mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                  <input
                                    type="text"
                                    className="flex-grow"
                                    value={updateProfileData.lastName}
                                    onChange={handleInputChange}
                                    name="lastName"
                                    style={{
                                      border: "none",
                                      padding: "0 0.25em",
                                    }}
                                  />
                                  {/* <span className="ml-4 flex-shrink-0">
                                    <button
                                      type="button"
                                      className="rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                      onClick={handleUpdate}
                                    >
                                      Update
                                    </button>
                                  </span> */}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Photo
                                </dt>
                                <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                  <div class="profile-pic">
                                    <label
                                      class="-label"
                                      htmlFor="profileImageInput"
                                    >
                                      <span>Change Image</span>
                                      <input
                                        name="profileImage"
                                        id="profileImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                      />
                                    </label>
                                    <img
                                      src={updateProfileData.profileImage}
                                      width="100"
                                      id="profileImage"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '80%',
                                        fontSize: '0.6rem',
                                        background: 'white',
                                        color: 'black',
                                        width: '80%',
                                        textAlign: 'center',
                                        fontWeight:'600'
                                      }
                                    }>UPDATE</div>
                                  </div>
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Email
                                </dt>
                                <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                  <span className="flex-grow">
                                    {meeData?.me?.email}
                                  </span>
                                </dd>
                              </div>
                              {meeData?.me?.paid && <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200 sm:py-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Susbcription Details
                                </dt>
                                <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                  <span className="flex-grow">
                                    You are on a <span style={{fontWeight:"600"}}>{meeData?.me?.interval}ly</span> plan <br/>
                                    Last Invoice Date : <span style={{fontWeight:"600"}}>{new Date(meeData?.me?.lastInvoicedDate).toLocaleDateString('in-IN')}</span> <br/>
                                    Next Invoice Date : <span style={{fontWeight:"600"}}>{new Date(meeData?.me?.upcomingInvoicedDate).toLocaleDateString('in-IN')}</span>
                                  </span>
                                </dd>
                              </div>}
                              <div>
                                <button
                                  type="button"
                                  className="update-button cta"
                                  style={{
                                    position: "absolute",
                                    right: "0",
                                    bottom: "30px",
                                    width: "80px",
                                    height: "30px",
                                  }}
                                  onClick={handleUpdate}
                                >
                                  {updateLoader ? (
                                    <ReactLoading
                                      type={"spin"}
                                      color={"#2563EB"}
                                      height={15}
                                      width={15}
                                      className={"mx-auto"}
                                    />
                                  ) : (
                                    "Update"
                                  )}
                                </button>
                                {linkedin ? (
                                  <button
                                    className="update-button cta"
                                    style={{
                                      position: "absolute",
                                      right: "100px",
                                      bottom: "30px",
                                      width: "150px",
                                      height: "30px",
                                    }}
                                    onClick={() => {
                                      localStorage.removeItem(
                                        "linkedInAccessToken"
                                      );
                                      setlinkedin(false);
                                    }}
                                  >
                                    Logout Linkedin
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
          
    </>
  );
}
