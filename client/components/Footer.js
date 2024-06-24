import Image from "next/image";
import { FaLinkedin, FaTwitter } from "react-icons/fa/index";

const Footer = () => {
  return (
    <footer className="sm:block hidden bg-gray-800 text-white py-2 px-4 sm:px-20 w-full bottom-0">
      <div className="flex flex-col sm:flex-row items-center justify-between align-middle">
        <div className="mb-4 sm:mb-0">
          <Image
            src="/lille_logo_new.png"
            style={{ filter: "drop-shadow(2px 4px 6px black" }}
            width={100}
            height={100}
            alt="Lille AI logo"
          />
        </div>
        <div className="space-x-4 flex flex-row">
          <a
            href="https://twitter.com/Lille_AI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://www.linkedin.com/company/lille-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
      <div className="mt-4 text-center text-gray-400">
        © Nowigence, Inc. - All Rights Reserved 2023
      </div>
    </footer>
  );
};

export default Footer;