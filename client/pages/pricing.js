import Footer from "@/components/Footer";
import { Tab } from '@headlessui/react';
import { CheckIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import AuthenticationModal from "../components/AuthenticationModal";
import Navbar from "../components/Navbar";
import { API_BASE_PATH } from "../constants/apiEndpoints";
import styles from "../styles/price.module.css";
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

const MonthlyPlans = [
  {
    name: 'Personal',
    description: 'Perfect for side or hobby project',
    price: '$10',
    duration: '/ Month',
    features: ['Upto 5 users', 'Collaboration features'],
  },
  {
    name: 'Startup',
    description: 'Perfect for small teams',
    price: '$50',
    duration: '/ Month',
    features: [
      'Upto 5 users',
      'Collaboration features',
      'Smart analytics',
      '30-days free trial',
    ],
  },
  {
    name: 'Organization',
    description: 'Perfect for organization',
    price: '$70',
    duration: '/ Month',
    features: [
      'Upto 5 users',
      'Collaboration features',
      'Smart analytics',
      '30-days free trial',
      'Contact Sales',
    ],
  },
];
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
      }).then((res) => res.data);

      setPriceData(pricesRes.data.data);
      console.log(pricesRes.data.data);
    };
  }, []);

  useEffect(() => {
    console.log(priceData);
  }, [priceData]);

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState();
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
      }).then((res) => res.data);

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

      const sortedPlans = updatedPricesArray.sort((a, b) => {
        const order = ["Monthly", "Quarterly", "Yearly"];
        return order.indexOf(a.subscriptionType) - order.indexOf(b.subscriptionType);
      });

      console.log(sortedPlans);
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

  const [type, setType] = useState("signup");
  const [isMonthly, setIsMonthly] = useState(true);

  let [categories] = useState({
    Monthly: [
      {
        id: 1,
        title: 'Does drinking coffee make you smarter?',
        date: '5h ago',
        commentCount: 5,
        shareCount: 2,
      },
      {
        id: 2,
        title: "So you've bought coffee... now what?",
        date: '2h ago',
        commentCount: 3,
        shareCount: 2,
      },
    ],
    Yearly: [
      {
        id: 1,
        title: 'Is tech making coffee better or worse?',
        date: 'Jan 7',
        commentCount: 29,
        shareCount: 16,
      },
      {
        id: 2,
        title: 'The most innovative things happening in coffee',
        date: 'Mar 19',
        commentCount: 24,
        shareCount: 12,
      },
    ],
  })
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <>
      <div className="relative md:min-h-screen md:hidden">

        <div>
          <div>
            {/* back button */}

            <div className="w-full max-w-md px-2 py-16 sm:px-0">
              {/* back button */}

              <Tab.Group >

                <Tab.List className="flex items-center justify-center">

                  <div className="flex items-center justify-start">
                    <Link href="/">
                      <span className="inline-flex items-center text-sm font-medium text-gray-900">
                        <ChevronLeftIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                      </span>
                    </Link>
                  </div>
                  <div className="flex rounded-full shadow-md px-4 py-1 items-center">
                    {Object.keys(categories).map((category) => (
                      <Tab
                        key={category}
                        className={({ selected }) =>
                          classNames(
                            'inline-flex items-center justify-center px-2.5 py-1.5 rounded-full text-xs font-medium leading-4',
                            'ring-white ring-opacity-60 ring-offset-2 ring-purple-blue-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-purple-500 text-white shadow'
                              : 'text-gray-500 hover:bg-white/[0.12] hover:text-white'
                          )
                        }
                      >
                        {category}
                      </Tab>
                    ))}
                  </div>
                </Tab.List>
                <Tab.Panels className="mt-2">
                  {Object.values(categories).map((posts, idx) => (
                    <Tab.Panel
                      key={idx}
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <PricingCards />
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>


          </div>
          <div>

          </div>
        </div>
      </div>
      <div className="relative md:min-h-screen hidden md:block">
        <AuthenticationModal
          type={type}
          setType={setType}
          modalIsOpen={isOpen}
          setModalIsOpen={setIsOpen}
          handleSave={() => (window.location = "/")}
          bid={""}
        />
        <Navbar isOpen={isOpen} />
        <div className="flex flex-col md:min-h-screen">
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
            {/* cards div */}
            <div className="absolute max-sm:top-[20%] sm:top-[15%] lg:top-[5%] sm:left-[0%] sm:right-[8%] w-full">
              <div
                className={
                  styles.pricingContainer + " p-5 pb-10 pt-0 px-10 lg:pl-2"
                }
              >
                <h2>Pricing</h2>
                <p className="">
                  Our affordable pricing scales with your business. We don’t
                  lock our features behind expensive plans. You get all the
                  features on every plan.
                </p>
              </div>
              <div className="flex max-sm:flex-col w-full max-sm:space-y-8 sm:space-x-4 justify-center align-middle items-center">
                <div
                  style={{
                    boxShadow: "0px 20px 60px rgba(9, 37, 89, 0.16)",
                  }}
                  className="flex sm:flex-wrap sm:flex-row relative max-sm:flex-col bg-[#ffffff] rounded-[0.75rem] p-4 w-[21rem] md:w-[392px] h-[600px]"
                >
                  <div className="flex flex-col items-start justify-start gap-4 mt-4">
                    <p className="text-[#182735] font-semibold text-[24px] leading-[26px]">
                      Free
                    </p>
                    <p className="text-[44px] text-[#182735] leading-[112%] text-left font-bold">
                      Full Features Access with 25 Credits
                    </p>
                    <p className=" text-[#182735] text-left leading-[26px] text-[18px] font-medium mb-4">
                      Create and Regenerate blogs with free publishing on
                      Lille.ai platform, LinkedIn and Twitter.
                    </p>
                  </div>
                  <div className="mt-4 mb-4 bg-gradient-to-r from-[#182735] to-transparent h-[2px]"></div>
                  <div className="flex flex-col items-start justify-start mt-4">
                    <div className="flex align-middle"></div>
                  </div>
                  <div
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="bg-[#3CC0F6] bottom-6 inline-block right-[1rem] cursor-pointer absolute font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4"
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
                  className="flex relative flex-col  rounded-[0.75rem] text-[#ffffff] p-4 w-[21rem] md:w-[392px] h-[600px]"
                >
                  <div className="flex flex-col  items-start justify-start mt-4">
                    <p className=" font-semibold text-[24px] pb-2 capitalize">
                      Paid
                    </p>
                    <p className="text-[64px]  font-bold">
                      ${currentPlan?.price}
                      {/* <span className="text-[16px] leading-[26px] tracking-[0.5px] text-[#ffffff]">
                  /month
                </span> */}
                    </p>
                  </div>
                  <div className=" mt-4 mb-4 bg-gradient-to-r from-[#3cc0f6] to-transparent h-[2px]"></div>
                  <div className="flex bg-[#fffff] items-center rounded-[59px] h-[55px] w-full justify-between px-2">
                    {plans.length > 0 &&
                      plans.map((item, i) => {
                        return (
                          <div
                            key={i}
                            onClick={() => subscriptionPlan(item)}
                            className={`cursor-pointer rounded-[55px] px-[7.5px] md:px-[19px] py-[8px] ${currentPlan?.subscriptionType ===
                              item.subscriptionType
                              ? "bg-[#3cc0f6] text-[#ffffff]"
                              : "bg-[#ffffff] text-[#000000]"
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
                        Unlimited Blogs and Linked Posts.
                        90 tweets a month for free plan
                        180 tweets a month for paid plan
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
                        Create/Regenerate blogs with your topics
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
                  <Link
                    legacyBehavior
                    as={"/subscription"}
                    href={{
                      pathname: "/subscription",
                      query: { currentPlan: JSON.stringify(currentPlan) },
                    }}
                  >
                    <div className="bg-[#3CC0F6] bottom-6 inline-block right-[1rem] cursor-pointer absolute font-semibold text-[16px] no-underline text-[#0E0E2C] rounded-[10px] p-4">
                      Get Started
                    </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="bg-blue-500 p-4 fixed bottom-1 left-1 z-50 mx-0 rounded-md shadow-md text-white max-w-lg  mt-10 text-center">
          For enterprise usage inquiries please contact us at <a href="mailto:sales@lille.ai" className="underline">sales@lille.ai</a>
        </div>
        <div className="">
          <Footer />
        </div>
      </div>
    </>
  );
}



function PricingCard({ plan }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full w-full">
      <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
      <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
      <div className="flex items-center mb-6">
        <span className="text-5xl font-semibold">{plan.price}</span>
        <span className="text-gray-500 text-sm ml-2">{plan.duration}</span>
      </div>
      <ul className="space-y-2">
        {
          plan.features.map((feature, i) => (
            <li key={feature} className="flex items-center">
              <CheckIcon className="h-4 w-4 text-purple-500" />
              <span className="ml-2">{feature}</span>
            </li>
          ))
        }


      </ul>
      <div className="w-full flex justify-center mt-6">
        <button className="mt-6 border-2 w-full border-purple-500 text-purple-500 rounded-lg py-2 px-4 hover:bg-purple-500 hover:text-white transition-colors duration-300">
          Upgrade
        </button>
      </div>
    </div>
  );
}

function PricingCards() {
  return (
    <div className="flex flex-wrap w-full gap-3 mt-5">
      {MonthlyPlans.map((plan) => (
        <PricingCard key={plan.name} plan={plan} />
      ))}
    </div>
  );
}