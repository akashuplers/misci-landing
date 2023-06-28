import { Popover } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import AuthenticationModal from "../components/AuthenticationModal.js";

const user = {};
const navigation = [{ name: "Pricing", href: "/pricing", current: false }];
const userNavigation = [];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({ isOpen }) {
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const [authenticationModalType, setAuthneticationModalType] = useState("");
  var Gbid;
  if (typeof window !== "undefined") {
    Gbid = localStorage.getItem("Gbid");
  }

  return (
    <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? "fixed inset-0 z-40 overflow-y-auto" : "",
            " w-full z-[9999]  lg:static lg:overflow-y-visible fixed top-0"
          )
        }
      >
        {({ open }) => (
          <>
            <AuthenticationModal
              type={authenticationModalType}
              setType={setAuthneticationModalType}
              modalIsOpen={authenticationModalOpen}
              setModalIsOpen={setAuthenticationModalOpen}
              handleSave={() => (window.location = "/")}
              bid={Gbid}
            />
            <div className=" mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
                <div className="md:inset-y-0 md:left-0 lg:static xl:col-span-2">
                  <div className="flex flex-shrink-0 items-center p-4">
                    <Link href="/">
                      <img
                        className="block h-12 w-auto"
                        src="/lille_logo_new.png"
                        alt="Lille"
                      />
                    </Link>
                  </div>
                </div>
                <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                  <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                    <div className="w-full">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button className="-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                  <Link
                    legacyBehavior
                    as={"/faq"}
                    href={{
                      pathname: "/faq",
                    }}
                  >
                    <p
                      className="ml-5 flex-shrink-0 rounded-full bg-white p-1  hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      style={{ cursor: "pointer" }}
                    >
                      FAQs
                    </p>
                  </Link>

                  <Link
                    legacyBehavior
                    as={"/pricing"}
                    href={{
                      pathname: "/pricing",
                    }}
                  >
                    <p
                      className="ml-5 flex-shrink-0 rounded-full bg-white p-1  hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      style={{ cursor: "pointer" }}
                    >
                      Pricing
                    </p>
                  </Link>

                  <button
                    onClick={() => {
                      setAuthenticationModalOpen(true);
                      setAuthneticationModalType("login");
                    }}
                    className="ml-5 flex-shrink-0 rounded-full bg-white p-1  hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthenticationModalOpen(true);
                      setAuthneticationModalType("signup");
                    }}
                    className="ml-6 cta-invert"
                  >
                    Sign up for Free
                  </button>
                </div>
              </div>
            </div>

            <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
              <div className="mx-auto max-w-3xl space-y-1 px-2 pt-2 pb-3 sm:px-4 bg-white">
                {navigation.map((item) => (
                  <>
                    <div className=" lg:flex lg:items-center lg:justify-end xl:col-span-4">
                      <button
                        onClick={() => {
                          setAuthenticationModalOpen(true);
                          setAuthneticationModalType("login");
                        }}
                        className="ml-5 flex-shrink-0 rounded-full bg-white p-1  hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setAuthenticationModalOpen(true);
                          setAuthneticationModalType("signup");
                        }}
                        className="ml-6 inline-flex items-center rounded-md bg-[#4A3AFE] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Sign up for Free
                      </button>
                    </div>
                  </>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3 hidden">
                <div className="mx-auto flex max-w-3xl items-center px-4 sm:px-6">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.imageUrl}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mx-auto mt-3 max-w-3xl space-y-1 px-2 sm:px-4">
                  {userNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </>
  );
}
