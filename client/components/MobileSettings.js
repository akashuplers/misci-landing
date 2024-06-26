import { STRIPE_PROMISE } from "@/constants";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import { addPreferances } from "@/graphql/mutations/addPreferances";
import {
  formatDate,
  generateDateString,
  handleconnectLinkedin,
  handleconnectTwitter,
} from "@/helpers/helper";
import PricingCard from "@/pages/pricing";
import { useMutation } from "@apollo/client";
import { Switch, Tab } from "@headlessui/react";
import {
  ArrowUpCircleIcon,
  AtSymbolIcon,
  CogIcon,
  CreditCardIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import { LinkedinIcon, TwitterIcon } from "react-share";
import { toast } from "react-toastify";
import CheckoutFormUpgrade from "../components/CheckoutFormUpgrade";
import PreferenceMobileTab from "../components/PreferenceMobileTab";
import fillerProfileImage from "../public/profile-filler.jpg";
import UpgradeFeatures from "./FeatureItem";
import ForgotPasswordModal from "./ForgotPasswordModal";
import LoaderScan from "./LoaderScan";
import { TwitterVerifiedIcon } from "./localicons/localicons";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileSettings({ meeData, meeLoading }) {

  const [selectedTab, setSelectedTab] = useState(0);
  var tabs = [
    {
      name: "Profile",
      icon: <UserIcon className="w-5 h-5" aria-hidden="true" />,
      component: <ProfileTab meeData={meeData} setSelectedTab={setSelectedTab} />,
    },
    {
      name: "Preferences",
      icon: <AtSymbolIcon className="w-5 h-5" aria-hidden="true" />,
      component: <PreferencesTab meeData={meeData} setSelectedTab={setSelectedTab} meeLoading={meeLoading} />,
    },
    {
      name: "Integration",
      icon: <CogIcon className="w-5 h-5" aria-hidden="true" />,
      component: <IntegrationTab meeData={meeData} setSelectedTab={setSelectedTab} />,
    },
    {
      name: "Billing",
      icon: <CreditCardIcon className="w-5 h-5" aria-hidden="true" />,
      component: <BillingTab meeData={meeData} setSelectedTab={setSelectedTab} />,
    },
    {
      name: "Upgrade",
      icon: <ArrowUpCircleIcon className="w-5 h-5" aria-hidden="true" />,
      component: <UpgradeTab meeData={meeData} setSelectedTab={setSelectedTab} />,
    },
  ];
  return (
    <div className="scrollbar-hide w-full px-2 sm:px-0">
      <Tab.Group onChange={setSelectedTab} defaultIndex={selectedTab}>
        <Tab.List className="overflow-x-auto scrollbar-hide flex w-full space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((category) => (
            <Tab
              key={category.name}
              className={({ selected }) =>
                classNames(
                  "flex items-center px-4 py-2 text-sm font-medium leading-5 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              <div className="flex items-center space-x-2">
                {category.icon}
                <span>{category.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((category) => (
            <Tab.Panel
              key={category.name}
              className={classNames(
                "bg-white rounded-xl p-3",
                "ring-1 ring-black ring-opacity-5 shadow-xs"
              )}
            >
              <h3 className="sr-only">{category.name}</h3>
              <ul className="space-y-4">{category.component}</ul>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

function ProfileTab({ meeData }) {
  const [updateProfileData, setUpdateProfileData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
  });
  const [updateLoader, setUpdateLoader] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);
  const [forgotPass, setForgotPass] = useState(false);

  useEffect(() => {
    if (meeData != null) {
      setUpdateProfileData({
        firstName: meeData.me.name,
        lastName: meeData.me.lastName,
        profileImage: meeData.me.profileImage || fillerProfileImage,
      });
      const arr = [];
      meeData.me.prefData.map((value) =>
        arr.push({ value: value, label: value, color: "#000000" })
      );
    }
  }, [meeData]);
  const handleInputChange = (e) => {
    setUpdateProfileData({
      ...updateProfileData,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdate = (e) => {
    var getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
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
  return (
    <div>
      <div className="w-full h-screen/3 flex items-center justify-center">
        <label htmlFor="profile-photo" className="relative cursor-pointer">
          {/* <img
            src={fillerProfileImage}
            alt="Update Profile Photo"
            className="h-30vh"
          /> */}
          {/* user circle icon */}
          <div
            className="profile-pic"
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
                <label className="-label" htmlFor="profileImageInput">
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
                  className="25vh"
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
        </label>
      </div>
      <div className="mt-6">
        <dl className="divide-y divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">First Name</dt>
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
            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
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
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            {/* <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                    <span className="flex-grow relative">
                                      {meeData?.me?.email} {meeData?.me?.emailVerified && "✅"}
                                      {meeData?.me?.emailVerified && (
                                        <span className="tooltip absolute text-white bg-gray-800 rounded-lg py-1 px-2 -mt-8 left-1/2 transform -translate-x-1/2 opacity-0 pointer-events-none transition-opacity duration-200">
                                          Email verified
                                        </span>
                                      )}
                                    </span>
                                  </dd> */}
            <dd className="updateSettingsField mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <div className="flex group cursor-pointer relative gap-1 text-center">
                {meeData?.me?.email}{" "}
                {meeData?.me?.emailVerified && (
                  <span className="text-green-600">
                    <TwitterVerifiedIcon />
                  </span>
                )}
                {meeData?.me?.emailVerified && (
                  <div className="opacity-0 w-28 bg-black text-white text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 ml-14 px-3 pointer-events-none">
                    Email verified
                  </div>
                )}
              </div>
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
                      <button className="update-button cta p-4 absolute right-0">
                        Cancel Subscription
                      </button>
                      Last Invoice Date :{" "}
                      <span style={{ fontWeight: "600" }}>
                        {/* {new Date(
                                                meeData?.me
                                                  ?.lastInvoicedDate * 1000
                                              ).toLocaleDateString("in-IN")} */}

                        {formatDate(
                          generateDateString(meeData?.me?.lastInvoicedDate)
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
                          generateDateString(meeData?.me?.upcomingInvoicedDate)
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 py-2 rounded">
                        You have cancelled the subscription
                      </span>
                      <br />
                      Last Date of Subscription :{" "}
                      <span style={{ fontWeight: "600" }}>
                        {formatDate(
                          generateDateString(meeData?.me?.upcomingInvoicedDate)
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
                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-2 w-full lg:w-[310%]"
                    role="alert"
                  >
                    <p>
                      Your credits will be renewed in the next{" "}
                      {meeData?.me?.creditRenewDay} day(s).
                    </p>
                  </div>
                )}
            </div>
          )}
          <div className="py-4 flex flex md:flex-row gap-4 justify-start">
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
          </div>
        </dl>
      </div>
    </div>
  );
}
function PreferencesTab({ meeData, meeLoading }) {
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
  var token;

  var token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }
  const [selectedOption, setselectedOption] = useState([]);

  useEffect(() => {
    const arr = [];
    if (meeData) {
      meeData.me.prefData.map((value) =>
        arr.push({ value: value, label: value, color: "#000000" })
      );
      setOptions(arr);
      setselectedOption(arr);
    }
  }, [meeData]);
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
  const [options, setOptions] = useState([]);

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

  const [isFormat, setIsFormat] = useState(false);

  if (meeLoading) return <LoaderScan />;
  console.log(meeData?.me?.lastInvoicedDate * 1000);

  return (
    <PreferenceMobileTab
      meeData={meeData}
      handleUpdatePref={handleUpdatePref}
      isFormat={isFormat}
      meData={meeData}
      options={options}
      selectedOption={selectedOption}
      setIsFormat={setIsFormat}
      setSelectedOption={setselectedOption}
    />
  );
}
function IntegrationTab({ meeData }) {
  const [socialIntegrations, setsocialIntegrations] = useState([
    {
      name: "Linkedin",
      status: false,
      icon: <LinkedinIcon className="rounded-md" />,
    },
    {
      name: "Twitter",
      status: false,
      icon: <svg 
              style={{pointerEvents: 'none'}} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 30 30"
              width="20px"
              height="20px"
              className="rounded-md"
            >
              <path d="M 6 4 C 4.895 4 4 4.895 4 6 L 4 24 C 4 25.105 4.895 26 6 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 6 4 z M 8.6484375 9 L 13.259766 9 L 15.951172 12.847656 L 19.28125 9 L 20.732422 9 L 16.603516 13.78125 L 21.654297 21 L 17.042969 21 L 14.056641 16.730469 L 10.369141 21 L 8.8945312 21 L 13.400391 15.794922 L 8.6484375 9 z M 10.878906 10.183594 L 17.632812 19.810547 L 19.421875 19.810547 L 12.666016 10.183594 L 10.878906 10.183594 z"/>
            </svg>,
    },
  ]);

  const [loading, setloading] = useState(false);
  useEffect(() => {
    checkForUserIntegration();
  }, [loading]);
  function checkForUserIntegration() {
    var linkedInAccessToken, twitterAccessToken;
    if (typeof window !== "undefined") {
      linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
      twitterAccessToken = localStorage.getItem("twitterAccessToken");
      if (linkedInAccessToken) {
        setsocialIntegrations((prev) => {
          return prev.map((item) => {
            if (item.name === "Linkedin") {
              return { ...item, status: true };
            } else {
              return item;
            }
          });
        });
      }
      if (twitterAccessToken) {
        setsocialIntegrations((prev) => {
          return prev.map((item) => {
            if (item.name === "Twitter") {
              return { ...item, status: true };
            } else {
              return item;
            }
          });
        });
      }
    }
  }
  const statusChange = (name, status) => {
    setloading(true);
    // puase

    if (name === "Linkedin" && status === false) {
      localStorage.removeItem("linkedInAccessToken");
      checkForUserIntegration();
      toast.success("Linkedin has been disconnected.");
    }
    if (name === "Twitter" && status === false) {
      localStorage.removeItem("twitterAccessToken"); // remove token
      checkForUserIntegration();
      toast.success("Twitter has been disconnected.");
    }
    if (name === "Linkedin" && status === true) {
      connectLinkedin();
    }
    if (name === "Twitter" && status === true) {
      connectTwitter();
    }
    setloading(false);
  };

  async function connectTwitter() {
    handleconnectTwitter("/settings");
  }
  async function connectLinkedin() {
    handleconnectLinkedin("/settings");
  }

  return (
    <div>
      <div className="py-4 flex flex-col md:flex-row gap-4 justify-between">
        {socialIntegrations &&
          socialIntegrations.map((item) => {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">{item.icon}</div>
                  <h3>{item.name}</h3>
                </div>
                <div>
                  <Switch
                    checked={item.status}
                    disabled={loading}
                    onChange={() => statusChange(item.name, !item.status)}
                    className={`${item.status ? "bg-blue-700" : "bg-gray-300"}
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75 disabled:opacity-50`}
                  >
                    <span
                      aria-hidden="true"
                      className={`${item.status ? "translate-x-9" : "translate-x-0"
                        }
            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
function BillingTab({ meeData, setSelectedTab }) {
  const [showCancelModal, setshowCancelModal] = useState(false);
  const maskCardNumber = (cardNumber) => {
    const visibleDigits = cardNumber.slice(-4);
    const maskedDigits = "*".repeat(cardNumber.length - 4);
    return `${maskedDigits}${visibleDigits}`;
  };
  const cardData = {
    providerImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png?20170118154621",
    cardType: "Visa",
    cardNumber: "1234567890123456",
    expires: "09/25",
    email: meeData?.me?.email,
  };
  if (meeData?.me?.paid === false || meeData?.me?.paid === "false") {
    return (
      <div className="mt-4 border p-2 shadow-md rounded-md">
        <div className="mt-2 flex justify-center">
          <h3 className="text-black text-2xl font-semibold">Select a Plan</h3>
        </div>
        <div className="mt-4 flex justify-center">
          <p className="text-gray-700">
            From the latest update, choose your desired plan.
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <button className="w-full p-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded" onClick={() => {
            setSelectedTab(4);
          }}>
            Select Plan from Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 border p-2 shadow-md rounded-md">
        <div className=" mt-2 flex justify-between ">
          <div className="flex flex-col">
            {/* title with des */}
            <h3 className=" text-black text-2xl font-semibold">Paid Plan</h3>
            <p className="text-gray-700">You are currently using this plan.</p>
          </div>
          <div>
            {/* amount */}
            <h3 className="text-5xl text-blue-700 font-bold">$10</h3>
          </div>
        </div>
        <div className="mt-7">
          <ProgressBar totalDays={30} daysCompleted={22} />
        </div>
        <div className="mt-3">
          <button className="mr-4 w-[200px] p-4 bg-transparent hover:bg-red-500 text-red-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded" onClick={() => setshowCancelModal(true)}>
            Cancel Subscription
          </button>
        </div>
      </div>
      <div className="mt-4 border p-2 shadow-md rounded-md">
        <h2 className="text-lg font-semibold mb-4">Card Used</h2>
        <div className="flex items-center mb-4">
          <img
            src={cardData.providerImage}
            alt="Card Provider"
            className="h-8 mr-2"
          />
        </div>
        <div className="mb-4">
          <span className="text-gray-500">{cardData.cardType}: </span>
          <span>{maskCardNumber(cardData.cardNumber)}</span>
        </div>
        <div className="mb-4">
          <span className="text-gray-500">Expires: </span>
          <span>{cardData.expires}</span>
        </div>
        <div>
          <AtSymbolIcon className="h-4 mr-2 inline-block" />
          <span>{cardData.email}</span>
        </div>
      </div>
    </div>
  );
}
function UpgradeTab({ meeData }) {
  const plan = {
    name: "Monthly",
    description: "",
    duration: "/ Month",
    features: [...UpgradeFeatures],
    price: 1,
  };
  const stripePromise = loadStripe(STRIPE_PROMISE);
  const [priceData, setPriceData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [clickOnSubscibe, setClickOnSubscibe] = useState(false);

  useEffect(() => {
    return async () => {
      const pricesRes = await axios({
        method: "get",
        url: `${API_BASE_PATH}/stripe/prices`,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.data);

      setPriceData(pricesRes.data.data);
      console.log(pricesRes.data.data);
    };
  }, []);

  useEffect(() => {
    console.log(priceData);
  }, [priceData]);

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState({});
  const [priceId, setPriceId] = useState();

  const subscriptionPlan = (plan) => {
    console.log(plan);
    let selectPriceData = "";
    if (plan.subscriptionType === "Quarterly") {
      selectPriceData = plans.filter((item) => {
        return item?.subscriptionType === "Quarterly";
      });
      setPriceId(selectPriceData[0].priceId);
    } else if (plan.subscriptionType === "Yearly") {
      selectPriceData = plans.filter((item) => {
        return item?.subscriptionType === "Yearly";
      });
      setPriceId(selectPriceData[0].priceId);
    } else {
      selectPriceData = plans.filter((item) => {
        return item?.subscriptionType === "Monthly";
      });
      setPriceId(selectPriceData[0].priceId);
    }

    setCurrentPlan(plan);
    setUserPlan((prev) => {
      return {
        ...prev,
        name: plan.subscriptionType,
        price: plan.price,
      };
    });
  };

  useEffect(() => {
    console.log("**", currentPlan);
  }, [currentPlan]);

  useLayoutEffect(() => {
    const fetchPriceId = async () => {
      const pricesRes = await axios({
        method: "get",
        url: `${API_BASE_PATH}/stripe/prices`,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.data);

      console.log(pricesRes?.data, "pricesRes");
      const updatedPricesArray = pricesRes?.data?.data?.map((price) => {
        let type = null;
        if (price.recurring.interval === "month") {
          if (price.recurring.interval_count === 3) {
            type = "Quarterly";
            setCurrentPlan({
              subscriptionType: type,
              price: price.unit_amount / 100,
              priceId: price.id,
            });
            // console.log("currPlan", currentPlan, priceId)
          } else {
            type = "Monthly";
          }
        }
        if (price.recurring.interval === "year") {
          type = "Yearly";
        }
        return {
          subscriptionType: type,
          price: price.unit_amount / 100,
          priceId: price.id,
        };
      });
      console.log(updatedPricesArray);
      const sortedPlans = updatedPricesArray.sort((a, b) => {
        const order = ["Monthly", "Quarterly", "Yearly"];
        return (
          order.indexOf(a.subscriptionType) - order.indexOf(b.subscriptionType)
        );
      });

      setPlans(sortedPlans);
    };

    fetchPriceId();
  }, []);

  useEffect(() => {
    if (plans && plans.length) setCurrentPlan(plans[0]);
    if (plans.length > 0) {
      const temp = plans.filter((item) => {
        return item?.subscriptionType === "Yearly";
      });
      setPriceId(temp[0].priceId);
    }
  }, [plans]);

  console.log(currentPlan, priceId);
  const [userPlan, setUserPlan] = useState(plan);
  const [planType, setPlanType] = useState("monthly");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const tabs = ["monthly", "yearly", "quarterly"];
  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };
  return (
    <div>
      <Elements stripe={stripePromise}>
        <Tab.Group>
          <Tab.List className="overflow-x-auto scrollbar-hide flex justify-center space-x-4 rounded-xl bg-blue-900/20 p-1">
            {plans &&
              plans.map((plan) => (
                <Tab
                  key={plan.subscriptionType}
                  onClick={() => subscriptionPlan(plan)}
                  className={({ selected }) =>
                    classNames(
                      "flex items-center px-4 py-2 text-sm font-medium leading-5 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  <span>{plan.subscriptionType}</span>
                </Tab>
              ))}
          </Tab.List>
        </Tab.Group>
        <PricingCard plan={userPlan} onClick={handleUpgrade} />
        <Modal
          isOpen={showUpgradeModal}
          onRequestClose={() => {
            setShowUpgradeModal(false);
          }}
          ariaHideApp={false}
          className="w-full sm:w-[38%] modalModalWidth max-h-[95%] "
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
              boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
              borderRadius: "8px",
              width: "90%", // Adjusted for responsiveness
              maxWidth: "450px",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              paddingBottom: "0px",
            },
          }}
        >
          <CheckoutFormUpgrade
            currentPlan={currentPlan?.subscriptionType?.toLowerCase()}
            priceId={currentPlan?.priceId}
            setClickOnSubscibe={setClickOnSubscibe}
            interval={currentPlan?.subscriptionType}
            plans={plans}
          />
        </Modal>
      </Elements>
    </div>
  );
}

const ProgressBar = ({ totalDays, daysCompleted }) => {
  const percentage = (daysCompleted / totalDays) * 100;

  return (
    <div className="h-4 w-full bg-gray-200 rounded overflow-hidden">
      <div
        className="h-full bg-green-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
