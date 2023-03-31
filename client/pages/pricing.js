import { useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import Link from "next/link";
import Navbar from "../components/Navbar";
import SwiperComponent from "../components/SwiperComponent";

const featuresData = [
  {
    // icon: Search,
    heading: "Advanced Searches",
    description: "Replacing contemporary keyword searches",
  },
  {
    // icon: Information,
    heading: "Precise Information Retrieval",
    description: "It pulls Data from tools used daily",
  },
  {
    // icon: Reading,
    heading: "Intelligent Reading",
    description: "Reads, Analyzes, and Stores Knowledge",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Pricing() {
  const [priceData, setPriceData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return async () => {
      const pricesRes = await fetch(`${API_BASE_PATH}/stripe/prices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      setPriceData(pricesRes.data.data);
      console.log(pricesRes.data.data);
    };
  }, []);

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState();
  const [priceId, setPriceId] = useState();

  const subscriptionPlan = (plan) => {
    console.log(plan)
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

  useEffect(()=>{
    console.log(currentPlan)
  },[currentPlan])

  useLayoutEffect(() => {
    const fetchPriceId = async () => {
      const pricesRes = await fetch(`${API_BASE_PATH}/stripe/prices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      console.log(pricesRes?.data, "pricesRes");
      const updatedPricesArray = pricesRes?.data?.data?.map((price) => {
        let type = null;
        if (price.recurring.interval === "month") {
          if (price.recurring.interval_count === 3) {
            type = "Quarterly";
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
      setPlans(updatedPricesArray);
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

  return (
    <>
      <div>
        <Navbar isOpen={isOpen} />
        <div className="flex flex-col">
          <div className="sm:mx-auto max-sm:mx-[5%] max-sm:leading-[26px] max-w-7xl bg-white max-sm:pt-5 sm:py-16 pb-0 px-6 lg:px-8">
            <h2 className="text-3xl max-sm:text-left font-bold tracking-tight text-gray-900 sm:text-5xl sm:leading-none lg:text-6xl">
              Pricing
            </h2>
            <p className="sm:pt-6 max-w-2xl max-sm:text-left text-[16px] text-[#484F5F] mx-auto">
              Our affordable pricing scales with your business. We don’t lock
              our features behind expensive plans. You get all the features on
              every plan.
            </p>
          </div>
          <div className="relative top-0 h-auto">
            <div className="h-[380px] w-[100%]"></div>
            <div className="bg-[#111f43] sm:h-[400px] sm:w-[100%]"></div>
            {/* cards div */}
            <div className="absolute max-sm:top-[7%] sm:top-[12%] sm:left-[0%] sm:right-[8%] w-full">
              <div className="flex max-sm:flex-col w-full max-sm:space-y-8 sm:space-x-4 justify-center align-middle items-center">
                <div
                  style={{
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                  }}
                  className="flex sm:flex-wrap sm:flex-row relative max-sm:flex-col bg-[#ffffff] rounded p-4 w-[21rem] md:w-[392px] h-[660px]"
                >
                  <div className="flex flex-col items-start justify-start mt-4">
                    <p className="text-[#182735] font-semibold text-[24px] leading-[26px] pb-2">
                      Free
                    </p>
                    <p className="text-[44px] text-[#182735] leading-[112%] text-left font-bold">
                      Unlimited Access for 14 Days
                    </p>
                  </div>
                  <div className="mt-4 mb-4 bg-gradient-to-r from-[#182735] to-transparent h-[2px]"></div>
                  <div className="flex flex-col items-start justify-start mt-4">
                    <div className="flex align-middle">
                      <p className=" text-[#182735] text-left leading-[26px] text-[18px] font-medium mb-4">
                        Have unlimited access of Summary & Drivers for 14 days
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="bg-[#3CC0F6] bottom-6 inline-block w-[67%] left-[17%] cursor-pointer absolute font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4"
                  >
                    Try for free
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(157.47deg, #182735 14.91%, #15324E 96.07%)",
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                  }}
                  className="flex relative flex-col  rounded text-[#ffffff] p-4 w-[21rem] md:w-[392px] h-[660px]"
                >
                  <div className="flex flex-col  items-start justify-start mt-4">
                    <p className=" font-semibold text-[24px] pb-2 capitalize">
                      Paid
                    </p>
                    <p className="text-[64px]  font-bold">
                      ${currentPlan?.price}
                      <span className="text-[16px] leading-[26px] tracking-[0.5px] text-[#BFC2D9]">
                        /month
                      </span>
                    </p>
                  </div>
                  <div className=" mt-4 mb-4 bg-gradient-to-r from-[#3cc0f6] to-transparent h-[2px]"></div>
                  <div className="flex bg-[#2d4051] items-center rounded-[59px] h-[55px] w-full justify-between px-2">
                    {plans.length > 0 &&
                      plans.map((item, i) => {
                        return (
                          <div
                            key={i}
                            onClick={() => subscriptionPlan(item)}
                            className={`cursor-pointer rounded-[55px] px-[7.5px] md:px-[19px] py-[8px] ${
                              currentPlan?.subscriptionType ===
                              item.subscriptionType
                                ? "bg-[#3cc0f6] text-[#13213E]"
                                : "bg-[#172E43]"
                            }`}
                          >
                            {item.subscriptionType}
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex  flex-col items-start justify-start mt-4">
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
                        className="h-[18px]"
                        src={TickIcon}
                        alt=""
                        srcset=""
                      /> */}
                      <p className="text-[18px] font-medium mb-4">
                        Unlimited access of Topic Monitoring
                      </p>
                    </div>
                  </div>
                  <Link
                    legacyBehavior
                    as={"/subscription"}
                    href={{
                      pathname: "/subscription",
                      query: { currentPlan : JSON.stringify(currentPlan) },
                    }}
                  > 
                    <div className="bg-[#3CC0F6] bottom-6 inline-block w-[67%] left-[17%] cursor-pointer absolute font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4">
                      Get Started
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Features for mobile */}
          <div className="h-[900px] md:hidden md:bg-[#f1f4fa] sm:bg-transparent"></div>
          <div className="w-[100%] sm:hidden bg-[#f1f4fa] flex flex-col h-[726px] mb-[6%] pt-[40%] md:pt[6%]">
            <div className="flex  flex-col justify-start items-start mx-[5%]">
              <h1 className="#0E0E2C align-middle text-[24px] font-semibold">
                Features
              </h1>
              <p className="uppercase text-[18px] pt-3 font-medium opacity-[0.7]">
                SMART APP FOR
              </p>
            </div>
            <div className="mx-[5%] rounded-lg mt-[5%]">
              <SwiperComponent data={featuresData} />
            </div>
            <div className="flex flex-col mx-[5%] mt-[10%]">
              <h1 className="text-[#0E0E2C] text-left text-[24px] font-bold">
                Monitoring
              </h1>
              <div className="text-[#4e475f] leading-[26px] w-[100%] text-left py-3 items-start text-[16px] ">
                Monitor over 170k web news sources with automated retrieval and
                analysis of relevant news articles. Pluaris will create a
                personalized, annotated news feed in the Reader &#39;s page on
                your topics of interest.
              </div>
            </div>
            <div className="mx-[10%] mt-3">
              {/* <img className="" src={} alt="" /> */}
            </div>
          </div>

          {/* Features for desktop */}
          <div
            style={
              {
                // background:
                //   "linear-gradient(180deg, #111D41 23.76%, #192836 23.76%, #F8FAFF 23.77%)",
              }
            }
            className="w-[100%] max-sm:hidden flex flex-col h-[726px] mx-[6%] mt-[6%]"
          >
            <div className="flex  flex-col justify-start items-start">
              <h1 className="#0E0E2C align-middle text-[48px] font-semibold">
                Features
              </h1>
              <p className="uppercase text-[18px] pt-3 font-medium opacity-[0.7]">
                SMART Knowledge management tool with powerful reader
              </p>
            </div>
            <div className="flex flex-wrap space-x-5 space-y-5 py-9">
              {featuresData.map((data) => {
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    boxShadow: "0px 10px 60px rgba(8, 115, 174, 0.08)",
                  }}
                  className="rounded-[4px] bg-[white] p-4 flex flex-col mt-0"
                >
                  <div>
                    <img className="h-[50px]" src={data.icon} alt="" />
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <h1 className="text-[#0e0e2c] text-[24px] font-bold py-2">
                      {data.heading}
                    </h1>
                    <p className="text-[#756f86] font-normal text-[18px] py-2">
                      {data.description}
                    </p>
                  </div>
                </div>;
              })}
            </div>
            <div className="flex justify-start align-center items-start mt-[5%]">
              <div className="items-start flex flex-col align-center pt-[2.5%] w-[55%]">
                <h1 className="text-[#0E0E2C] text-[36px] font-bold">
                  Monitoring
                </h1>
                <div className="text-[#484F5F] leading-[26px] opacity-[0.7] w-[50%] text-left py-3 items-start text-[16px] ">
                  Monitor over 170k web news sources with automated retrieval
                  and analysis of relevant news articles. Pluaris will create a
                  personalized, annotated news feed in the Reader&#39;s page on
                  your topics of interest.
                </div>
              </div>
              <div className="w-[30%]">
                {/* <img className="" src={} alt="" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
