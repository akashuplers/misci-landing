import { Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const MobileNavigation = ({
  navigation,
  userNavigation,
  setAuthenticationModalOpen,
  setAuthneticationModalType,
}) => {
  return (
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
          <div className="w-full h-20  bg-white  border border-neutral-200 justify-around items-center  inline-flex">
            <img className="w-[79.83px] h-10" src="/lille_logo_new.png" />
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
              <Popover.Button
                className={`transition duration-150 ease-in-out rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {open ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </Popover.Button>
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
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default MobileNavigation;
