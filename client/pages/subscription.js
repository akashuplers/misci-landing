import { STRIPE_PROMISE } from "@/constants";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from 'axios';
import { useEffect, useState } from "react";
import CheckoutForm from "../components/CheckoutForm";
import Navbar from "../components/Navbar";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import FeaturesItem from "../components/FeatureItem";
import { MonthlyPlans, STRIPE_CONST_AMOUNT , UpgradeFeatures} from "@/store/appContants";


async function fetchDynamicPriceData() {
  var priceData = [];
  const response = await axios({
    method: "get",
    url: `${API_BASE_PATH}/stripe/prices`,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.data);
  response.data.data.forEach((item) => {
    const priceId = item.id;
    // const planType = item.recurring.interval;
    var planType = "";
    if (item.recurring.interval === 'month' && item.recurring.interval_count === 3) {
      planType = 'Quarterly';
    } else {
      planType = item.recurring.interval.charAt(0).toUpperCase() + item.recurring.interval.slice(1) + 'ly';
    }
    const amount = item.unit_amount / STRIPE_CONST_AMOUNT;
    priceData.push({ priceId, subscriptionType: planType, price: amount });
  });
  console.log('PRICE DATA');

  console.log(priceData);
  const sortedPlans = priceData.sort((a, b) => {
    const order = ["Monthly", "Quarterly", "Yearly"];
    return order.indexOf(a.subscriptionType) - order.indexOf(b.subscriptionType);
  });

  console.log(sortedPlans);
  // setPlans(sortedPlans);
  return priceData;
}

Subscription.getInitialProps = ({ query }) => {
  return { query };
};

export default function Subscription({ query }) {

  const stripePromise = loadStripe(STRIPE_PROMISE);
  const [plans, setPlans] = useState([]);

  const [currentPlan, setCurrentPlan] = useState(JSON?.parse(query?.currentPlan));

  const [priceId, setPriceId] = useState(JSON?.parse(query?.currentPlan)?.priceId);
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
    fetchDynamicPriceData().then((res) => {
      console.log('FETCH DATA RES');
      console.log(res);
      setPlans(res);
    });

    // setPlans([
    //   {
    //     subscriptionType: "Yearly",
    //     price: 149.95,
    //     priceId: "price_1NBH8eSI8Tkf3wUiOSqVSG4o",
    //   },
    //   {
    //     subscriptionType: "Quarterly",
    //     price: 39.95,
    //     priceId: "price_1NBH8eSI8Tkf3wUidr9GKmVa",
    //   },
    //   {
    //     subscriptionType: "Monthly",
    //     price: 15.95,
    //     priceId: "price_1NBH8eSI8Tkf3wUid4TgFW5w",
    //   },
    // ]);
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
        <div className="h-full px-6">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <SubIcon />
          </div>
          <div>
            {clickOnSubscibe && (
              <div className="absolute left-0 right-0 bottom-0 top-0 bg-[#000000c7] z-20 text-white w-full h-full">
                <div className="w-full h-full flex content-center items-center">
                  <h1 className="text-center m-auto text-3xl">
                    Please wait payment is in Process
                  </h1>
                </div>
              </div>
            )}  
            <div className="flex flex-col md:flex-row py-10 md:py-5">
              <div className="w-full md:mx-5 flex flex-col md:items-center md:text-center">
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
                          className={`w-[49%] text-[18px] text-center font-medium cursor-pointer rounded-[55px] px-[19px] py-[8px] ${currentPlan?.subscriptionType === item.subscriptionType
                            ? "bg-[#fb847d] text-[#ffffff]"
                            : "bg-[#ECEDF5] text-[#13213E]"
                            }`}
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
                      "linear-gradient(157.47deg, rgb(0 74 174) 14.91%, rgb(0 14 33) 96.07%)",
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                  }}
                  className="flex relative flex-col rounded-[4px] text-[#ffffff] p-4 w-full sm:w-[392px]  md:h-full h-full  sm:h-[200px]"
                >
                  <div className="flex flex-col items-start justify-start mt-4">
                    <p className="font-semibold text-[24px] pb-2 capitalize">
                      {currentPlan?.subscriptionType}
                    </p>
                    <p className="text-[64px] font-bold">${currentPlan?.price}</p>
                  </div>
                  <div className="h-[2px] mt-4 mb-4 bg-gradient-to-r from-[#fb847d] to-transparent h-[2px] hidden md:block"></div>

                  <div className="flex flex-col items-start justify-start mt-4 text-left">
                    {UpgradeFeatures.map((item, i) => {
                      return (
                        <FeaturesItem key={i} text={item} />
                      );
                    })}
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
                plans={plans}
              />
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

    @media (max-width: 768px) {
      .flex-col.md:flex-row {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .w-[350px] {
        width: 100%;
      }
      .md:w-[370px] {
        width: 100%;
      }
      .w-[306px] {
        width: 100%;
      }
      .sm:w-[392px] {
        width: 100%;
      }
      .md:h-[590px] {
        height: auto;
      }
      .h-[200px] {
        height: auto;
      }
    }
  `}</style>
      </Elements>

    </>
  );
}
function SubIcon() {
  return <svg
    className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
    viewBox="0 0 1155 678"
  >
    <path
      fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
      fillOpacity=".3"
      d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z" />
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
  </svg>;
}

