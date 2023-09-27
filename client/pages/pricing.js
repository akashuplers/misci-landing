import Footer from "@/components/Footer";
import { CheckIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AuthenticationModal from "../components/AuthenticationModal";
import { FeaturesItem } from "../components/FeatureItem";
import Navbar from "../components/Navbar";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import styles from "../styles/price.module.css";
import { MonthlyPlans, STRIPE_CONST_AMOUNT, UpgradeFeatures } from "@/store/appContants";
import MoblieUnAuthFooter from "@/components/LandingPage/MoblieUnAuthFooter";
export default function Pricing() {
  const [priceData, setPriceData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return async () => {
      const pricesRes = await axios({
        method: "get",
        url: `${API_BASE_PATH}/stripe/prices`,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res?.data);

      setPriceData(pricesRes?.data.data);
      console.log(pricesRes?.data.data);
    };
  }, []);

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState();
  const [priceId, setPriceId] = useState();

  const subscriptionPlan = (plan) => {
    console.log(plan);
    let selectPriceData = "";
    if (plan.subscriptionType === "Quarterly") {
      selectPriceData = plans?.filter((item) => {
        return item?.subscriptionType === "Quarterly";
      });
      setPriceId(selectPriceData[0].priceId);
    } else if (plan.subscriptionType === "Yearly") {
      selectPriceData = plans?.filter((item) => {
        return item?.subscriptionType === "Yearly";
      });
      setPriceId(selectPriceData[0].priceId);
    } else {
      selectPriceData = plans?.filter((item) => {
        return item?.subscriptionType === "Monthly";
      });
      setPriceId(selectPriceData[0].priceId);
    }

    setCurrentPlan(plan);
  };

  useEffect(() => {
    console.log(currentPlan);
  }, [currentPlan]);

  useLayoutEffect(() => {
    const fetchPriceId = async () => {
      const pricesRes = await axios({
        method: "get",
        url: `${API_BASE_PATH}/stripe/prices`,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res?.data);

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

      const sortedPlans = updatedPricesArray?.sort((a, b) => {
        const order = ["Monthly", "Quarterly", "Yearly"];
        return (
          order.indexOf(a.subscriptionType) - order?.indexOf(b.subscriptionType)
        );
      });

      console.log(sortedPlans);
      setPlans(sortedPlans);
    };
    fetchPriceId();
  }, []);

  useEffect(() => {
    if (plans && plans?.length) setCurrentPlan(plans[0]);
    if (plans?.length > 0) {
      const temp = plans?.filter((item) => {
        return item?.subscriptionType === "Yearly";
      });
      setPriceId(temp[0].priceId);
    }
  }, [plans]);

  const [type, setType] = useState("signup");
  const heightRef = useRef(null);
  const [heightOfAnother, setHeightOfAnother] = useState(0);
  useEffect(() => {
    if (heightRef.current) {
      setHeightOfAnother(heightRef.current.offsetHeight);
    }
  }, [heightRef]);

  return (
    <>
      <div className="relative  ">
        <AuthenticationModal
          type={type}
          setType={setType}
          modalIsOpen={isOpen}
          setModalIsOpen={setIsOpen}
          handleSave={() => (window.location = "/")}
          bid={""}
        />
        <Navbar isOpen={isOpen} />

        <div className="flex flex-col ">
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
          <div className="relative h-auto">
            <div className="h-[500px] w-[100%]"></div>
            <div className=" sm:h-[400px] sm:w  -[100%]"></div>

            <div className="absolute max-sm:top-[20%] sm:top-[15%] lg:top-[5%] sm:left-[0%] sm:right-[8%] w-full">
              <div
                className={
                  styles.pricingContainer + " p-5 pb-10 pt-0 px-10 lg:pl-2"
                }
              >
                <img src="/pricing.png" className="mx-auto center h-40"></img>
                 <p className="text-center mx-auto text-[16px] font-semibold from-[#fb847d] to-black ">
    Empower Your Knowledge Journey with Lille.ai
  </p>
  <p className="text-center mx-auto text-[14px] text-[#0E0E2C]">
    For every thought you generate, we amplify its brilliance.<br></br>
 Let's make it count together!
  </p>
              </div>
              <div className=" mb-28 lg:mb-1 flex max-sm:flex-col w-full max-sm:space-y-8 sm:space-x-4 justify-center align-middle items-center">
                <div
                  style={{
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                    height: heightOfAnother + "px",
                  }}
                  className="flex sm:flex-wrap sm:flex-row relative max-sm:flex-col bg-[#ffffff] rounded-[0.75rem] p-4 w-[21rem] md:w-[392px] lg:h-full h-[600px]"
                >
                  <div className="flex flex-col items-start justify-start gap-4 mt-4">
                    <p className="text-[#182735] font-semibold text-[24px] leading-[26px]">
                      Free
                    </p>
                    <p className="text-[44px] text-[#182735] leading-[112%] text-left font-bold">
                      Full Features Access with 25 Credits
                    </p>
                    <p className=" text-[#182735] text-left leading-[26px] text-[18px] font-medium mb-4">
                      Create and Regenerate contents with free publishing on
                      Lille.ai platform, LinkedIn and three tweets per day on
                      Twitter.
                    </p>
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-[#182735] to-transparent h-[2px]"></div>
                  <div className="flex flex-col items-start justify-start mt-4">
                    <div className="flex align-middle"></div>
                  </div>
                  <div
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="bg-[#fb847d] bottom-2  text-center  absolute w-[40%] inline-block right-[1rem] cursor-pointer  font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4"
                  >
                    Try for free
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(157.47deg, rgb(0 74 174) 14.91%, rgb(0 14 33) 96.07%)",
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                  }}
                  ref={heightRef}
                  className="flex relative flex-col  rounded-[0.75rem] text-[#ffffff] p-4 w-[21rem] md:w-[392px] h-full"
                >
                  <div className="flex flex-col  items-start justify-start mt-4">
                    <p className=" font-semibold text-[24px] pb-2 capitalize">
                      Paid
                    </p>
                    <p className="text-[64px]  font-bold">
                      ${currentPlan?.price}
                    </p>
                  </div>
                  <div className=" mt-4 mb-4 bg-gradient-to-r from-[#fb847d] to-transparent h-[2px]"></div>
<div className="flex bg-[#feffff] items-center rounded-[59px] h-[55px] w-full justify-between px-2">
  {plans?.length > 0 &&
    plans?.map((item, i) => {
      return (
        <div
          key={i}
          onClick={() => subscriptionPlan(item)}
          className={`cursor-pointer rounded-[55px] px-[7.5px] md:px-[25px] py-[8px]
          transition duration-300 ease-in-out
          ${
            currentPlan?.subscriptionType === item.subscriptionType
              ? "bg-[#fb847d] text-[#ffffff]"
              : "bg-[#ffffff] text-[#000000]"
          }`}
        >
          {item.subscriptionType}
        </div>
      );
    })}
</div>


                  <div className="flex  flex-col items-start justify-start mt-4">
                    {" "}
                    {UpgradeFeatures.map((item, i) => {
                      return <FeaturesItem key={i} text={item} />;
                    })}
                  </div>
                  <div className="flex flex-col items-end">
                    <Link
                      legacyBehavior
                      as={"/subscription"}
                      href={{
                        pathname: "/subscription",
                        query: { currentPlan: JSON.stringify(currentPlan) },
                      }}
                      className="justify-self-end"
                    >
<div className="bg-[#fb847d] text-center bottom-6 inline-block right-[1rem] cursor-pointer w-[40%] font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4 
    transition-all duration-300 ease-in-out 
    hover:bg-[#f77f6e] hover:scale-105 hover:text-[#ffffff]">
  Get Started
</div>

                    </Link>
                  </div>
                </div>
              </div>
           <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <p className="text-2xl text-center mx-auto"> In the media </p>
          <div className="mx-auto text-center  grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-1 sm:gap-x-10 sm:gap-y-14 lg:mx-auto lg:max-w-2xl lg:grid-cols-3">
         
<a href="https://www.bizjournals.com/albany/inno/stories/news/2023/05/30/nowigence-lille-artificial-intelligence-chatgpt.html">
   <img
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src="https://www.globenewswire.com/content/logo/color.svg"
              alt="Transistor"
              width={158}
              height={48}
            /></a>
<a href="https://fox2now.com/business/press-releases/globenewswire/8848313/lille-ai-is-launched-generate-communications-with-full-traceability-and-control">
            <img
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src="https://fox2now.com/wp-content/uploads/sites/14/2020/02/cropped-FOX2NOW.png"
              alt="Tuple"
              width={158}
              height={48}
            /></a>
      <a href="https://www.bizjournals.com/albany/inno/stories/news/2023/05/30/nowigence-lille-artificial-intelligence-chatgpt.html">
            <img
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
              src="/albany.png"
              alt="SavvyCal"
              width={158}
              height={48}
            /></a>
    
          </div>
          <div className="mt-16 flex justify-center">
            <p className="relative rounded-full bg-gray-50 px-4 py-1.5 text-sm leading-6 text-gray-600 ring-1 ring-inset ring-gray-900/5">
              <span className="hidden md:inline">
                Transistor saves up to $40,000 per year, per employee by working with us.
              </span>
              <a href="#" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true" /> See our case study{' '}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </p>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="mx-auto mt-4 max-w-7xl sm:mt-8 mb-10 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20">
            <img
              className="absolute inset-0 h-full w-full object-cover brightness-150 saturate-0"
              src="https://images.unsplash.com/photo-1601381718415-a05fb0a261f3?ixid=MXwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8ODl8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1216&q=80"
              alt=""
            />
            <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply" />
            <div className="absolute -left-80 -top-56 transform-gpu blur-3xl" aria-hidden="true">
              <div
                className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-[0.45]"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
            <div
              className="hidden md:absolute md:bottom-16 md:left-[50rem] md:block md:transform-gpu md:blur-3xl"
              aria-hidden="true"
            >
              <div
                className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-25"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
            <div className="relative mx-auto max-w-2xl lg:mx-0">
              <img className="h-12 w-auto" src="" alt="" />
              <figure>
                <blockquote className="mt-6 text-lg font-semibold text-white sm:text-xl sm:leading-8">
                  <p>
                    “Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo expedita voluptas culpa sapiente
                    alias molestiae. Numquam corrupti in laborum sed rerum et corporis.”
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-base text-white">
                  <div className="font-semibold">Judith Black</div>
                  <div className="mt-1">CEO of Misci</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-500 p-4 fixed bottom-1 left-1 z-50 mx-0 rounded-md shadow-md text-white max-w-lg  mt-10 text-center">
          For enterprise usage inquiries please contact us at{" "}
          <a href="mailto:sales@lille.ai" className="underline">
            sales@lille.ai
          </a>
        </div>

      </div>
    </>
  );
}

