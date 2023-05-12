import React from "react";
import Image from "next/image";
import { FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white  py-2 px-20 bottom-0 w-full">
      <div className="flex items-center justify-between align-middle">
        <div>
          <Image
            src="/lille_logo_light.png"
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
        © 2023 Nowigence Inc.
      </div>
    </footer>
  );
};

export default Footer;
