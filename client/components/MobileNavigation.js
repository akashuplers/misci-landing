import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChatBubbleBottomCenterIcon,
  InformationCircleIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useState } from "react";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const mobileNavigation = [
  // {
  //   name: "Testimonials",
  //   href: "/#testimonials",
  //   icon: ChatBubbleBottomCenterIcon,
  // },
  {
    name: "FAQ",
    href: "/faq",
    icon: QuestionMarkCircleIcon,
  },
  {
<<<<<<< HEAD
    name: "About Us",
    href: "/about",
=======
    name: "Value",
    href: "/aboutus",
>>>>>>> misc-cp-prod-adg
    icon: InformationCircleIcon,
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: TagIcon,
  },
];

const MobileNavigation = ({
  navigation,
  userNavigation,
  setAuthenticationModalOpen,
  setAuthneticationModalType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="w-full h-20  bg-white  border border-neutral-200 justify-between px-4 items-center  inline-flex">
        <Link href="/">
          <img className="w-[79.83px] h-10" src="/lille_logo_new.png" />
        </Link>

        <div className="self-stretch justify-start items-center gap-4 inline-flex">
          <button
            className="px-5 py-2.5 bg-indigo-600 rounded-lg shadow justify-center items-center gap-2.5 flex"
            onClick={() => {
              setAuthneticationModalType("login");
              setAuthenticationModalOpen(true);
            }}
          >
            <div className="text-white text-[16px] font-bold">
              Sign up for Free
            </div>
          </button>
          <button
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`transition duration-150 ease-in-out rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 mt-[70px] lg:mt-0 lg:hidden"
          onClose={() => setIsOpen(!isOpen) /*setSidebarOpen(false)*/}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex flex-row-reverse lg:flex">
            <Transition.Child
              show={isOpen}
              style={{ width: "65%" }}
              enter="transition-transform duration-300 ease"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform duration-300 ease"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              {/* top and bottom left rouned */}
              {/* <div className="w-80 bg-white "> */}
              <Dialog.Panel className="relative mt-20 flex w-full h-[91vh] flex-1 flex-col bg-white rounded-l-lg ">
                <div className="h-0  flex-1 overflow-y-auto pt-5 pb-4">
                  <nav className=" space-y-1 px-2">

                    {mobileNavigation &&
                      mobileNavigation.length > 0 &&
                      mobileNavigation.map((item, index) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            "text-[#415A77] hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center relative rounded-md px-4 py-2 text-base font-medium  "
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-[#415A77]"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                          {/* absolute vertical line bottom marginx2 */}
                          <div className="absolute bottom-0 left-0 w-[98%] h-[2px] bg-gray-200"></div>
                        </Link>
                      ))}
                  </nav>
                </div>
                <div className="flex flex-shrink-0 pb-0 pt-4">
                  <Link
                    href="/upgrade"
                    className="ml-6 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    style={{
                      margin: "0em 0.5em",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "var(--primary-blue)",
                    }}
                  >
                    UPGRADE
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
                <nav className="mt-5 space-y-1 bg-white px-2 pb-8"></nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default MobileNavigation;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Sidebar toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-10 inset-0 bg-black bg-opacity-50 transition-opacity"
      ></button>

      {/* Sidebar content */}

      {/* Main content */}
      <div className="ml-0 lg:ml-60 transition-all">
        {/* Main content goes here */}
      </div>
    </div>
  );
};
