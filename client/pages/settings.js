/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useMutation, useQuery } from "@apollo/client";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import CreatableSelect from "react-select/creatable";
import { ToastContainer, toast } from "react-toastify";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import Layout from "../components/Layout";
import LoaderScan from "../components/LoaderScan";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { addPreferances } from "../graphql/mutations/addPreferances";
import { meeAPI } from "../graphql/querys/mee";
import { formatDate, generateDateString } from "../helpers/helper";
import fillerProfileImage from "../public/profile-filler.jpg";

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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("General");
  const [pref, setPref] = useState("");
  const [options, setOptions] = useState([]);
  const [isFormat, setIsFormat] = useState(false);
  const [modalOpen, setOpenModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const tabs = [
    { name: "General", href: "#", current: tab === "General" },
    { name: "Preference", href: "#", current: tab === "Preference" },
  ];

  const [selectedOption, setSelectedOption] = useState([]);

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

  const [forgotPass, setForgotPass] = useState(false);

  const [linkedin, setlinkedin] = useState(false);
  const [twitter, settwitter] = useState(false);

  var token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const [AddPreferance, { loading: prefLoading }] = useMutation(
    addPreferances,
    {
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    }
  );

  useEffect(() => {
    var linkedInAccessToken, twitterAccessToken;
    if (typeof window !== "undefined") {
      linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
      twitterAccessToken = localStorage.getItem("twitterAccessToken");
      if (linkedInAccessToken) setlinkedin(true);
      if (twitterAccessToken) settwitter(true);
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
    onError: ({ graphQLErrors, networkError }) => {
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
    if (meeData != null) {
      setUpdateProfileData({
        firstName: meeData.me.name,
        lastName: meeData.me.lastName,
        profileImage: meeData.me.profileImage ?? fillerProfileImage.src,
      });
      const arr = [];
      meeData.me.prefData.map((value) =>
        arr.push({ value: value, label: value, color: "#000000" })
      );
      setOptions(arr);
      setSelectedOption(arr);
    }
  }, [meeData]);

  console.log("meeData", meeData);

  const handleCancel = () => {
    setProcessing(true);
    const axios = require("axios");
    var getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: API_BASE_PATH + "/stripe/cancel-subscription",
      headers: {
        Authorization: "Bearer " + getToken,
      },
    };
    setOpenModal(false);
    axios
      .request(config)
      .then((response) => {
        toast.success(response.data.data);
        console.log(response.data.data);

        setProcessing(false);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
    axios
      .put(API_BASE_PATH + API_ROUTES.UPDATE_PROFILE, updateProfileData, {
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

  const handleUpdatePref = () => {
    const Prefrence = [];
    selectedOption.map((o) => Prefrence.push(o.value));
    AddPreferance({
      variables: {
        options: {
          keywords: Prefrence,
        },
      },
      onCompleted: (data) => {
        toast.success("Preferences Saved!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      },
      onError: (error) => {
        console.error(error);
      },
    }).catch((err) => {
      console.log(err);
    });
  };

  const [imageLoader, setImageLoader] = useState(false);

  const handleInputChange = ({ target }) => {
    let { value, name } = target;

    if (target.id === "profileImageInput") {
      setImageLoader(true);
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
          })
          .finally(() => setImageLoader(false));
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

  function handleDate() {
    const lastInvoicedDate = new Date(meeData?.me?.lastInvoicedDate);
    console.log(lastInvoicedDate.toLocaleDateString("in-IN"));
    const upcomingInvoicedDate = new Date(meeData?.me?.upcomingInvoicedDate);
    console.log(upcomingInvoicedDate.toLocaleDateString("in-IN"));
    const string = <span style={{ fontWeight: "600" }}>``</span>;
    return `You are on a ${string} plan`;
  }

  if (meeLoading) return <LoaderScan />;
  console.log(meeData?.me?.lastInvoicedDate * 1000);

  return (
    <>
      <div>
        <ToastContainer />
        {processing && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader mb-4"></div>
              <p className="text-gray-100 text-lg text-center">
                Processing... <br />
                Please do not refresh.
              </p>
            </div>
          </div>
        )}
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
        <div className="py-[120px] lg:pl-64">
          <div className="lg:px-8">
            <div className="mx-auto flex flex-col lg:max-w-4xl">
              <main className="flex-1">
                <div className="relative mx-auto max-w-4xl">
                  <div className="p-4 lg:pb-16 mx-auto">
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
                                <button
                                  key={tab.name}
                                  onClick={() => setTab(tab.name)}
                                  className={classNames(
                                    tab.current
                                      ? "border-purple-500 text-purple-600"
                                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                                  )}
                                >
                                  {tab.name}
                                </button>
                              ))}
                            </nav>
                          </div>
                        </div>

                        {/* Description list with inline editing */}
                        {tab === "General" ? (
                          <div className="mt-10 divide-y divide-gray-200">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Profile
                              </h3>
                              <p className="max-w-2xl text-sm text-gray-500">
                                This information will be displayed publicly so
                                be careful what you share.
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
                                    
                                  </dd>
                                </div>
                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Photo
                                  </dt>
                                  <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                    <div
                                      class="profile-pic"
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                      }}
                                    >
                                      {imageLoader ? (
                                        <div style={{ margin: "0 auto" }}>
                                          <ReactLoading
                                            width={50}
                                            height={100}
                                            color={"#2563EB"}
                                            type="spin"
                                          />
                                        </div>
                                      ) : (
                                        <>
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
                                        </>
                                      )}
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: "80%",
                                          fontSize: "0.6rem",
                                          background: "white",
                                          color: "black",
                                          width: "80%",
                                          textAlign: "center",
                                          fontWeight: "600",
                                        }}
                                      >
                                        UPDATE
                                      </div>
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
                                {meeData?.me?.isSubscribed && (
                                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">
                                      Susbcription Details
                                    </dt>
                                    <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                      <span className="flex-grow">
                                        You are on a{" "}
                                        <span style={{ fontWeight: "600" }}>
                                          {meeData?.me?.interval === "year"
                                            ? meeData?.me?.interval + "ly"
                                            : meeData?.me?.interval}
                                        </span>{" "}
                                        plan <br />
                                        {meeData?.me?.paid ? (
                                          <>
                                            <button
                                              className="update-button cta p-4 absolute right-0"
                                              onClick={() => setOpenModal(true)}
                                            >
                                              Cancel Subscription
                                            </button>
                                            Last Invoice Date :{" "}
                                            <span style={{ fontWeight: "600" }}>
                                              {/* {new Date(
                                                meeData?.me
                                                  ?.lastInvoicedDate * 1000
                                              ).toLocaleDateString("in-IN")} */}

                                              {formatDate(
                                                generateDateString(
                                                  meeData?.me?.lastInvoicedDate
                                                )
                                              )}
                                            </span>{" "}
                                            <br />
                                            Next Invoice Date :{" "}
                                            <span style={{ fontWeight: "600" }}>
                                              {/* {new Date(
                                                meeData?.me
                                                  ?.upcomingInvoicedDate * 1000
                                              ).toLocaleDateString("in-IN")} */}
                                              {formatDate(
                                                generateDateString(
                                                  meeData?.me
                                                    ?.upcomingInvoicedDate
                                                )
                                              )}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <span class="text-red-500 py-2 rounded">
                                              You have cancelled the
                                              subscription
                                            </span>
                                            <br />
                                            Last Date of Subscription :{" "}
                                            <span style={{ fontWeight: "600" }}>
                                              {formatDate(
                                                generateDateString(
                                                  meeData?.me
                                                    ?.upcomingInvoicedDate
                                                )
                                              )}
                                            </span>
                                          </>
                                        )}
                                      </span>
                                    </dd>
                                    {meeData?.me?.paymentsStarts &&
                                      meeData?.me?.paid &&
                                      meeData?.me?.interval !== "monthly" && (
                                        <div
                                          class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-2 w-[310%]"
                                          role="alert"
                                        >
                                          <p>
                                            Your credits will be renewed in the
                                            next {meeData?.me?.creditRenewDay}{" "}
                                            day(s).
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                )}
                                <div className="py-4 flex flex-col md:flex-row gap-4">
                                  <span
                                    className="reset-button cta"
                                    style={{ 
                                      left: "0",
                                      bottom: "30px",
                                    }}
                                    onClick={() => setForgotPass(true)}
                                  >
                                    Forgot Password
                                  </span>
                                  <ForgotPasswordModal
                                    forgotPass={forgotPass}
                                    setForgotPass={setForgotPass}
                                    email={meeData?.me?.email}
                                  />
                                  <button
                                    type="button"
                                    className="update-button cta"
                                    style={{
                                      right: "0",
                                      bottom: "30px",
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
                                      className="update-button cta p-4"
                                      style={{
                                        right: "100px",
                                        bottom: "30px",
                                        width: "150px",
                                      }}
                                      onClick={() => {
                                        localStorage.removeItem(
                                          "linkedInAccessToken"
                                        );
                                        toast.success(
                                          "Linkedin has been disconnected."
                                        );
                                        setlinkedin(false);
                                      }}
                                    >
                                      Logout Linkedin
                                    </button>
                                  ) : (
                                    <></>
                                  )}
                                  {twitter ? (
                                    <button
                                      className="update-button cta p-4"
                                      style={{
                                        right: "300px",
                                        bottom: "30px",
                                        width: "175px",
                                      }}
                                      onClick={() => {
                                        localStorage.removeItem(
                                          "twitterAccessToken"
                                        );
                                        localStorage.removeItem(
                                          "twitterAccessTokenSecret"
                                        );
                                        settwitter(false);
                                        toast.success(
                                          "Twitter has been disconnected."
                                        );
                                      }}
                                    >
                                      Logout from Twitter
                                    </button>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </dl>
                            </div>
                          </div>
                        ) : meeData?.me?.isSubscribed ? (
                          <div className="mt-10 divide-y divide-gray-200">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Daily Feed Preferences
                              </h3>
                              <p className="max-w-2xl text-sm text-gray-500">
                                Max 3 preferences allowed (Use alphabets and
                                numbers only).
                              </p>
                            </div>
                            <div className="mt-6">
                              <dl className="divide-y divide-gray-200">
                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                  <dd className="  mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0"></dd>
                                </div>
                                <CreatableSelect
                                  defaultValue={selectedOption}
                                  isMulti
                                  onInputChange={(newValue) => {
                                    let pattern = /^[a-zA-Z0-9\s]+$/;
                                    if (pattern.test(newValue)) {
                                      console.log(
                                        "String contains only alphabets and numbers."
                                      );

                                      setIsFormat(
                                        newValue.length > 100 || false
                                      );
                                    } else {
                                      console.log(
                                        "String contains other characters."
                                      );
                                      if (newValue) setIsFormat(true);
                                    }
                                  }}
                                  onChange={(o) => {
                                    setSelectedOption(o);
                                  }}
                                  options={options}
                                  isOptionDisabled={() => {
                                    return (
                                      isFormat || selectedOption.length >= 3
                                    );
                                  }}
                                />
                              </dl>
                            </div>
                            <button
                              type="button"
                              className=" mt-5 rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                              onClick={handleUpdatePref}
                            >
                              Update Preferences
                            </button>
                          </div>
                        ) : (
                          <div className=" flex items-center justify-center bg-gray-100 h-[600px]">
                            <div className=" p-8 rounded-md">
                              <p className="text-gray-800 text-lg font-medium text-center mt-4">
                                Upgrade to edit the daily feed preferences...
                              </p>
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Modal
                  isOpen={modalOpen}
                  onRequestClose={() => setOpenModal(false)}
                  ariaHideApp={false}
                  className="w-[100%] sm:w-[38%] max-h-[95%]"
                  style={{
                    overlay: {
                      backgroundColor: "rgba(0,0,0,0.5)",
                      zIndex: "9999",
                    },
                    content: {
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      right: "auto",
                      border: "none",
                      background: "white",
                      // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
                      borderRadius: "8px",
                      height: "400px",
                      // width: "100%",
                      maxWidth: "450px",
                      bottom: "",
                      zIndex: "999",
                      marginRight: "-50%",
                      transform: "translate(-50%, -50%)",
                      padding: "30px",
                      paddingBottom: "0px",
                    },
                  }}
                >
                  <button
                    className="absolute right-[35px]"
                    onClick={() => setOpenModal(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="mx-auto pb-4">
                    <img className="mx-auto h-40" src="/Cancellation.svg" />
                  </div>
                  <div className="mx-auto font-bold text-2xl pl-[10%]">
                    Cancel your Subscription?
                  </div>
                  <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
                    Are you sure? Please read our{" "}
                    <Link
                      href="/cancellation-policy"
                      className="font-bold"
                      target="_blank"
                    >
                      cancellation policy{" "}
                    </Link>
                    for more info.
                  </p>
                  <div className="flex m-6">
                    <button
                      class="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      Not Now
                    </button>
                    <button
                      class="w-[240px]  bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"
                      onClick={() => {
                        handleCancel();
                      }}
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </Modal>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
