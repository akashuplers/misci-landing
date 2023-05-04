import React, { useState, useEffect } from "react";
import {
  CardElement,
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

const CheckoutForm = ({
  priceId,
  currentPlan,
  setClickOnSubscibe,
  setProcessing,
  processing,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnClicked, setBtnClicked] = useState(false);
  var tempUserId;
  if (typeof window !== "undefined") {
    tempUserId = localStorage.getItem("tempId");
  }
  var tempCompanyId;
  if (typeof window !== "undefined") {
    tempCompanyId = localStorage.getItem("companyId");
  }
  const [error, setError] = useState(null);

  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [checkForm, setCheckForm] = useState(false);

  console.log(formErrors);

  console.log(tempUserId);
  const stripe = useStripe();
  const elements = useElements();
  console.log("plan:", currentPlan);

  const validateForm = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // email regex
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm; // password regex

    if (!firstName) {
      errors.firstName = "First name is required";
    }
    if (!lastName) {
      errors.lastName = "Last name is required";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      errors.password =
        "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const createSubscription = async () => {
    setCheckForm(true);
    if (validateForm()) {
      setBtnClicked(true);
      setProcessing(true);
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
          name: firstName,
          email: email,
        },
      });
      console.log(paymentMethod);
      /*const response = await fetch(`${API_BASE_PATH}/stripe/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod?.paymentMethod?.id,
          firstName: firstName,
          lastName: lastName,
          tempUserId: tempUserId,
          email: email,
          priceId: priceId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.data);
          console.log(data.data.status);
          if (data.data.status === "requires_action") {
            //confirmPaymentFunction(data.data.clientSecret);
          }
        })
        .catch((err) => console.log(err));*/
      var response;
      try {
        response = await axios({
          method: "post",
          url: `${API_BASE_PATH}/stripe/subscribe`,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            paymentMethodId: paymentMethod?.paymentMethod?.id,
            firstName: firstName,
            lastName: lastName,
            tempUserId: tempUserId,
            email: email,
            priceId: priceId,
          },
        });
        const data = response.data;
        console.log(data.data);
        console.log(data.data.status);
        if (data.data.status === "requires_action") {
          confirmPaymentFunction(data.data.clientSecret);
        }
      } catch (error) {
        console.log(error);
      }

      console.log("*****", response);
    } catch (error) {
      console.log(error);
    }
  };

  const createUser = async (payload) => {
    try {
      console.log("payload", payload);
      await axios
        .post(`${API_BASE_PATH}/auth/user/create`, payload)
        .then(() => {
          axios
            .post(
              API_BASE_PATH + API_ROUTES.LOGIN_ENDPOINT,
              { email: payload.email, password: payload.password },
              {
                headers: {
                  "Content-type": "application/json",
                },
              }
            )
            .then((response) => {
              const data = response.data;
              console.log(data);
              if (data.success === false) {
                alert("some error happened");
                // toast.error(data.message, {
                //   position: "top-center",
                //   autoClose: 5000,
                //   hideProgressBar: false,
                //   closeOnClick: true,
                //   pauseOnHover: true,
                //   draggable: true,
                //   progress: undefined,
                //   theme: "light",setClickOnSubscibe
                // });
              } else if (data?.data?.accessToken) {
                //redirectPageAfterLogin(data);
                setProcessing(false);
                localStorage.setItem(
                  "token",
                  JSON.stringify(data.data.accessToken).replace(/['"]+/g, "")
                );

                var getToken;
                if (typeof window !== "undefined") {
                  getToken = localStorage.getItem("token");
                }

                const myHeaders = {
                  "content-type": "application/json",
                  Authorization: "Bearer " + getToken,
                };

                const raw = {
                  query:
                    "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n prefFilled\n profileImage\n  }\n}",
                };

                axios
                  .post(API_BASE_PATH + API_ROUTES.GQL_PATH, raw, {
                    headers: myHeaders,
                  })
                  .then((response) => response.data)
                  .then((response) =>
                    localStorage.setItem(
                      "userId",
                      JSON.stringify(response.data.me._id).replace(/['"]+/g, "")
                    )
                  )
                  .catch((error) => console.error(error))
                  .finally(() => {
                    if (window.location.pathname === "/subscription") {
                      window.location.href = "/";
                    }
                  });
              }
            })
            .catch((error) => {
              console.error("Error: ", error);
            });
        });
      console.log("In create user");
      console.log("====================================");
      // console.log(userDetails);
      console.log("====================================");
      setClickOnSubscibe(false);
      //   history.push("/loginlight");
      // setTimeout((window.location.href = "/loginlight"), 4000);
    } catch (error) {
      if (error.response.data.message === "User already exists") {
        console.log("In create user catch block");
        // history.push("/loginlight");
        // setTimeout((window.location.href = "/loginlight"), 4000);
      }
      throw error;
    }
  };

  const confirmPaymentFunction = async (clientSecret) => {
    const confirmPayment = await stripe?.confirmCardPayment(clientSecret);
    if (confirmPayment?.error) {
      history.push("/error");
      setClickOnSubscibe(false);
      toast.error(confirmPayment.error.message);
    } else {
      setClickOnSubscibe(false);
      if (!confirmPayment?.error?.message) {
        createUser({
          firstName: firstName,
          lastName: lastName,
          tempUserId: tempUserId,
          password: password,
          email: email,
          interval: currentPlan,
          paid: true,
          isSubscribed: true,
        });
      } else {
        console.log("err", confirmPayment?.error);
      }

      console.log("In confirm payment function");
      toast.success("Success! Check your email for the invoice.");
    }
  };

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  return (
    <div
      style={{
        backdropFilter: "blur(10px)",
      }}
      className={" py-3  px-4 w-[50%] mx-auto rounded rounded-5 my-3"}
    >
      <div className="px-4 mt-7">
        <h2 className="fw-bold text-4xl  my-2 ">Join us today 👋</h2>
        <div className="mt-3">
          <form>
            <div className="flex space-x-2 mb-3">
              {" "}
              <div className="w-[50%]">
                <div className="fs-6 my-1 text-[#0A0D13] text-normal">
                  First Name
                </div>
                <div>
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
                    <span style={{ color: "red" }}>{formErrors.firstName}</span>
                  )}
                  {/* {errors?.first && (
                          <span className={styles.error}>{errors?.first}</span>
                        )} */}
                </div>
              </div>
              <div className="w-[50%]">
                <div className="fs-6 my-1">Last Name</div>
                <div>
                  <input
                    style={{
                      border: `2px solid ${
                        formErrors.lastName ? "red" : "#96ABD4"
                      }`,
                    }}
                    type="text"
                    id="lastNameInput"
                    name="last"
                    onChange={(e) => {
                      setLastName(e.target.value);
                      // resetError(e, lastNameField);
                      if (checkForm) {
                        validateForm();
                      }
                    }}
                    placeholder="i.e. Smith"
                    className={
                      " w-100 text-[14px] bg-none my-1 rounded rounded-1 px-2 py-2"
                    }
                  />
                  {formErrors.lastName && (
                    <span style={{ color: "red" }}>{formErrors.lastName}</span>
                  )}
                  {/* {errors?.last && (
                          <span className={styles.error}>{errors?.last}</span>
                        )} */}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mb-3">
              <div className="w-[50%]">
                <div className="fs-6 my-1">Email Address</div>
                <div>
                  <input
                    style={{
                      border: `2px solid ${
                        formErrors.email ? "red" : "#96ABD4"
                      }`,
                    }}
                    placeholder="i.e. davon@mail.com"
                    id="emailInput"
                    required
                    type="text"
                    name="email"
                    onChange={(e) => {
                      // resetError(e, emailField);
                      setEmail(e.target.value);
                      if (checkForm) {
                        validateForm();
                      }
                    }}
                    className={
                      " w-100 text-[14px] bg-none my-1 rounded rounded-1 px-2 py-2 "
                    }
                  />
                  {formErrors.email && (
                    <span style={{ color: "red" }}>{formErrors.email}</span>
                  )}
                  {/* {errors?.email && (
                          <span className={styles.error}>{errors?.email}</span>
                        )} */}
                </div>
              </div>
              <div className="w-[50%] ">
                <div className="fs-6 my-1">Password</div>
                <div>
                  <input
                    style={{
                      border: `2px solid ${
                        formErrors.password ? "red" : "#96ABD4"
                      }`,
                    }}
                    placeholder="**********"
                    type="password"
                    name="password"
                    required
                    id="passwordInput"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // resetError(e, passwordField);
                      if (checkForm) {
                        validateForm();
                      }
                    }}
                    className={
                      " w-100 text-[14px] bg-none my-1 rounded rounded-1 px-2 py-2"
                    }
                  />
                  {formErrors.password && (
                    <span style={{ color: "red" }}>{formErrors.password}</span>
                  )}
                  {/* {errors?.password && (
                          <span className={styles.error}>
                            {errors?.password}
                          </span>
                        )} */}
                </div>
              </div>
            </div>
            <div className="mb-3 w-full">
              <div className="fs-6 my-1">Card Number</div>
              <div
                style={{
                  border: "2px solid #96ABD4",
                }}
                className={" w-100 bg-none my-1 rounded rounded-1 px-2 py-1.5"}
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
            <button
              onClick={() => {
                window.location.href = "/pricing";
              }}
              className="rounded-[4px] cursor-pointer  text-[16px] font-bold text-[#13213e] py-[20px] w-full"
            >
              <span className="opacity-[0.7]">Cancel</span>
            </button>
          </form>
          <div className="text-[#606060] text-[14px] leading-[22px]">
            Your personal data will be used to process your order, support your
            experience throughout this website, and for other purposes described
            in our privacy policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
