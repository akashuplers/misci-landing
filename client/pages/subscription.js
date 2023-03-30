import { Fragment, useEffect, useState, useMemo } from "react";
import {
  CardElement,
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useParams } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm";

const Subscription = () => {
  const stripePromise = loadStripe(
    "pk_test_51KYwIFSI8Tkf3wUiAeZww7bVzcqwkbpXHHZsmqtPbZq12ey9Xy96mvA7KPpNQxVyiHbOPqcDm7BQwKdvZETRn4XU00FlHDBiq8"
  );
  const [plans, setPlans] = useState([]);

  const [currentPlan, setCurrentPlan] = useState();

  const [priceId, setPriceId] = useState();
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
    setCurrentPlan({
      subscriptionType: "Yearly",
      price: 1000,
      priceId: "price_1MYowHSI8Tkf3wUilUfJbapv",
    });
    setPriceId("price_1MYowHSI8Tkf3wUilUfJbapv");
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <div className="h-[100%]">
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
          <div className={" d-flex align-items-center pt-2  md:p-5"}>
            <div className="w-100 md:mx-5 d-flex justify-content-evenly text-dark flex flex-col md:flex-row px-8 sm:px-0">
              <div className="w-50 flex flex-col content-center md:items-center  md:text-center">
                <div className="text-[24px] font-bold leading-[28px] mb-[2%] mb-5 md:mb-0">
                  Sign up & Pay
                </div>
                <div className="flex bg-[#ECECF4] items-center rounded-[59px] h-[63px] w-[350px] md:w-[370px] p-[10px] mb-[4%] space-x-[10px]">
                  {plans.length > 0 &&
                    plans.map((item, i) => {
                      return (
                        <div
                          key={i}
                          onClick={() => subscriptionPlan(item)}
                          className={`w-[33%]  text-[18px] font-medium cursor-pointer rounded-[55px] px-[19px] py-[8px] ${
                            currentPlan?.subscriptionType ===
                            item.subscriptionType
                              ? "bg-[#3cc0f6] text-[#13213E]"
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

                  <div className="flex  flex-col items-start justify-start mt-4 hidden md:block">
                    <div className="flex align-middle">
                      {/* <img
                        className="h-[18px] mr-3"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                      <p className=" text-[18px] font-medium mb-4">
                        Unlimited Automation
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
                        24/7 hours support
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
                        Access of 50 Summaries
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
                        Create Unlimited Notes
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
                        Unlimited access of Topic Monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Subscription Form */}
              <CheckoutForm
                currentPlan={currentPlan?.subscriptionType.toLowerCase()}
                priceId={priceId}
                setClickOnSubscibe={setClickOnSubscibe}
              />
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default Subscription;