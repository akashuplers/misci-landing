const logos = ["/Logo1", "/Logo2", "/Logo3", "/Logo4", "/Logo5"];
const imagesForScreenShots = {
  home: "/screenshots/home.png",
  publish: "/screenshots/publish.png",
  regenerate: "/screenshots/regenerate.png",
  creditsfilters: "/screenshots/creditsfilters.png",
  filterresults: "/screenshots/filterresults.png",
  credits: "/screenshots/credits.png",
  filter: "/screenshots/filter.png",
  filterdemo: "/screenshots/filterdemo.png",
  filterresponse: "/screenshots/filterresponse.png",
  generateblogresponse: "/screenshots/generateblogresponse.png",
  generateresponse: "/screenshots/generateresponse.png",
  publish: "/screenshots/publish.png",
  publishbutton: "/screenshots/publishbutton.png",
  publishLinkedinbutton: "/screenshots/publishLinkedinbutton.png",
  regenerate: "/screenshots/regenerate.png",
  regeneratebutton: "/screenshots/regeneratebutton.png",
  customer: "/customer.png",
};

const LandingPage = () => {
  return (
    <>
      <div className="w-full h-[195px]  flex-col justify-start items-center gap-4 inline-flex">
        <div className="h-[81px] flex-col justify-start items-center gap-2 flex">
          <div className="w-full self-stretch text-center text-slate-800 text-[48px] font-bold leading-10">
            Our Clients
          </div>
          <div className="w-full self-stretch text-center">
            <span className="text-slate-600 text-[16px] font-normal">
              Helping these rocketship companies grow{" "}
            </span>
            <span className="text-indigo-600 text-[20px] font-medium">10x</span>
            <span className="text-slate-600 text-[16px] font-normal">
              faster
            </span>
          </div>
        </div>
        <div className="w-full h-[98px] justify-between items-center gap-8 inline-flex">
          {logos.map((logo) => (
            <div className="w-[150px] h-[98px] flex justify-center items-center">
              <img src={logo + ".svg"} alt="logo" />
            </div>
          ))}
        </div>
      </div>
      {/* ABOUT US */}
      <SectionSpacer />
      <div className="relative bg-gradient-to-b from-violet-50 to-violet-50 py-20 lg:min-h-screen">
        <div className="flex mx-auto max-w-5xl items-center justify-center">
          <div className="w-[50%]">
            <div className="w-full justify-start items-center">
              {/* <div className="w-[50%] h-0.5 bg-indigo-600" /> */}
              <div className="h-14 text-slate-800 text-[48px] font-bold leading-10">
                About us
              </div>
            </div>
            <div className="opacity-70 text-slate-600 text-[16px] font-normal leading-7">
              {`We understand that consistently coming up with new ideas can be
              challenging, especially for busy individuals or businesses
              juggling multiple responsibilities. That's where we come in - let
              us take care of the creative process while you focus on other
              aspects of your work.`}
            </div>
            <div className="pl-[30px] pr-6 py-[17px] left-[15px] top-[259px]  rounded-lg shadow border  border-indigo-600 justify-center items-center gap-2.5 inline-flex">
              <div className="text-indigo-600 text-[18px] font-medium">
                Start for free
              </div>
            </div>
          </div>
          <div className="flex justify-center  items-center gap-[100px]">
            <div className="flex-col justify-start items-center inline-flex">
              <div className="text-slate-600 text-[18px] font-normal uppercase leading-loose tracking-wider">
                Partners
              </div>
              <div className="text-slate-800 text-[48px] font-extrabold leading-10">
                1000
              </div>
            </div>
            <div className="flex-col justify-start items-center inline-flex">
              <div className="text-slate-600 text-[18px] font-normal uppercase leading-loose tracking-wider">
                clients
              </div>
              <div className="text-slate-800 text-[48px] font-extrabold leading-10">
                150k
              </div>
            </div>
          </div>
        </div>
        {/* randm div with height 40% of parrent */}
        {/* why chose us */}
      </div>
      <SectionSpacer />
      <div
        className="w-full h-[700px] p-20 relative  rounded-2xl shadow justify-center items-center flex flex-col"
        style={{
          backgroundImage: "linear-gradient(138deg, #4A3AFE 0%, #6883FF 100%)",
        }}
      >
        <div className="h-[136px] flex-col justify-center items-center gap-6 inline-flex">
          <div className="self-stretch h-14 text-center text-white text-[48px] font-bold leading-10 tracking-wide">
            Why Choose Us
          </div>
          <div className="w-[803.89px] opacity-80 text-center text-white text-[16px] font-normal leading-7 tracking-wide">
            Lille is a unique platform dedicated to enriching your online
            experience by providing an engaging combination of informative
            content and interactive discussions.
          </div>
        </div>
        <div className="border py-[64.05px] bg-white mt-10 rounded-2xl shadow justify-center items-center inline-flex">
          <div className="self-stretch justify-around  items-center gap-[38px] inline-flex">
            <div className="w-[30%] flex-col justify-start items-center gap-5 inline-flex">
              <div className="self-stretch h-[156px] flex-col justify-start items-center gap-3 flex">
                <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                  SEO optimization
                </div>
                <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                  {`We have implemented search engine optimization, such as
                    using meta tags, alt tags for images, and ensuring the
                    website's loading speed is fast`}
                </div>
              </div>
            </div>
            <div className="w-[30%] flex-col justify-start items-center gap-5 inline-flex">
              <div className="self-stretch h-[156px] flex-col justify-start items-center gap-3 flex">
                <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                  Social media integration
                </div>
                <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                  We have included social media share buttons to encourage users
                  to easily share your blog posts on their preferred social
                  platforms.
                </div>
              </div>
            </div>
            <div className="w-[30%] flex-col justify-start items-center gap-5 inline-flex">
              <div className="self-stretch h-[156px] flex-col justify-start items-center gap-3 flex">
                <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                  Customization options
                </div>
                <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                  We have provided users with the ability to customize their
                  experience on the website, such as choosing their preferred
                  font size, color theme, etc.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[331.87px] h-[477.56px] origin-top-left rotate-[-53.85deg] opacity-60 bg-purple-500 rounded-full blur-[145px]" />
        <div className="w-[266.57px] h-[383.59px] origin-top-left rotate-[-53.85deg] opacity-60 bg-purple-500 rounded-full blur-[145px]" />
      </div>
      {/* how lille works */}
      <SectionSpacer />
      <div className="w-full h-[2465.15px] px-[130px] flex-col justify-start items-center gap-[60px] inline-flex">
        <div className="self-stretch h-[95px] flex-col justify-start items-center gap-6 flex">
          <div>
            <span className="text-slate-800 text-[48px] font-bold leading-10">
              How{" "}
            </span>
            <span className="text-indigo-600 text-[48px] font-bold leading-10">
              Lille
            </span>
            <span className="text-slate-800 text-[48px] font-bold leading-10">
              {" "}
              works
            </span>
          </div>
          <div className="opacity-70 text-center text-slate-600 text-[16px] font-normal leading-7">
            One-stop destination for empowering ideas, inspiring stories, and
            thought-provoking perspectives!
          </div>
        </div>
        <div className="flex-col justify-start items-start gap-10 flex">
          <div className="justify-start items-center gap-[117px] inline-flex">
            <div className="w-[484px] h-[430.03px] relative">
              <div className="Designcircle" />
              <div className="w-[424px] h-56 left-[60px] top-[103.01px] absolute flex-col justify-start items-start gap-5 inline-flex">
                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                  <div className="text-white text-[24px] font-bold">1</div>
                </div>
                <div className="flex-col justify-start items-start gap-3 flex">
                  <div className="text-slate-800 text-[32px] font-medium leading-10">
                    Search Anything
                  </div>
                  <div className="w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                    Simply type in any keyword or topic of interest into the
                    search input field and our website will present you with a
                    comprehensive list of articles, guides, and case studies
                    that match your search query.
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[578px] h-[430px] bg-white justify-center items-center flex">
              <div className="grow shrink basis-0 self-stretch px-5 py-[1px] bg-white rounded-2xl border border border border border-gray-200 justify-center items-center inline-flex">
                <div className="grow shrink basis-0 self-stretch px-[2.16px] py-[62.05px] bg-white rounded-lg justify-center items-center inline-flex">
                  <img
                    className="w-[533.69px] h-[303.90px] rounded-lg shadow"
                    src={imagesForScreenShots["home"]}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-[1179.31px] justify-start items-center gap-[117px] inline-flex">
            <div className="w-[578px] h-[430px] px-5 py-[1px] bg-white rounded-2xl border border border border border-gray-200 justify-center items-center flex">
              <div className="w-[538px] h-[428px] relative bg-white rounded-lg flex-col justify-start items-start flex">
                <img
                  className="w-[375.17px] h-[215.34px] rounded-lg"
                  src={imagesForScreenShots["credits"]}
                />
                <div className="w-[470px] h-[202px] px-[25.55px] py-[37.25px] bg-white rounded-lg shadow justify-center items-center inline-flex">
                  <img
                    className="w-[418.90px] h-[127.50px] rounded-lg"
                    src={imagesForScreenShots["filter"]}
                  />
                </div>
              </div>
            </div>
            <div className="w-[484px] h-[430.03px] relative">
              {/* <div className="w-[430.03px] h-[430.03px] left-[430.03px] top-0 absolute origin-top-left rotate-180 origin-top-left bg-gradient-to-r from-fuchsia-100 to-purple-100 rounded-full" /> */}
              <div className="Designcircle" />
              <div className="w-[424px] h-56 left-[60px] top-[103.01px] absolute flex-col justify-start items-start gap-5 inline-flex">
                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                  <div className="text-white text-[24px] font-bold">2</div>
                </div>
                <div className="flex-col justify-start items-start gap-3 flex">
                  <div className="text-slate-800 text-[32px] font-medium leading-10">
                    Get Fresh Ideas
                  </div>
                  <div className="w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                    Lille offers you a cool feature in which you can enter some
                    keywords relevant to your niche in the new input field and
                    we'll suggest some new ideas that you can use to take your
                    content to the next level.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-[117px] inline-flex">
            <div className="w-[484px] h-[430.03px] relative">
              <div className="Designcircle" />
              <div className="w-[424px] h-[197px] left-[60px] top-[116.51px] absolute flex-col justify-start items-start gap-5 inline-flex">
                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                  <div className="text-white text-[24px] font-bold">3</div>
                </div>
                <div className="flex-col justify-start items-start gap-3 flex">
                  <div className="text-slate-800 text-[32px] font-medium leading-10">
                    Select fresh ideas
                  </div>
                  <div className="w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                    Once you've found some exciting new ideas, it's time to
                    start incorporating them into your blog. Choose the ones
                    that resonate with your, and then move on to the next step!
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[578px] h-[430px] px-5 py-[1px] bg-white rounded-2xl border border border border border-gray-200 justify-center items-center flex">
              <div className="w-[538px] h-[428px] relative bg-white rounded-lg flex-col justify-start items-start flex">
                <img
                  className="w-[298.42px] h-[273.69px]"
                  src={imagesForScreenShots["filter"]}
                />
                <div className="w-[470px] pl-[21.96px] pr-[22.03px] pt-[15.40px] pb-[11.74px] bg-white rounded-lg shadow justify-center items-center inline-flex">
                  <img
                    className="w-[426.01px] h-[270.86px]"
                    src={imagesForScreenShots["filterresults"]}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-[117px] inline-flex">
            <div className="w-[578px] h-[430px] px-[21px] py-[1px] bg-white rounded-2xl border border border border border-gray-200 justify-center items-center flex">
              <div className="w-[536px] h-[428px] relative bg-white rounded-lg flex-col justify-start items-start flex">
                <img
                  className="w-[374.43px] h-[354.70px]"
                  src={imagesForScreenShots["filterresults"]}
                />
                <div className="pl-[21.55px] pr-[18.41px] pt-[13.67px] pb-[11.40px] bg-white rounded-lg shadow justify-center items-center inline-flex">
                  <img
                    className="w-[157.63px] h-[50.93px] shadow"
                    src={imagesForScreenShots["regeneratebutton"]}
                  />
                </div>
              </div>
            </div>
            <div className="w-[484px] h-[430.03px] relative">
              {/* <div className="w-[430.03px] h-[430.03px] left-[430.03px] top-0 absolute  rotate-180 origin-top-left bg-gradient-to-r from-fuchsia-100 to-purple-100 rounded-full" /> */}
              <div className="Designcircle" />
              <div className="w-[424px] h-[251px] left-[60px] top-[89.51px] absolute flex-col justify-start items-start gap-5 inline-flex">
                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                  <div className="text-white text-[24px] font-bold">4</div>
                </div>
                <div className="flex-col justify-start items-start gap-3 flex">
                  <div className="text-slate-800 text-[32px] font-medium leading-10">
                    Click on Regenerate
                  </div>
                  <div className="w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                    {`After you've selected the ideas you want to focus on, it's
                    time to let our website work its magic. Just click on the
                    regenerate button, and our powerful algorithm will generate
                    a whole new blog post based on the ideas you've selected.
                    It's that easy!`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-[117px] inline-flex">
            <div className="w-[484px] h-[430.03px] relative">
              <div className="Designcircle"></div>
              <div className="w-[424px] h-[251px] left-[60px] top-[89.51px] absolute flex-col justify-start items-start gap-5 inline-flex">
                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                  <div className="text-white text-[24px] font-bold">5</div>
                </div>
                <div className="flex-col justify-start items-start gap-3 flex">
                  <div className="text-slate-800 text-[32px] font-medium leading-10">
                    Publish
                  </div>
                  <div className="w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                    {`Click on Publish And last but not least, it's time to new
                    post with the world. Simply click on the publish button, and
                    your post will be available to read on your website. And why
                    stop there? You also have the option to share your post on
                    LinkedIn and Twitter to reach an even wider audience.`}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[578px] h-[430px] relative bg-white rounded-2xl border border border border border-gray-200">
              <img
                className="w-[357.21px] h-[306.82px] left-[16.42px] top-[9.57px] absolute rounded-lg shadow"
                src={imagesForScreenShots["generateblogresponse"]}
              />
              <div className="w-[128.94px] h-[58.33px] pl-[5.85px] pr-[6.16px] py-[6.66px] left-[330px] top-[27px] absolute bg-white rounded-md shadow justify-center items-center inline-flex">
                <img
                  className="w-[116.93px] h-[45.02px]"
                  src={imagesForScreenShots["publishbutton"]}
                />
              </div>
              <div className="pl-2.5 pr-[14.47px] pt-[13.25px] pb-[15.45px] left-[189px] top-[173.87px] absolute bg-white rounded-lg shadow justify-start items-center inline-flex">
                <img
                  className="w-[264.53px] h-[223.30px] rounded-lg"
                  src={imagesForScreenShots["generateresponse"]}
                />
              </div>
              <div className="w-[153.24px] h-[44.66px] pl-[3.21px] pr-[4.08px] pt-[5.15px] pb-[4.72px] left-[412px] top-[197.87px] absolute bg-white rounded shadow justify-center items-center inline-flex">
                <img
                  className="w-[145.94px] h-[34.79px]"
                  src={imagesForScreenShots["publishLinkedinbutton"]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* testimonials */}
      <SectionSpacer />
      <div className="w-full h-[700px] relative bg-blue-50">
        <div className="w-[324.03px] h-[324.03px] left-[-195.14px] top-[374.12px] absolute opacity-80 bg-pink-100 rounded-full blur-[145px]" />
        <div className="flex-col justify-start items-center gap-[60px] inline-flex">
          <div className="flex-col justify-start items-center gap-3 flex">
            <div className="text-center text-slate-800 text-[48px] font-medium leading-10">
              See what our customers say
            </div>
            <div className="justify-start items-start gap-3 inline-flex">
              <div className="w-6 h-6 relative" />
              <div className="w-6 h-6 relative" />
              <div className="w-6 h-6 relative" />
              <div className="w-6 h-6 relative" />
              <div className="w-6 h-6 relative" />
            </div>
          </div>
          <div className="flex-col justify-start items-center gap-10 flex">
            <div className="w-[1298px] h-[378px] relative">
              <div className="w-[451px] h-[356px] left-0 top-[22px] absolute opacity-60 flex-col justify-center items-center inline-flex">
                <div className="h-[284px] px-10 pt-[50px] pb-[90px] rounded-lg flex-col justify-start items-center gap-6 flex">
                  <div className="w-6 h-6 relative" />
                  <div className="self-stretch h-24 flex-col justify-center items-start gap-6 flex">
                    <div className="self-stretch opacity-70 text-center text-black text-[16px] font-normal leading-normal">
                      I been impressed by the quality and relevance of the
                      content at Lille. It has provided me with countless ideas,
                      fresh perspectives, and of motivation to grow both
                      personally and professionally.{" "}
                    </div>
                  </div>
                </div>
                <div className="flex-col justify-start items-center gap-2 flex">
                  <div className="w-[90px] h-[90px] justify-center items-center inline-flex">
                    <img
                      className="w-[90px] h-[90px] rounded-full"
                      src={imagesForScreenShots["customer"]}
                    />
                  </div>
                  <div className="text-zinc-800 text-[16px] font-semibold">
                    Lora Smith{" "}
                  </div>
                </div>
              </div>
              <div className="w-[451px] h-[356px] left-[847px] top-[22px] absolute opacity-60 flex-col justify-center items-center inline-flex">
                <div className="h-[284px] px-10 pt-[50px] pb-[90px] rounded-lg flex-col justify-start items-center gap-6 flex">
                  <div className="w-6 h-6 relative" />
                  <div className="self-stretch h-24 flex-col justify-center items-start gap-6 flex">
                    <div className="self-stretch opacity-70 text-center text-black text-[16px] font-normal leading-normal">
                      I been impressed by the quality and relevance of the
                      content at Lille. It has provided me with countless ideas,
                      fresh perspectives, and of motivation to grow both
                      personally and professionally.{" "}
                    </div>
                  </div>
                </div>
                <div className="flex-col justify-start items-center gap-2 flex">
                  <div className="w-[90px] h-[90px] justify-center items-center inline-flex">
                    <img
                      className="w-[90px] h-[90px] rounded-full"
                      src={imagesForScreenShots["customer"]}
                    />
                  </div>
                  <div className="text-zinc-800 text-[16px] font-semibold">
                    Lora Smith{" "}
                  </div>
                </div>
              </div>
              <div className="w-[451px] h-[348px] left-[422px] top-0 absolute flex-col justify-center items-center inline-flex">
                <div className="h-[276px] px-6 pt-[50px] pb-[90px] bg-indigo-600 rounded-lg flex-col justify-start items-center gap-6 flex">
                  <div className="w-6 h-6 relative" />
                  <div className="self-stretch h-[88px] flex-col justify-center items-start gap-6 flex">
                    <div className="w-[403px] text-center text-white text-[16px] font-normal leading-snug">
                      I been impressed by the quality and relevance of the
                      content at Lille. It has provided me with countless ideas,
                      fresh perspectives, and of motivation to grow both
                      personally and professionally.{" "}
                    </div>
                  </div>
                </div>
                <div className="flex-col justify-start items-center gap-2 flex">
                  <div className="w-[90px] h-[90px] justify-center items-center inline-flex">
                    <img
                      className="w-[90px] h-[90px] rounded-full border border-white"
                      src={imagesForScreenShots["customer"]}
                    />
                  </div>
                  <div className="text-zinc-800 text-[16px] font-semibold">
                    Lora Smith{" "}
                  </div>
                </div>
              </div>
            </div>
            <div className="justify-start items-center gap-4 inline-flex">
              <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" />
              <div className="w-3.5 h-3.5 bg-indigo-200 rounded-full" />
              <div className="w-3.5 h-3.5 bg-indigo-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      {/* demo */}
      <SectionSpacer />
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full h-[600px] pl-[46px] pr-[97px] py-[51px] bg-white rounded-2xl shadow justify-start items-center gap-[101px] inline-flex">
          <div className="w-[430px] h-[498px] relative bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex-col justify-start items-start flex">
            <div className="justify-start items-center gap-1 inline-flex">
              <div className="text-slate-800 text-[32px] font-bold leading-10">
                Welcome to{" "}
              </div>
              <img
                className="w-[89.43px] h-[44.81px]"
                src="https://via.placeholder.com/89x45"
              />
            </div>
            <div className="w-[497.21px] h-[320.26px] relative">
              <div className="w-[40.46px] h-[196.66px] left-[73.58px] top-[117.53px] absolute"></div>
              <div className="w-[50.92px] h-[142.80px] left-[-0px] top-[170.67px] absolute"></div>
              <div className="w-[168.68px] h-[146.19px] left-[265.65px] top-[167.38px] absolute"></div>
              <div className="w-[24.60px] h-[45.93px] left-[222.49px] top-[37.47px] absolute">
                <div className="w-[24.60px] h-[45.93px] left-0 top-0 absolute"></div>
              </div>
              <div className="w-[16.47px] h-[30.19px] left-[97.42px] top-[50.66px] absolute">
                <div className="w-[16.47px] h-[30.19px] left-0 top-0 absolute"></div>
              </div>
              <div className="w-[24.49px] h-[23.77px] left-[38.68px] top-[71.50px] absolute"></div>
              <div className="w-[40.91px] h-[127.67px] left-[171.79px] top-[185.80px] absolute"></div>
              <div className="w-[272.46px] h-[220.47px] left-[36.79px] top-[93px] absolute">
                <div className="w-[20.39px] h-[20.91px] left-[98.70px] top-[55.66px] absolute"></div>
              </div>
            </div>
          </div>
          <div className="self-stretch flex-col justify-start items-center gap-6 inline-flex">
            <div className="justify-start items-center gap-3 inline-flex">
              <div className="text-slate-800 text-[32px] font-bold leading-10">
                Request a free demo
              </div>
            </div>
            <div className="w-[377px] h-[388px] relative ">
              <div className="w-[262px] h-[189px] flex-col justify-start items-start gap-[51px] inline-flex">
                <label for="email">
                  <p className="font-medium text-slate-700 pb-2 p-2">Name</p>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={"email"}
                    onChange={/* india the next super power */ () => {}}
                    className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                    placeholder="Enter email address"
                  />
                </label>
                <label for="email">
                  <p className="font-medium text-slate-700 pb-2 p-2">
                    Email address
                  </p>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={"email"}
                    onChange={/* india the next super power */ () => {}}
                    className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                    placeholder="Enter email address"
                  />
                </label>
                <div className="px-2 py-1 bg-white rounded-[200px] justify-start items-start gap-2.5 inline-flex">
                  <div className="text-black text-[14px] font-normal">
                    What topics are you most interested in?
                  </div>
                </div>
                <button className="w-[378px] px-5 py-[15px] bg-indigo-600 rounded-lg justify-center items-center gap-2.5 inline-flex">
                  <div className="text-white text-[18px] font-medium">Send</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* footer */}
    </>
  );
};

export default LandingPage;
const SectionSpacer = () => {
  return <div className="my-8"></div>;
};
