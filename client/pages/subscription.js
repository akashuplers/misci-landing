import { Fragment, useEffect, useState, useMemo } from "react";
import {
  CardElement,
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useLocation, useParams } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm";
import Navbar from "../components/Navbar";
import { STRIPE_PROMISE } from "@/constants";

Subscription.getInitialProps = ({ query }) => {
  return { query };
};

export default function Subscription({ query }) {
  const stripePromise = loadStripe(STRIPE_PROMISE);
  const [plans, setPlans] = useState([]);

  const [currentPlan, setCurrentPlan] = useState(JSON.parse(query.currentPlan));

  const [priceId, setPriceId] = useState(JSON.parse(query.currentPlan).priceId);
  const [clickOnSubscibe, setClickOnSubscibe] = useState(false);

  const subscriptionPlan = (plan) => {
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
    console.log(priceId);
    console.log(plan);
    setCurrentPlan(plan);
  };

  useEffect(() => {
    setPlans([
      {
        subscriptionType: "Yearly",
        price: 1000,
        priceId: "price_1MYowHSI8Tkf3wUilUfJbapv",
      },
      {
        subscriptionType: "Quarterly",
        price: 200,
        priceId: "price_1MXm6iSI8Tkf3wUitxemgTER",
      },
      {
        subscriptionType: "Monthly",
        price: 20,
        priceId: "price_1MWfopSI8Tkf3wUiZeFpn6HI",
      },
    ]);
  }, []);

  const [processing, setProcessing] = useState(false);

  console.log(currentPlan);
  return (
    <>
      <Navbar />
      <Elements stripe={stripePromise}>
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
        <div className="h-[100%] px-6">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC" />
                  <stop offset={1} stopColor="#FF80B5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            {clickOnSubscibe && (
              <div className="absolute left-0 right-0 bottom-0 top-0 bg-[#000000c7] z-20  text-white w-full h-full">
                <div className="w-full h-full flex content-center items-center">
                  <h1 className=" text-center m-auto text-3xl">
                    Please wait payment is in Process
                  </h1>
                </div>
              </div>
            )}
            <div className={" d-flex align-items-center py-10  md:py-5"}>
              <div className="w-100 md:mx-5 d-flex justify-content-evenly text-dark flex flex-col md:flex-row px-8 sm:px-0">
                <div className="w-50 flex flex-col content-center md:items-center  md:text-center">
                  <div className="text-[24px] font-bold leading-[28px] mb-[5%]">
                    Sign up & Pay
                  </div>
                  <div className="flex bg-[#ffffff] items-center rounded-[59px] h-[63px] w-[350px] md:w-[370px] p-[10px] mb-[4%] space-x-[10px]">
                    {plans.length > 0 &&
                      plans.map((item, i) => {
                        return (
                          <div
                            key={i}
                            onClick={() => subscriptionPlan(item)}
                            className={`w-[33%]  text-[18px] font-medium cursor-pointer rounded-[55px] px-[19px] py-[8px] ${
                              currentPlan?.subscriptionType ===
                              item.subscriptionType
                                ? "bg-[#3cc0f6] text-[#ffffff]"
                                : "bg-[#ECEDF5] text-[#13213E]"
                            }`}
                            // className="bg-[#3cc0f6] cursor-pointer rounded-[55px] px-[19px] py-[8px]"
                          >
                            {item.subscriptionType}
                          </div>
                        );
                      })}
                  </div>
                  {/* Left Side Card */}
                  <div
                    style={{
                      background:
                        "linear-gradient(157.47deg, #182735 14.91%, #15324E 96.07%)",
                      boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                    }}
                    className="flex relative flex-col  rounded-[4px] text-[#ffffff] p-4 w-[306px] sm:w-[392px] md:h-[590px] h-[200px]"
                  >
                    <div className="flex flex-col  items-start justify-start mt-4">
                      <p className=" font-semibold text-[24px] pb-2 capitalize">
                        {currentPlan?.subscriptionType}
                      </p>
                      <p className="text-[64px]  font-bold">
                        ${currentPlan?.price}
                        <span className="text-[16px] leading-[26px] tracking-[0.5px] text-[#BFC2D9]">
                          /month
                        </span>
                      </p>
                    </div>
                    <div className="h-[2px] mt-4 mb-4 bg-gradient-to-r from-[#3cc0f6] to-transparent h-[2px] hidden md:block"></div>

                    <div className="flex  flex-col items-start justify-start mt-4 text-left">
                      <div className="flex align-middle">
                        {/* <img
                        className="h-[18px] mr-3"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                        <p className=" text-[18px] font-medium mb-4">
                          Unlimited ideas generation for blog generation
                        </p>
                      </div>
                      <div className="flex align-middle">
                        {/* <img
                        className="h-[18px] mr-3"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                        <p className=" text-[18px] font-medium mb-4">
                          Create/Regenrate Unlimited Blogs
                        </p>
                      </div>
                      <div className="flex align-middle">
                        {/* <img
                        className="h-[18px] mr-3"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                        <p className=" text-[18px] font-medium mb-4">
                          Unlimited publishing on top social media platforms
                        </p>
                      </div>
                      <div className="flex align-middle">
                        {/* <img
                        className="h-[18px] mr-3"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                        <p className=" text-[18px] font-medium mb-4">
                          Customization possibilities, Talk to our support team
                        </p>
                      </div>
                      <div className="flex align-middle">
                        {/* <img
                        className="h-[18px]"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                        <p className="text-[18px] font-medium mb-4">
                          {/* Unlimited access of Topic Monitoring */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Subscription Form */}
                <CheckoutForm
                  currentPlan={currentPlan?.subscriptionType?.toLowerCase()}
                  priceId={priceId}
                  setClickOnSubscibe={setClickOnSubscibe}
                  setProcessing={setProcessing}
                  processing={processing}
                />
              </div>
            </div>
          </div>
        </div>
        <style>{`
              .loader {
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          border-right: 2px solid rgba(255, 255, 255, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          border-left: 2px solid white;
          animation: spin 1s linear infinite;
          border-radius: 50%;
          width: 24px;
          height: 24px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      </Elements>
    </>
  );
}
