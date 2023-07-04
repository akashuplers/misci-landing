import Link from "next/link";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";
const socialLinks = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/",
    icon: <FacebookIcon className="h-5 w-5 mr-3 rounded-full" />
  },
  {
    name: "Twitter",
    link: "https://twitter.com/Lille_AI",
    icon: <TwitterIcon className="h-5 w-5 mr-3 rounded-full" />
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
      className="text-center text-white lg:text-left mt-16"
      style={{
        backgroundColor: "darkblue",
        backgroundImage:
          "url('/footerbg.png')",
      }}
    >
      <div className="mx-6 py-10 text-center md:text-left">
        <div className="flex flex-col justify-start items-start lg:flex-row ">
          <div className="w-full">
            <h6 className="mb-4 flex items-center lg:items-start  justify-start lg:justify-start font-semibold sss">
              <img src="/lille_logo_light.png" className="h-6" alt="" />
            </h6>
            <p className="text-left lg:text">
              Boost your engagement, increase your followers, and drive more
              traffic to your website with optimized social media posts.
            </p>
          </div>
          <div className="w-full flex flex-col items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">Company</h6>
            <p className="mb-4">
              <Link href="/#whyChooseUs" className="text-white-600 hover:opacity-90">
                Why Choose us
              </Link>
            </p>
            <p className="mb-4">
              <Link href="/#testimonial" className="text-white-600 hover:opacity-90 ">
                Testimonial
              </Link>
            </p>
            <p className="mb-4">
              <Link href="/pricing" className="text-white-600 hover:opacity-90 ">
                Pricing
              </Link>
            </p>
            <p>
              <a href="#!" className="text-white-600 hover:opacity-90 ">
                FAQs
              </a>
            </p>
          </div>
          <div className="w-full flex flex-col  items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">
              Resources
            </h6>
            <p className="mb-4">
              <Link
                href="/faq"
                className="text-white-600 hover:opacity-90  justify-start ss"
              >
                Privacy & Policy
              </Link>
            </p>
            <p className="mb-4">
              <Link href="/faq" className="text-white-600 hover:opacity-90 ">
                Terms & Conditions
              </Link>
            </p>
            <p className="mb-4">
              <a href="#!" className="text-white-600 hover:opacity-90 ">
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
              sales@lille.com
            </p>
            <h6 className="mb-4 flex justify-center font-semibold  md:justify-start">
              Follow us on
            </h6>
            <div className="flex justify-center md:justify-start">
              {socialLinks.map((socialLink, index) => (
                <Link
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
      </div>

      <div className="bg-blue-200 p-6 text-center dark:bg-blue-700">
        <span>© Nowigence, Inc:</span>
        <a
          className="font-normal text-white dark:text-white"
          href="https://lille.ai/"
        >
          - All Rights Reserved 2023
        </a>
      </div>
    </footer>
  );
};

export default MoblieUnAuthFooter;
