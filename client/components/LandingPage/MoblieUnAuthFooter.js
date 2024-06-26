import Link from "next/link";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";
import { FloatingBalls } from "../ui/Chip";
export const socialLinks = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/Nowigence/",
    icon: <FacebookIcon className="h-5 w-5 mr-3 rounded-full" />
  },
  {
    name: "Twitter",
    link: "https://twitter.com/Lille_AI",
    icon: <svg 
      style={{pointerEvents: 'none'}} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 30 30"
      width="20px"
      height="20px"
      className="h-5 w-5 mr-3 rounded-full"
    >
      <path d="M 6 4 C 4.895 4 4 4.895 4 6 L 4 24 C 4 25.105 4.895 26 6 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 6 4 z M 8.6484375 9 L 13.259766 9 L 15.951172 12.847656 L 19.28125 9 L 20.732422 9 L 16.603516 13.78125 L 21.654297 21 L 17.042969 21 L 14.056641 16.730469 L 10.369141 21 L 8.8945312 21 L 13.400391 15.794922 L 8.6484375 9 z M 10.878906 10.183594 L 17.632812 19.810547 L 19.421875 19.810547 L 12.666016 10.183594 L 10.878906 10.183594 z"/>
    </svg>
  },

  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/company/lille-ai/",
    icon: <LinkedinIcon className="h-5 w-5 mr-3 rounded-full" />
  }
];

const MoblieUnAuthFooter = () => {
  return (
    <footer
      className="text-center text-black lg:text-left relative bg-transparent mt-[-10px]"
    >
      <div className="px-6 py-10 relative text-center md:text-left" style={{
        background: 'linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%,  #FFEBE9 100%)'
      }}>
        <div className="flex flex-col justify-center items-start lg:flex-row px-[5%]">
          <div className="w-full"
          style={{
            minWidth: "40%"
          }}
          >
            <h6 className="mb-4 flex items-center lg:items-start  justify-start lg:justify-start font-semibold">
              <img src="/lille_logo_new.png" className="h-12" alt="" />
            </h6>
            {/* <p className="text-left lg:text max-w-xs">
              Boost your engagement, increase your followers, and drive more
              traffic to your website with optimized social media posts.
            </p> */}
          </div>
          <div className="w-full flex flex-col items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">Company</h6>
            {/* <p className="mb-4">
              <Link href="/#whyChooseUs" className="text-white-600 hover:opacity-90">
                Why Choose us
              </Link>
            </p> */}
            {/* <p className="mb-4">
              <Link href="/#testimonial" className="text-white-600 hover:opacity-90 ">
                Testimonial
              </Link>
            </p> */}
            <p className="mb-4">
              <Link href="/pricing" target="_blank" className="text-white-600 hover:opacity-90 ">
                Pricing
              </Link>
            </p>
            <p>
              <Link href="/faq" target="_blank" className="text-white-600 hover:opacity-90 ">
                FAQs
              </Link>
            </p>
          </div>
          <div className="w-full flex flex-col  items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">
              Resources
            </h6>
            <p className="mb-4">
              <Link target="_blank"
                href="/Lille_Guide_Latest.pdf"
                className="text-white-600 hover:opacity-90  justify-start ss"
              >
                User Guide
              </Link>
            </p>
            <p className="mb-4">
              <Link target="_blank"
                href="https://nowigence.com/privacy-policy"
                className="text-white-600 hover:opacity-90  justify-start ss"
              >
                Privacy & Policy
              </Link>
            </p>
            <p className="mb-4">
              <Link target="_blank" href="https://nowigence.com/privacy-policy/" className="text-white-600 hover:opacity-90 ">
                Terms & Conditions
              </Link>
            </p>
            <p className="mb-4">
              <a target="_blank" href="https://blogs.lille.ai" className="text-white-600 hover:opacity-90 ">
                Blogs
              </a>
            </p>
          </div>
          <div className="w-full flex flex-col items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">Contact</h6>

            <p className="mb-4 flex items-center justify-center md:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-3 h-5 w-5"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
              sales@lille.ai
            </p>
            <h6 className="mb-4 flex justify-center font-semibold  md:justify-start">
              Follow us on
            </h6>
            <div className="flex justify-center md:justify-start">
              {socialLinks.map((socialLink, index) => (
                <Link
                  target="_blank"
                  href={socialLink.link}
                  key={index}
                  className="text-white-600 hover:opacity-90 "
                >
                  {socialLink.icon}
                </Link>
              ))}

            </div>
          </div>
        </div>

      <FloatingBalls className="hidden absolute bottom-[4%] rotate-45 md:block" />
      <FloatingBalls className="hidden absolute top-[4%] left-[4%] rotate-45 md:block h-6" />
      </div>

      <div className="bg-indigo-600 text-blue-950 text-sm bg-opacity-10 p-6 text-center">
        <span>© Nowigence, Inc:</span>
        <a
          className="font-normal "
          href="https://lille.ai/"
        >
          - All Rights Reserved 2023
        </a>
      </div>

    </footer>
  );
};

export default MoblieUnAuthFooter;
