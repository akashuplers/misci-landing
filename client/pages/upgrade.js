import { STRIPE_PROMISE } from "@/constants";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import CheckoutFormUpgrade from "../components/CheckoutFormUpgrade";
import { FeaturesItem } from "../components/FeatureItem";
import Layout from "../components/Layout";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import {UpgradeFeatures} from '../store/appContants'
export default function Upgrade() {
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
        return order.indexOf(a.subscriptionType) - order.indexOf(b.subscriptionType);
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
  return (
    <>
      <Layout>
        <Elements stripe={stripePromise}>
          {clickOnSubscibe && (
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
          <div className="h-[100%]">
            <div>
              <div className={" d-flex align-items-center py-10  md:py-5"}>
                <div className="w-100 md:mx-5 d-flex justify-content-evenly text-dark flex flex-col md:flex-row px-8 sm:px-0">
                  <div className="w-50 flex flex-col content-center md:items-center  md:text-center">
                    <div className="text-[24px] font-bold leading-[28px] mb-[5%]">
                      UPGRADE
                    </div>
                    <div className="flex bg-[#ECECF4] items-center rounded-[59px] h-[63px] w-[350px] md:w-[370px] p-[10px] mb-[4%] space-x-[10px]">
                      {plans.length > 0 &&
                        plans.map((item, i) => {
                          return (
                            <div
                              key={i}
                              onClick={() => subscriptionPlan(item)}
                              className={`w-[33%]  text-[18px] font-medium cursor-pointer rounded-[55px] px-[19px] py-[8px] ${currentPlan?.subscriptionType ===
                                item.subscriptionType
<<<<<<< HEAD
                                ? "bg-[#3cc0f6] text-[#13213E]"
                                : "bg-[#ECEDF5] text-[#13213E]"
                                }`}
                            // className="bg-[#3cc0f6] cursor-pointer rounded-[55px] px-[19px] py-[8px]"
=======
                                ? "bg-[#fb847d] text-[#13213E]"
                                : "bg-[#ECEDF5] text-[#13213E]"
                                }`}
                            // className="bg-[#fb847d] cursor-pointer rounded-[55px] px-[19px] py-[8px]"
>>>>>>> misc-cp-prod-adg
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
<<<<<<< HEAD
                          "linear-gradient(157.47deg, #182735 14.91%, #15324E 96.07%)",
=======
                          "linear-gradient(157.47deg, rgb(0 74 174) 14.91%, rgb(0 14 33) 96.07%)",
>>>>>>> misc-cp-prod-adg
                        boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                      }}
                      className="flex relative flex-col  rounded-[4px] text-[#ffffff] p-4 w-[306px] sm:w-[392px] lg:h-full md:h-[590px] h-[200px]"
                    >
                      <div className="flex flex-col  items-start justify-start mt-4">
                        <p className=" font-semibold text-[24px] pb-2 capitalize">
                          {currentPlan?.subscriptionType}
                        </p>
                        <p className="text-[64px]  font-bold">
                          ${currentPlan?.price}
                          {/* <span className="text-[16px] leading-[26px] tracking-[0.5px] text-[#BFC2D9]">
                            /month
                          </span> */}
                        </p>
                      </div>
<<<<<<< HEAD
                      <div className="h-[2px] mt-4 mb-4 bg-gradient-to-r from-[#3cc0f6] to-transparent h-[2px] hidden md:block"></div>
=======
                      <div className="h-[2px] mt-4 mb-4 bg-gradient-to-r from-[#fb847d] to-transparent h-[2px] hidden md:block"></div>
>>>>>>> misc-cp-prod-adg

                      <div className="flex  flex-col items-start justify-start mt-4 hidden md:block text-left">
                        {UpgradeFeatures.map((item, i) => {
                          return (
                            <FeaturesItem key={i} text={item} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Subscription Form */}
                  <CheckoutFormUpgrade
                    currentPlan={currentPlan?.subscriptionType?.toLowerCase()}
                    priceId={currentPlan?.priceId}
                    setClickOnSubscibe={setClickOnSubscibe}
                    interval={currentPlan?.subscriptionType}
                  />
                </div>
              </div>
            </div>
          </div>
        </Elements>
      </Layout >
    </>
  );
}

