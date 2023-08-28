import { useState } from "react";
import AuthenticationModal from "../components/AuthenticationModal.js";
import DesktopNavigation from "../components/DesktopNavigation";
import MobileNavigation from "../components/MobileNavigation";
const user = {};
const navigation = [{ name: "Pricing", href: "/pricing", current: false }];
const userNavigation = [];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({ blogId, isOpen }) {
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const [authenticationModalType, setAuthneticationModalType] = useState("");
  var Gbid;
  if (typeof window !== "undefined") {
    Gbid = localStorage.getItem("Gbid");
  }

  return (
    <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <>
        <AuthenticationModal
          type={authenticationModalType}
          setType={setAuthneticationModalType}
          modalIsOpen={authenticationModalOpen}
          setModalIsOpen={setAuthenticationModalOpen}
          handleSave={() => (window.location = "/")}
          bid={blogId ? blogId : Gbid}
        />
        <div className="lg:hidden sticky top-0 z-50 bg-white backdrop-filter backdrop-blur-lg bg-opacity-30">
          <MobileNavigation
            navigation={navigation}
            userNavigation={userNavigation}
            setAuthenticationModalOpen={setAuthenticationModalOpen}
            setAuthneticationModalType={setAuthneticationModalType}
          />
        </div>
        <div className="hidden lg:block sticky top-0 z-50 py-2 bg-white backdrop-filter backdrop-blur-lg bg-opacity-30">
          <DesktopNavigation
            navigation={navigation}
            userNavigation={userNavigation}
            setAuthenticationModalOpen={setAuthenticationModalOpen}
            setAuthneticationModalType={setAuthneticationModalType}
          />
        </div>
      </>
    </>
  );
}
