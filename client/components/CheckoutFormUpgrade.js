import { useQuery } from "@apollo/client";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import { useState } from "react";
import Confetti from "react-confetti";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import { meeAPI } from "../graphql/querys/mee";

const CheckoutFormUpgrade = ({
  priceId,
  currentPlan,
  setClickOnSubscibe,
  interval,
}) => {
  const [firstName, setFirstName] = useState("");
  const [btnClicked, setBtnClicked] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [checkForm, setCheckForm] = useState(false);
  const [confirmed, setconfirmed] = useState(false);

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
          window.location.href = "/";
        }
      }
    },
  });

  const stripe = useStripe();
  const elements = useElements();
  console.log("plan:", currentPlan);

  const validateForm = () => {
    let errors = {};

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const createSubscription = async () => {
    setCheckForm(true);
    if (validateForm()) {
      setBtnClicked(true);
      setClickOnSubscibe(true);
      subscribe(checkForm);
    }
    // call the backend to create subscription
  };

  const subscribe = async (userDetails) => {
    try {
      // create a payment method
      const paymentMethod = await stripe?.createPaymentMethod({
        type: "card",
        card: elements?.getElement(CardElement),
        billing_details: {
          name: meeData?.me?.name,
          email: meeData?.me?.email,
        },
      });
      console.log(paymentMethod);
      if (paymentMethod?.error?.message) {
        setProcessing(false);
        setDisabled(false);
        setBtnClicked(false);
        setClickOnSubscibe(false);
        toast.error(paymentMethod?.error?.message, {
          position: "top-center",
          autoClose: true,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        var getToken;
        if (typeof window !== "undefined") {
          getToken = localStorage.getItem("token");
        }
        const myHeaders = {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        };

        const requestBody = {
          paymentMethodId: paymentMethod?.paymentMethod?.id,
          priceId: priceId,
          interval: interval,
        };

        console.log("test body", requestBody);

        axios
          .post(API_BASE_PATH + "/stripe/upgrade", requestBody, {
            headers: myHeaders,
          })
          .then((res) => {
            console.log(res, "888");
            const data = res.data;
            console.log(data.data);
            console.log(data.data.status);
            if (data.data.status === "requires_action") {
              confirmPaymentFunction(
                data.data.clientSecret,
                data.data.subscriptionId
              );
            }
          })
          .catch((error) => {
            console.log("error", error);
            const errorMessage = error?.response?.data?.data;
            if (errorMessage != null) {
              setProcessing(false);
              setDisabled(false);
              setBtnClicked(false);
              setClickOnSubscibe(false);
              toast.error(errorMessage, {
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
            console.error("Error : ", error.response);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const upgradeconfirm = (subscriptionId) => {
    var getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }

    axios
      .post(
        API_BASE_PATH + "/stripe/upgrade-confirm",
        { subscriptionId: subscriptionId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken,
          },
        }
      )
      .then((result) => result.data)
      .then((data) => {
        if (data.data === "Upgrade Confirmed!") {
          setconfirmed(true);
          toast.success(data.data, {
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
          }, 5000);
        } else {
          toast.error(data, {
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
      .catch((error) => console.log("error", error));
  };

  const confirmPaymentFunction = async (clientSecret, subscriptionId) => {
    const confirmPayment = await stripe?.confirmCardPayment(clientSecret);
    if (confirmPayment?.error) {
      history.push("/error");
      setClickOnSubscibe(false);
      toast.error(confirmPayment.error.message);
    } else {
      setClickOnSubscibe(false);
      if (!confirmPayment?.error?.message) {
        upgradeconfirm(subscriptionId);
      } else {
        console.log("err", confirmPayment?.error);
      }
    }
  };

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  return (
    <>
      <ToastContainer />
      {confirmed && (
        <>
          <Confetti />
          <Modal
            isOpen={true}
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
                height: "450px",
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
            <div className="mx-auto pb-4">
              <img className="mx-auto h-40" src="/firework.png" />
            </div>
            <div className="ml-[15%] font-bold text-2xl pl-[10%] mt-9">
              Congratulations 🥳
            </div>
            <p className="text-gray-500 ml-[15%] text-base font-medium mt-4 mx-auto pl-5 align-middle">
              Your Subscription is now confirmed!!
            </p>
            <p className="text-gray-500 ml-[15%] text-base font-medium mt-4 mx-auto pl-5 align-middle">
              Account loaded with prescribed credits.
            </p>
            <div className="ml-[25%] flex m-6">
              <button
                class="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Let&#39;s Go!
              </button>
            </div>
          </Modal>
        </>
      )}
      <div
        style={{
          backdropFilter: "blur(10px)",
          border: "2px solid white",
        }}
        className={
          " py-3 w-full lg:w-[55%]  lg:px-4  rounded rounded-5 my-3 mx-auto"
        }
      >
        <div className="px-4 mt-7">
          <h2 className="fw-bold text-4xl  my-2 ">Join us today 👋</h2>
          <div className="mt-3">
            <form>
              <div className="flex space-x-2 mb-3">
                {" "}
                <div className="w-[50%]"></div>
              </div>

              <div className="mb-3 w-full mt-1 lg:mt-24">
                <div className="fs-6 my-1">Card Number</div>
                <div
                  style={{
                    border: "2px solid #96ABD4",
                  }}
                  className={
                    " w-100 bg-none my-1 rounded rounded-1 px-2 py-1.5"
                  }
                  // className=" rounded-[4px]"
                >
                  <CardElement
                    className="noob"
                    options={{
                      style: {
                        base: {
                          // backgroundColor: "#F9F9F9",
                          color: "#424770",
                          fontSize: "16px",
                          lineHeight: "24px",
                          fontSmoothing: "antialiased",
                          padding: "12px",
                          border: "1px solid #E6EBF1",
                          borderRadius: "4px",
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* </div> */}
              {btnClicked ? (
                <button
                  disabled
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                  className="bg-[#3CC0F6] text-[16px] opacity-50 font-bold text-[#13213e] rounded-[4px] py-[20px] w-[100%] mb-3"
                >
                  Subscribe
                  {/* {btnClicked && <div className={styles.subsloader}></div>} */}
                </button>
              ) : (
                <button
                  disabled={processing || disabled}
                  // type="submit"

                  onClick={(e) => {
                    e.preventDefault();
                    createSubscription();
                  }}
                  className="mt-6 border-2 w-full border-purple-500 text-purple-500 rounded-lg py-2 px-4 hover:bg-purple-500 hover:text-white transition-colors duration-300"
                >
                  Subscribe
                </button>
              )}
            </form>
            <div className="text-[#606060] text-[14px] leading-[22px]">
              Your personal data will not be used however, your app usage data
              will be used as feedback to support and make your experience
              better throughout your journey with us. Also we advise to check
              out our privacy policy.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutFormUpgrade;
