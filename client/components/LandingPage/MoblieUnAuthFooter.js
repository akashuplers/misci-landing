import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";

const MoblieUnAuthFooter = () => {
  return (
    <footer
      className="text-center text-white lg:text-left mt-16"
      style={{
        backgroundColor: "darkblue",
        backgroundImage:
          "url('/footerbg.png'),lightgray 50% / cover no-repeat;",
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
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
                Why Choose us
              </a>
            </p>
            <p className="mb-4">
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
                Testimonial
              </a>
            </p>
            <p className="mb-4">
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
                Pricing
              </a>
            </p>
            <p>
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
                FAQs
              </a>
            </p>
          </div>
          <div className="w-full flex flex-col  items-start">
            <h6 className="mb-4 flex justify-start font-semibold  ">
              Resources
            </h6>
            <p className="mb-4">
              <a
                href="#!"
                className="text-neutral-600 dark:text-neutral-200 justify-start ss"
              >
                Privacy & Policy
              </a>
            </p>
            <p className="mb-4">
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
                Terms & Conditions
              </a>
            </p>
            <p className="mb-4">
              <a href="#!" className="text-neutral-600 dark:text-neutral-200">
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
              info@example.com
            </p>
            <h6 className="mb-4 flex justify-center font-semibold  md:justify-start">
              Follow us on
            </h6>
            <div className="flex justify-center md:justify-start">
              <FacebookIcon className="h-5 w-5 mr-3 rounded-full" />
              <TwitterIcon className="h-5 w-5 mr-3 rounded-full" />
              {/* iinstagra svg */}
              <svg
                className="h-5 w-5 mr-3 rounded-full"
                viewBox="0 0 512 512"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm128 384c0 70.692-57.308 128-128 128s-128-57.308-128-128c0-70.692 57.308-128 128-128s128 57.308 128 128zm0 0" />
                <path d="M256 128c-70.692 0-128 57.308-128 128s57.308 128 128 128 128-57.308 128-128-57.308-128-128-128zm0 224c-47.055 0-85.332-38.277-85.332-85.332S208.945 181.332 256 181.332 341.332 219.61 341.332 266.664 303.055 352 256 352zm0 0" />
                <circle cx="393.6" cy="118.4" r="17.067" />
              </svg>
              <LinkedinIcon className="h-5 w-5 mr-3 rounded-full" />
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
