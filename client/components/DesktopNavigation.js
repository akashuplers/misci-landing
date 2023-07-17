import Link from "next/link";

const DesktopNavigation = ({
  navigation,
  userNavigation,
  setAuthenticationModalOpen,
  setAuthneticationModalType,
}) => {
  return (
    <div className=" mx-auto max-w-full 2xl:max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className=" h-[52.56px] justify-between items-center flex">
        <Link href="/">
          <img className="w-[104.90px] h-full" src="/lille_logo_new.png" />
        </Link>
        <div className="justify-center items-center gap-6 flex">
          {desktopNavigationRoutes.map((route) => (
            <div
              key={route.name}
              className="p-2 justify-center items-center gap-2.5 flex"
            >
              <Link href={route.href}>
                <div className="text-slate-600 text-[16px] font-normal">
                  {route.name}
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="justify-center items-center gap-6 flex">
          <button
            onClick={() => {
              setAuthenticationModalOpen(true);
              setAuthneticationModalType("login");
            }}
            className="p-2 justify-center items-center gap-2.5 flex"
          >
            <span className="text-slate-600 text-[16px] font-normal">
              Login
            </span>
          </button>
          <button
            onClick={() => {
              setAuthenticationModalOpen(true);
              setAuthneticationModalType("signup");
            }}
            className="px-5 py-2.5 bg-indigo-600 rounded-lg shadow justify-center items-center gap-2.5 flex"
          >
            <span className="text-white text-[16px] font-bold">
              Start your free trial today
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;
var desktopNavigationRoutes = [
  // {
  //   name: "Testimonial",
  //   href: "#testimonial",
  //   current: false,
  // },
  {
    name: "FAQs",
    href: "/faq",
    current: false,
  },
  {
    name: "About us",
    href: "/aboutus",
    current: false,
  },
  {
    name: "Pricing",
    href: "/pricing",
    current: false,
  },
];
