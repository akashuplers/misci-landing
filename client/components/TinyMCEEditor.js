/* eslint-disable react-hooks/exhaustive-deps */
import { meeAPI } from "@/graphql/querys/mee";
import { BASE_PRICE } from "@/pages";
import { useMutation, useQuery } from "@apollo/client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import TextareaAutosize from "react-textarea-autosize";

import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { ToastContainer, toast } from "react-toastify";
import {
  API_BASE_PATH,
  API_ROUTES,
  LINKEDIN_CLIENT_ID,
  LI_API_ENDPOINTS,
} from "../constants/apiEndpoints";
import { updateBlog } from "../graphql/mutations/updateBlog";
import { getCurrentDashboardURL, htmlToJson, jsonToHtml } from "../helpers/helper";
import useStore, { useByMeCoffeModal } from "../store/store";
import AuthenticationModal from "./AuthenticationModal";
import LoaderPlane from "./LoaderPlane";
import TrialEndedModal from "./TrialEndedModal";
import Threads from "./ThreadsUI";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function TinyMCEEditor({
  topic,
  isAuthenticated,
  editorText,
  loading,
  blog_id,
  blogData: dataIncoming,
  blogData,
  isPublished,
  ref,
  option,
  setOption,
}) {
  const [multiplier, setMultiplier] = useState(1);
  const [contributionAmout, setContributionAmount] = useState(5);
  const [updatedText, setEditorText] = useState(editorText);

  const [saveLoad, setSaveLoad] = useState(false);
  const [saveText, setSaveText] = useState("Save!");
  const [publishLoad, setPublishLoad] = useState(false);
  const [publishText, setPublishText] = useState("Publish");
  const [publishLinkLoad, setPublishLinkLoad] = useState(false);
  const [publishTweetLoad, setPublishTweetLoad] = useState(false);
  const [publishLinkText, setPublishLinkText] = useState("Publish on Linkedin");
  const [publishTweetText, setPublishTweetText] =
    useState("Publish on Twitter");
  const [openModal, setOpenModal] = useState(false);
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [trailModal, setTrailModal] = useState(false);
  const [imageURL, setImageURL] = useState();
  const [isalert, setAlert] = useState(false);
  const [load, setLoad] = useState(false);
  // const [editingMode, setEditingMode] = useState(false);
  var isEditing = true;
  const isSave = useStore((state) => state.isSave);
  const creditLeft = useStore((state) => state.creditLeft);
  const updateCredit = useStore((state) => state.updateCredit);
  const showContributionModal = useByMeCoffeModal((state) => state.isOpen);
  const setShowContributionModal = useByMeCoffeModal((state) => state.toggleModal);
  const [contributinoModalLoader, setContributionModalLoader] = useState(false);
  const [showTwitterThreadUI, setShowTwitterThreadUI] = useState(false);
  const [twitterThreadData, setTwitterThreadData] = useState([]);
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
          "ServerError: Response not successful: Received status code 401" &&
          isauth
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
            window.location.reload();
          }, 2000);
        }
      }
    },
  });
  useEffect(() => {
    updateCredit();
  }, []);

  useEffect(() => {
    if (option === "linkedin-comeback") {
      setOption("linkedin");
      const siblingButton = document.querySelectorAll(".blog-toggle-button");
      siblingButton.forEach((el) => el.classList.remove("active"));
      const button = document.querySelector(".linkedin");
      button?.classList?.add("active");
      const aa = blogData?.publish_data?.find(
        (pd) => pd.platform === "linkedin"
      ).tiny_mce_data;
      const htmlDoc = jsonToHtml(aa);
      console.log("885", htmlDoc);
      setEditorText(htmlDoc);
    } else {
      if (option === "twitter-comeback") {
        setOption("twitter");
        const siblingButton = document.querySelectorAll(".blog-toggle-button");
        siblingButton.forEach((el) => el.classList.remove("active"));
        const button = document.querySelector(".twitter");
        button?.classList?.add("active");
        const aa = blogData?.publish_data?.find(
          (pd) => pd.platform === "twitter"
        ).tiny_mce_data;
        const htmlDoc = jsonToHtml(aa);
        setEditorText(htmlDoc);
      }
    }
  }, [option]);

  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  useEffect(() => {
    if (
      option !== "linkedin-comeback" &&
      option !== "twitter-comeback" &&
      option !== "twitter"
    )
      setEditorText(editorText);
  }, [editorText]);

  useEffect(() => {
    if (isSave) handleSave();
  }, [isSave]);

  const [authenticationModalType, setAuthneticationModalType] = useState("");
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const router = useRouter();
  let token,
    linkedInAccessToken,
    authorId,
    twitterAccessToken,
    twitterAccessTokenSecret;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
    linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
    twitterAccessToken = localStorage.getItem("twitterAccessToken");
    twitterAccessTokenSecret = localStorage.getItem("twitterAccessTokenSecret");
    authorId = localStorage.getItem("authorId");
  }
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  const handleSave = async () => {
    var getToken, ispaid, credits;
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = null;
      });
      ispaid = localStorage.getItem("ispaid");
      getToken = localStorage.getItem("token");
      credits = localStorage.getItem("credits");
    }
    console.log(
      "****--",
      ispaid === "true",
      credits !== "0",
      ispaid === "true" || credits !== "0"
    );
    if (ispaid === "true" || credits !== "0") {
      if (getToken) {
        setSaveLoad(true);

        const parser = new DOMParser();
        const doc = parser.parseFromString(updatedText, "text/html");
        const img = doc?.querySelector("img");
        const src = img?.getAttribute("src");

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = updatedText;
        const elementsToRemove = tempDiv.querySelectorAll("h3");
        for (let i = 0; i < elementsToRemove.length; i++) {
          const element = elementsToRemove[i];
          element.parentNode.removeChild(element);
        }
        const elementsToRemove2 = tempDiv.querySelectorAll("a");
        for (let i = 0; i < elementsToRemove2.length; i++) {
          const element = elementsToRemove2[i];
          element.parentNode.removeChild(element);
        }
        const textContent = tempDiv.textContent;

        const jsonDoc = htmlToJson(updatedText, imageURL).children;
        const formatedJSON = { children: [...jsonDoc] };
        const optionsForUpdate = {
          // tinymce_json: formatedJSON,
          blog_id: blog_id,
          platform: option === "blog" ? "wordpress" : option,
          imageUrl: src,
          imageSrc: imageURL ? null : imageURL,
          description: textContent,
        }
        if(showTwitterThreadUI ===true){
          optionsForUpdate.threads = twitterThreadData;
        }else{
          optionsForUpdate.tinymce_json = formatedJSON;  
        }
        UpdateBlog({
          variables: {
            options: optionsForUpdate,
          },
          context: {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getToken,
            },
          },
        })
          .then(() => {
            console.log(">>", window.location);
            if (window.location.pathname !== "/dashboard/" + blog_id)
              window.location.href = "/dashboard/" + blog_id;
            // router.push("/dashboard/" + blog_id);
          })
          .catch((err) => {
            //console.log(err);
          })
          .finally(() => {
            toast.success("Saved!!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setSaveLoad(false);
            setSaveText("Saved!");
          });
        setAuthenticationModalOpen(false);
      } else {
        setAuthneticationModalType("signup");
        setAuthenticationModalOpen(true);
      }
    } else {
      if (!getToken) {
        setAuthneticationModalType("signup");
        setAuthenticationModalOpen(true);
      } else {
        toast.error("Looks like you don't have credit left..", {
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
  };

  const [callBack, setCallBack] = useState();

  useEffect(() => {
    if (load) {
      const inputElement = document.getElementsByClassName("tox-textfield");
      inputElement[0].value = "Loading...";
    }
  }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setText(window.location.origin + "/public/");
    }
    if (typeof window !== "undefined") {
      let temp = `${window.location.origin}${router.pathname}`;
      if (temp.substring(temp.length - 1) == "/")
        setCallBack(temp.substring(0, temp.length - 1));
      else {
        setCallBack(window.location.origin + "/dashboard");
      }
    }
  }, []);
  const handleconnectLinkedin = () => {
    localStorage.setItem("loginProcess", true);
    localStorage.setItem("bid", blog_id);
    localStorage.removeItem("for_TW");
    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    window.location = redirectUrl;
  };

  const handleconnectTwitter = async () => {
    localStorage.setItem("loginProcess", true);
    localStorage.setItem("bid", blog_id);
    localStorage.setItem("for_TW", true);

    try {
      let data = JSON.stringify({
        callback: window.location.origin + "/dashboard",
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: API_BASE_PATH + "/auth/twitter/request-token",
        headers: {
          Authorization: "",
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          if (!response?.data?.error) {
            const twitterToken = response?.data?.data;
            const responseArray = twitterToken.split("&");
            window.location.href = `https://api.twitter.com/oauth/authorize?${responseArray[0]}`;
          } else {
            console.log("Error", response.data.error, response?.data?.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  };
  const handleSavePublish = () => {
    if (creditLeft === 0) {
      setTrailModal(true);
    } else {
      let getToken;
      if (typeof window !== "undefined") {
        getToken = localStorage.getItem("token");
      }
      if (getToken) {
        setPublishLoad(true);
        const jsonDoc = htmlToJson(updatedText).children;
        const formatedJSON = { children: [...jsonDoc] };

        // console.log("save and publish");
        axios({
          method: "post",
          url: API_BASE_PATH + API_ROUTES.GQL_PATH,
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + token,
          },
          data: {
            query:
              "mutation SavePreferences($options: PublisOptions) {\n  publish(options: $options)\n}",
            variables: {
              options: {
                blog_id: blog_id,
              },
            },
          },
        })
          .then(async (response) => {
            if (response?.data?.data?.publish) {
              toast.success("Published!!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              setOpenModal(true);
              setPublishLoad(false);
              setPublishText("Published!!");
            }

            var ll = Number(localStorage.getItem('meDataMePublishCount'))

            console.log('PUBLISH COUNT');
            console.log(Number(localStorage.getItem('meDataMePublishCount')));
            setTimeout(() => {
              // console.log('MEE DATA');
              // console.log('HERE FOR SHOW CONTRIBUTION MODAL');
              // const credits = meeData?.me?.credits;
              // console.log('CREDITS : ' + credits);
              var userCredits = meeData?.me?.totalCredits - creditLeft - 1;
              console.log('USER CREDITS: ' + userCredits);
              userCredits = userCredits + 2;
              var userPublishCount = Number(meeData?.me?.publishCount);
              console.log('pubb', userPublishCount)
              console.log('USER PUBLISH COUNT: ' + userPublishCount);
              const SHOW_CONTRIBUTION_MODAL = (localStorage.getItem('payment') === undefined || localStorage.getItem('payment') === null) && (localStorage.getItem('ispaid') === null || localStorage.getItem('ispaid') === undefined || localStorage.getItem('ispaid') === 'false') && (userCredits === 20 || userCredits === 10 || userPublishCount === 0) && !meeData?.me?.isSubscribed;
              console.log('SHOW_CONTRIBUTION_MODAL: ', SHOW_CONTRIBUTION_MODAL);
              if (SHOW_CONTRIBUTION_MODAL) {
                setShowContributionModal(true);
              }
            }, 3000);

          })
          .catch((error) => console.log("error", error));
      }

    }
  };
  async function handleCheckout() {
    console.log('LOCAL STOAGE: ')
    console.log(localStorage);
    setContributionModalLoader(true);
    const stripe = await stripePromise;
    const res = await fetch('https://maverick.lille.ai/stripe/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          customer_email: meeData?.me?.email,
          "line_items": [
            {
              "price_data": {
                "currency": 'usd',
                "product_data": {
                  "name": "coffeeContribution"
                },
                "unit_amount": BASE_PRICE * multiplier * contributionAmout
              },
              "quantity": 1
            }
          ],
          "mode": "payment",
          "success_url": getCurrentDashboardURL() + '/' + blog_id + '/?payment=true',
          "cancel_url": getCurrentDashboardURL() + '/' + blog_id,
          "billing_address_collection": 'auto'
        }
      ), // Multiply by the multiplier (e.g., 500 * 1 = $5, 500 * 2 = $10, etc.)
    });
    const session = await res.json();
    console.log(session);
    var userContribution = {
      amount: multiplier * contributionAmout,
      checkoutSessionId: session.id,
    }
    localStorage.setItem('userContribution', JSON.stringify(userContribution));
    console.log('LOCAL STOAGE: ')
    console.log(localStorage);
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })
  }

  const handlePublish = () => {
    if (creditLeft === 0) {
      setTrailModal(true);
    } else {
      const tempDiv = document.createElement("div");
      console.log(tempDiv);
      tempDiv.innerHTML = updatedText;

      let textContent = tempDiv.textContent;
      textContent = textContent.replace(
        /[\(*\)\[\]\{\}<>@|~_]/gm,
        (x) => "\\" + x
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(updatedText, "text/html");
      const img = doc.querySelector("img");
      const src = img ? img.getAttribute("src") : null;

      setPublishLinkLoad(true);

      const data = {
        token: linkedInAccessToken,
        author: `urn:li:person:${authorId}`,
        data: textContent,
        image: src,
        blogId: blog_id,
      };
      try {
        axios
          .post(API_BASE_PATH + LI_API_ENDPOINTS.LI_POST, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log(response.data);
            setPublishLinkLoad(false);
            setPublishLinkText("Published on Linkedin");
            toast.success("Published on Linkedin", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          })
          .catch((error) => {
            if (error.response) {
              setPublishLinkLoad(false);
              setPublishLinkText("Publish on Linkedin");
              toast.error(error.response.data.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              console.log(error.response.data);
              console.log(error.response.status);
            } else if (error.request) {
              console.log(error.request);
            } else {
              console.log("Error", error.message);
            }
          });
      } catch (error) {
        console.log("error", error.response.data.message);
      }
    }
  };

  const handleTwitterPublish = () => {
    console.log("handleTwitterPublish");
    if (creditLeft === 0) {
      setTrailModal(true);
    } else {
      const tempDiv = document.createElement("div");
      console.log(tempDiv);
      tempDiv.innerHTML = updatedText;
      var data = {
        token: twitterAccessToken,
        secret: twitterAccessTokenSecret,
        blogId: blog_id,
      };

      // let textContent = tempDiv.textContent;
      var textContent ;
      if(showTwitterThreadUI ===true){
        textContent = twitterThreadData;
        data.texts = textContent;
      }else{
        textContent = tempDiv.textContent;
        data.text = textContent;
      }

      setPublishTweetLoad(true);

      
      if (textContent.length < 280) {
        try {
          axios
            .post(API_BASE_PATH + LI_API_ENDPOINTS.TW_POST, data, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
            .then((response) => {
              console.log(response.data);
              setPublishTweetLoad(false);
              setPublishTweetText("Published on Twitter");
              toast.success("Published on Twitter", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
            })
            .catch((error) => {
              if (error.response) {
                setPublishTweetLoad(false);
                setPublishTweetText("Publish on Twitter");
                toast.error(error.response.data.message, {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
                console.log(error.response.data);
                console.log(error.response.status);
              } else if (error.request) {
                console.log(error.request);
              } else {
                console.log("Error", error.message);
              }
            });
        } catch (error) {
          console.log("error", error.response.data.message);
        }
      } else {
        setPublishTweetLoad(false);
        setPublishTweetText("Publish on Twitter");
        toast.error("Only 280 Character allowed!");
      }
    }
  };

  function handleBlog(e) {
    setOption("blog");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    const newArray = blogData?.publish_data?.filter(
      (obj) => obj.platform === "wordpress"
    );
    var aa;
    const arr = newArray?.find((pd) => pd.published === false);
    if (arr) {
      aa = arr.tiny_mce_data;
    } else {
      if (!newArray) return;
      aa = newArray[newArray?.length - 1].tiny_mce_data;
    }
    const htmlDoc = jsonToHtml(aa);
    // check

    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(e) {
    setOption("linkedin");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    const aa = blogData?.publish_data?.find(
      (pd) => pd.platform === "linkedin"
    ).tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setShowTwitterThreadUI(false);
    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(e) {
    setOption("twitter");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    const aa = blogData?.publish_data?.find(
      (pd) => pd.platform === "twitter"
    );
    const htmlDoc = jsonToHtml(aa.tiny_mce_data);
    console.log('MOVEING TO ');
    if (aa.threads === null || aa.threads === undefined || aa.threads.length === 0 || aa.threads == "") {
      setShowTwitterThreadUI(false);
    } else {
      console.log("THREADS DATA");
      console.log(aa.threads);
       setTwitterThreadData(aa.threads);
      setShowTwitterThreadUI(true);
    }
    setEditorText(htmlDoc);

  }

  if (loading) return <LoaderPlane />;
  return (
    <>
      <ToastContainer />
      {trailModal && (
        <TrialEndedModal setTrailModal={setTrailModal} topic={null} />
      )}
      {/* <Modal
        isOpen={editingMode}
        onRequestClose={() => {
          setEditingMode(false);
        }}
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
            borderRadius: "8px",
            maxWidth: "420px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            paddingBottom: "0px",
          },
        }}
      >
        <div className="pl-4 text-xl font-bold mb-5">
          You are now in The Editor Mode!! 🥳
        </div>
      </Modal> */}
      <Modal
        isOpen={showContributionModal}
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
            // width: "100%",
            maxWidth: "400px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            paddingBottom: "30px",
          },

        }}
        // outside click close
        shouldCloseOnOverlayClick={true}
        onRequestClose={() => setShowContributionModal(false)}

      >
        <div className="flex flex-col items-center justify-center">
          {/* <h3>Buy me a coffee</h3> */}
          <h3 className="text-2xl font-bold text-left ">Buy me a coffee</h3>

        </div>
        <div className="flex flex-col items-center justify-center mt-4">
          <p className="text-sm text-gray-500 text-center">
            If you like our product, please consider buying us a
            cup of coffee.😊
          </p>
        </div>
        <div
          className={`flex justify-around items-center  w-full bg-indigo-100 p-[10px] border-indigo-500 rounded-md mt-[20px]`}
        >
          <div className="flex items-center justify-center text-[40px] ">
            ☕
          </div>
          <div>
            <svg width="30" height="30" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          </div>
          {/* circle and numebr */}

          <div className="flex items-center justify-center ">

            {

              [1, 2, 5].map((item) => (
                <div key={item} className={`flex items-center justify-center w-[40px] h-[40px] rounded-full bg-indigo-500 text-white text-sm font-bold 
                ml-[10px] hover:bg-indigo-700 cursor-pointer ${multiplier === item && 'bg-indigo-700 '}  
                `}
                  onClick={() => setMultiplier(item)}
                >
                  {item}
                </div>

              ))


            }
          </div>
        </div>
        {/* button */}
        <button className="bg-indigo-500 text-white w-full py-2 mt-[20px] rounded-md hover:bg-indigo-700 active:border-2 active:border-indigo-700 active:shadow-md" onClick={handleCheckout}>
          <style>
            {`
            .loader {
            border: 3px solid #ffffff; /* Light grey */ 
            border-top: 3px solid rgb(99,  102,  241); /* Blue border on top */
            border-radius: 50%; /* Rounded shape */
            width: 30px; /* Width of the loader */
            height: 30px; /* Height of the loader */
            animation: spin 2s linear infinite; /* Animation to rotate the loader */
        }

            @keyframes spin {
              0 % { transform: rotate(0deg); } /* Starting position of the rotation */
              100% {transform: rotate(360deg); } /* Ending position of the rotation */
            }
          `}
          </style>
          {

            contributinoModalLoader ? (
              <div className="flex items-center justify-center">
                <div className="loader"></div> {/* Add the loader class here */}
              </div>
            ) : (
              <>Contribute us with {multiplier} {multiplier > 1 ? 'cups' : 'cup'} for      <strong>{`$${(contributionAmout) * multiplier}`}</strong></>
            )
          }
        </button>

      </Modal>
      <Modal
        isOpen={openModal}
        onRequestClose={() => setOpenModal(false)}
        ariaHideApp={false}
        className="w-[100%] sm:w-[38%] max-h-[95%]"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "9998",
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
            // height: "75%",
            width: "80%",
            maxWidth: "580px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            paddingBottom: "0px",
          },
        }}
      >
        <div className="pl-4 text-xl font-bold">Share</div>
        <WhatsappShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <WhatsappIcon size={62} round /> Whatsapp
        </WhatsappShareButton>
        <FacebookShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <FacebookIcon size={62} round /> Facebook
        </FacebookShareButton>
        <TwitterShareButton
          url={text + blog_id}
          hashtags={["lille", "nowg"]}
          className="m-5"
        >
          <TwitterIcon size={62} round />
          Twitter
        </TwitterShareButton>
        <EmailShareButton
          url={text + blog_id}
          subject="Link for my Blog"
          className="Demo__some-network__share-button m-5"
        >
          <EmailIcon size={62} round /> Email
        </EmailShareButton>
        <TelegramShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <TelegramIcon size={62} round /> Telegram
        </TelegramShareButton>
        <div className="p-5 pl-2 flex">
          <input
            type="text"
            value={text + blog_id}
            className="w-[70%] h-[40px] mr-5"
          />
          <CopyToClipboard text={text + blog_id} onCopy={onCopyText}>
            <div className="copy-area">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Copy
              </button>
              <span className={`copy-feedback ${isCopied ? "active" : ""}`}>
                Copied!
              </span>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
        handleSave={handleSave}
        bid={blog_id}
      />
      <div
        style={{
          paddingBottom: "0.5em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="text-sm mx-2"
      >
        {isAuthenticated ? (
          <div
            style={{
              display: "flex",
              gap: "0.25em",
            }}
          >
            <div
              className="blog-toggle-button cta active wordpress flex gap-1 items-center"
              onClick={handleBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="19px"
                height="19px"
              >
                <path d="M 30.398438 2 L 7 2 L 7 48 L 43 48 L 43 14.601563 Z M 15 28 L 31 28 L 31 30 L 15 30 Z M 35 36 L 15 36 L 15 34 L 35 34 Z M 35 24 L 15 24 L 15 22 L 35 22 Z M 30 15 L 30 4.398438 L 40.601563 15 Z" />
              </svg>
              Blog
            </div>
            <div
              className="blog-toggle-button cta linkedin flex gap-1 items-center"
              onClick={handleLinkedinBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="20px"
                height="20px"
              >
                <path
                  fill="#0288D1"
                  d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
                />
                <path
                  fill="#FFF"
                  d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
                />
              </svg>
              Linkedin
            </div>
            <div
              className="blog-toggle-button cta twitter flex gap-1 items-center"
              onClick={handleTwitterBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="20px"
                height="20px"
              >
                <path
                  fill="#03A9F4"
                  d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429"
                />
              </svg>
              Twitter
            </div>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {!isPublished ? (
          <div className="flex" style={{ gap: "0.25em", marginLeft: "auto" }}>
            <button
              className="cta"
              onClick={() => {
                if (saveText === "Save Now!") handleSave();
              }}
            >
              {saveLoad ? (
                <ReactLoading
                  width={25}
                  height={25}
                  round={true}
                  color={"#2563EB"}
                />
              ) : (
                saveText
              )}
            </button>
            {option === "linkedin" ? (
              linkedInAccessToken ? (
                <button
                  className="cta-invert"
                  onClick={() => {
                    if (
                      publishLinkText === "Publish on Linkedin" ||
                      publishLinkText === "Published on Linkedin"
                    )
                      handlePublish();
                  }}
                >
                  {publishLinkLoad ? (
                    <ReactLoading
                      width={25}
                      height={25}
                      round={true}
                      color={"#2563EB"}
                    />
                  ) : (
                    publishLinkText
                  )}
                </button>
              ) : (
                <button className="cta-invert" onClick={handleconnectLinkedin}>
                  Connect with Linkedin
                </button>
              )
            ) : option === "twitter" ? (
              twitterAccessToken ? (
                <button
                  className="cta-invert"
                  onClick={() => {
                    if (
                      publishTweetText === "Publish on Twitter" ||
                      publishTweetText === "Published on Twitter"
                    )
                      handleTwitterPublish();
                  }}
                >
                  {publishTweetLoad ? (
                    <ReactLoading
                      width={25}
                      height={25}
                      round={true}
                      color={"#2563EB"}
                    />
                  ) : (
                    publishTweetText
                  )}
                </button>
              ) : (
                <button className="cta-invert" onClick={handleconnectTwitter}>
                  Connect Twitter
                </button>
              )
            ) : isAuthenticated ? (
              <button
                className="cta-invert"
                onClick={publishText === "Publish" && handleSavePublish}
              >
                {publishLoad ? (
                  <ReactLoading
                    width={25}
                    height={25}
                    round={true}
                    color={"#2563EB"}
                  />
                ) : (
                  <>
                    <div className="flex">
                      <PaperAirplaneIcon className="w-5 h-5 mr-1" />
                      {publishText}
                    </div>
                  </>
                )}
              </button>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className="flex" style={{ gap: "0.25em", marginLeft: "auto" }}>
            <button
              className="cta"
              onClick={saveText === "Save Now!" && handleSave}
            >
              {saveLoad ? (
                <ReactLoading
                  width={25}
                  height={25}
                  round={true}
                  color={"#2563EB"}
                />
              ) : (
                "Update"
              )}
            </button>
            {option === "linkedin" ? (
              linkedInAccessToken ? (
                <button
                  className="cta-invert"
                  onClick={() => {
                    if (
                      publishLinkText === "Publish on Linkedin" ||
                      publishLinkText === "Published on Linkedin"
                    )
                      handlePublish();
                  }}
                >
                  {publishLinkLoad ? (
                    <ReactLoading
                      width={25}
                      height={25}
                      round={true}
                      color={"#2563EB"}
                    />
                  ) : (
                    publishLinkText
                  )}
                </button>
              ) : (
                <button className="cta-invert" onClick={handleconnectLinkedin}>
                  Connect with Linkedin
                </button>
              )
            ) : option === "twitter" ? (
              twitterAccessToken ? (
                <button
                  className="cta-invert"
                  onClick={() => {
                    if (
                      publishTweetText === "Publish on Twitter" ||
                      publishTweetText === "Published on Twitter"
                    )
                      handleTwitterPublish();
                  }}
                >
                  {publishTweetLoad ? (
                    <ReactLoading
                      width={25}
                      height={25}
                      round={true}
                      color={"#2563EB"}
                    />
                  ) : (
                    publishTweetText
                  )}
                </button>
              ) : (
                <button className="cta-invert" onClick={handleconnectTwitter}>
                  Connect Twitter
                </button>
              )
            ) : (
              <button
                className="flex cta-invert"
                onClick={() => setOpenModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 mr-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
                Share
              </button>
            )}
          </div>
        )}
      </div>
      {isalert && (
        <div className="p-2 text-xs">Lille is not responsible for any images uploaded by you that  contain copyright infringement.
          <button
            onClick={() => {
              setAlert(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-6 ml-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      )}

      {
        showTwitterThreadUI === false ?
          <>
            <Editor
              value={updatedText || editorText}
              apiKey="tw9wjbcvjph5zfvy33f62k35l2qtv5h8s2zhxdh4pta8kdet"
              init={{
                setup: (editor) => {
                  if (editor.inline) {
                    registerPageMouseUp(editor, throttledStore);
                  }
                },
                init_instance_callback: function (editor) {
                  editor.on("ExecCommand", function (e) {
                    console.log("The " + e.command + " command was fired.");
                    if (e.command === "mceImage") {
                      setAlert(true);
                      console.log("777");
                    }
                    if (isEditing) {
                      // setEditingMode(true);
                      isEditing = false;
                    }
                  });
                },
                skin: "naked",
                icons: "small",
                toolbar_location: "bottom",
                plugins: "lists code table codesample link",
                menubar: false,
                statusbar: false,
                height: "82vh",
                images_upload_base_path: `https://pluarisazurestorage.blob.core.windows.net/nowigence-web-resources/blogs`,
                images_upload_credentials: true,
                plugins:
                "preview casechange importcss tinydrive searchreplace save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount  editimage help formatpainter permanentpen pageembed charmap emoticons advtable export mergetags",
                menu: {
                  tc: {
                    title: "Comments",
                    items: "addcomment showcomments deleteallconversations",
                  },
                },
                toolbar:
                  "undo redo image| bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
                image_title: true,
                automatic_uploads: true,
                file_picker_types: "image",
                file_picker_callback: function (cb, value, meta) {
                  console.log("852");
                  var input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");
                  var url = API_BASE_PATH + `/upload/image`;
                  var xhr = new XMLHttpRequest();
                  var fd = new FormData();
                  xhr.open("POST", url, true);

                  input.onchange = function () {
                    var file = this.files[0];
                    var reader = new FileReader();
                    xhr.onload = function () {
                      if (xhr.readyState === 4 && xhr.status === 200) {
                        // File uploaded successfully
                        var response = JSON.parse(xhr.responseText);

                        // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                        var url = response.url;
                        setImageURL(url);
                        setAlert(true);
                        console.log("response.data", response.data);
                        console.log("imageURL", imageURL);
                        console.log("88", url);
                        console.log("999", load);
                        setLoad(false);
                        // Create a thumbnail of the uploaded image, with 150px width
                        cb(url, { title: response.type });
                      }
                    };

                    reader.onload = function () {
                      setLoad(true);
                      var id = "blobid" + new Date().getTime();
                      var blobCache =
                        window.tinymce.activeEditor.editorUpload.blobCache;
                      var base64 = reader.result.split(",")[1];

                      var blobInfo = blobCache.create(id, file, base64);
                      blobCache.add(blobInfo);

                      // call the callback and populate the Title field with the file name

                      // fd.append("upload_preset", unsignedUploadPreset);
                      // fd.append("path", "browser_upload");
                      fd.append("file", blobInfo.blob());

                      xhr.send(fd);
                    };

                    reader.readAsDataURL(file);
                  };

                  input.click();
                },
                images_upload_handler: (blobInfo, success, failure) => {
                  /*var formdata = new FormData();
                  formdata.append("file", blobInfo.blob());
        
                  var requestOptions = {
                    method: "POST",
                    body: formdata,
                    redirect: "follow",
                  };
        
                  fetch("https://maverick.lille.ai/upload/image", requestOptions)
                    // .then((response) => response.text())
                    // .then((result) => {
                    //   const data = JSON.parse(result);
                    //   success(data.url);
                    // })
                    .catch((error) => console.log("error", error));*/

                  console.log("Harsh test this block");

                  const formdata = new FormData();
                  formdata.append("file", blobInfo.blob());

                  const config = {
                    method: "post",
                    url: API_BASE_PATH + "/upload/image",
                    data: formdata,
                  };

                  axios(config)
                    .then((response) => { })
                    .catch((error) => console.log("error", error));
                },
              }}
              onEditorChange={(content, editor) => {
                setEditorText(content);
                setSaveText("Save Now!");
                // console.log(updatedText);
              }}
            />
          </>
          :
          <div
              // overflowscroll verticalscroll
              style={{
                height: "82vh",
                overflowY: "scroll",
                overflowX: "hidden",
                padding: "0px 10px",
              }}
          >
            <Threads threadData ={twitterThreadData} setthreadData={setTwitterThreadData} />
          </div>
      }
      <hr />
    </>
  );
}
 