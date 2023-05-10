import React, { useState, useEffect } from "react";
import {
  CardElement,
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { meeAPI } from "../graphql/querys/mee";
import { useQuery } from "@apollo/client";

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

        axios
          .post(API_BASE_PATH + "/stripe/upgrade", requestBody, {
            headers: myHeaders,
          })
          .then((res) => res.data)
          .then((data) => {
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
            const errorMessage =
              error.response.data.error && error.response.data.message;
            if (errorMessage != null) {
              toast.error("Error : " + errorMessage, {
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
          }, 3000);
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
      <div
        style={{
          backdropFilter: "blur(10px)",
          border: "2px solid white",
        }}
        className={" py-3 w-[55%]  px-4  rounded rounded-5 my-3 mx-auto"}
      >
        <div className="px-4 mt-7">
          <h2 className="fw-bold text-4xl  my-2 ">Join us today 👋</h2>
          <div className="mt-3">
            <form>
              <div className="flex space-x-2 mb-3">
                {" "}
                <div className="w-[50%]">
                  {/* <div className="fs-6 my-1 text-[#0A0D13] text-normal">
                    Name on card
                  </div> */}
                  {/* <div>
                    <input
                      style={{
                        border: `2px solid ${
                          formErrors.firstName ? "red" : "#96ABD4"
                        }`,
                      }}
                      type="text"
                      required
                      id="firstNameInput"
                      name="first"
                      maxLength="30"
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        // resetError(e, firstNameField);
                        if (checkForm) {
                          validateForm();
                        }
                      }}
                      placeholder="i.e. John"
                      className={
                        " w-100 text-[14px] bg-none my-1 rounded rounded-1 px-2 py-2"
                      }
                    />
                    {formErrors.firstName && (
                      <span style={{ color: "red" }}>
                        {formErrors.firstName}
                      </span>
                    )}
                     {errors?.first && (
                          <span className={styles.error}>{errors?.first}</span>
                        )} 
                  </div> */}
                </div>
              </div>

              <div className="mb-3 w-full mt-24">
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

                {/* <div>
                        <input
                          placeholder="1234  5678  9101  1121"
                          type="text"
                          name="cardNumber"
                          id="cardNumberInput"
                          onChange={(e) => {
                            
                            setCardNumber(e.target.value);
                            // resetError(e, passwordField);
                          }}
                          className={
                            
                            " w-100 bg-none my-1 rounded rounded-1 px-4 py-2"
                          }
                        />
                      </div> */}
              </div>
              {/* <div className="flex space-x-2 mb-3">
                        <div className="w-[50%]">
                          <div className="fs-6 my-1">Expiration Date</div>
                          <div>
                            <input
                              placeholder="MM/YY"
                              id="expirationDateInput"
                              type="text"
                              name="expirationDate"
                              onChange={(e) => {

                                setExpirationDate(e.target.value);
                              }}
                              className={
                                
                                " w-100 bg-none my-1 rounded rounded-1 px-4 py-2 "
                              }
                            />
                          </div>
                        </div>
                        <div className="w-[50%]">
                          <div className="fs-6 my-1">CVV</div>
                          <div>
                            <input
                              placeholder="123"
                              type="text"
                              name="cvv"
                              id="cvvInput"
                              onChange={(e) => {
                                setCvv(e.target.value);
                              }}
                              className={
                                
                                " w-100 bg-none my-1 rounded rounded-1 px-4 py-2"
                              }
                            />
                          </div>
                        </div>
                      </div> */}
              {/* <div className="my-2 items-center flex flex-col mb-4"> */}
              {/* <div className="flex items-center self-start">
								<input className="" type="checkbox" name="remember" />
								<span className="text-[464f61] text-[16px] pl-2">
									Save card details
								</span>
							</div> */}
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
                  className="bg-[#3CC0F6] text-[16px] cursor-pointer font-bold text-[#13213e] rounded-[4px] py-[20px] w-[100%] mb-3"
                >
                  Subscribe
                </button>
              )}
              {/* <button
                type=""
                className="rounded-[4px] cursor-pointer  text-[16px] font-bold text-[#13213e] py-[20px] w-full"
              >
                <span className="opacity-[0.7]">Cancel</span>
              </button> */}
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
