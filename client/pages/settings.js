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
        lorem ipsum 
      </div>
    </>
  );
}
