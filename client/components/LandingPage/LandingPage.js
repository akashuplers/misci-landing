const LandingPage = () => {
  return (
    <div className="w-full  flex-col justify-center items-center flex mt-20">
      <div className="h-[195px] px-20 flex-col justify-start items-center gap-4 flex border border-black">
        <div className="h-[81px] flex-col justify-start items-center gap-2 flex">
          <div className="self-stretch text-center text-slate-800 text-[48px] font-bold leading-10">
            Our Clients
          </div>
          <div className="self-stretch text-center">
            <span className="text-slate-600 text-[16px] font-normal">
              Helping these rocketship companies grow{" "}
            </span>
            <span className="text-indigo-600 text-[20px] font-medium">10x</span>
            <span className="text-slate-600 text-[16px] font-normal">
              {" "}
              faster
            </span>
          </div>
        </div>
      </div>
      <div className="flex-col justify-start items-center border border-blue-500 flex">
        <div className="w-full h-[500px] relative bg-gradient-to-b from-violet-50 to-violet-50">
          <div className="w-full h-[362.98px] top-[50px] absolute">
            <div className="w-[467.04px] h-[312.98px] left-0 top-0 absolute">
              <div className="w-[467.04px] h-[138.83px] left-[15px] top-[94.08px] absolute opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                {`We understand that consistently coming up with new ideas can
                  be challenging, especially for busy individuals or businesses
                  juggling multiple responsibilities. That's where we come in -
                  let us take care of the creative process while you focus on
                  other aspects of your work.`}
              </div>
              <div className="pb-[1.98px] left-[15px] top-0 absolute justify-start items-center gap-[50px] inline-flex">
                <div className=" h-0.5 bg-indigo-600"></div>
                <div className=" h-14 text-slate-800 text-[48px] font-bold leading-10">
                  About us
                </div>
              </div>
              <div className="pl-[30px] pr-6 py-[17px] left-[15px] top-[259px] absolute rounded-lg shadow border border border border border-indigo-600 justify-center items-center gap-2.5 inline-flex">
                <div className="text-indigo-600 text-[18px] font-medium">
                  Start for free
                </div>
              </div>
            </div>
            <div className=" justify-start items-center gap-[100px] inline-flex">
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

          <div className="opacity-50 w-[91.90px] h-[182.44px] left-[1183.39px] top-[640.56px] absolute">
            <div className="w-[91.90px] h-[125.70px] left-0 top-0 absolute"></div>
          </div>
          <div className="opacity-50 w-[80.34px] h-[242.88px] left-[169.29px] top-[576.38px] absolute">
            <div className="w-[80.34px] h-[179.25px] left-0 top-0 absolute"></div>
            <div className="w-[32.69px] h-[80.79px] left-[25.17px] top-[162.09px] absolute"></div>
          </div>
        </div>
        <div className="w-full  bg-gradient-to-b from-violet-50 to-white justify-center items-center flex">
          <div className="w-full h-hull relative bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl shadow flex-col justify-center items-center flex mt-20">
            <div className="h-[136px] my-20 flex-col justify-start items-center gap-6 inline-flex">
              <div className="self-stretch h-14 text-center text-white text-[48px] font-bold leading-10 tracking-wide">
                Why Choose Us
              </div>
              <div className="w-[803.89px] opacity-80 text-center text-white text-[16px] font-normal leading-7 tracking-wide">
                Lille is a unique platform dedicated to enriching your online
                experience by providing an engaging combination of informative
                content and interactive discussions.
              </div>
            </div>
            <div className="p-10  bg-white rounded-2xl shadow justify-center items-center inline-flex">
              <div className="w-full self-stretch justify-around items-center h-full flex">
                <div className="w-[30%] flex-col justify-start items-center gap-5 inline-flex">
                  <div className="self-stretch h-[156px] flex-col justify-start items-center gap-3 flex">
                    <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                      SEO optimization
                    </div>
                    <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                      {` We have implemented search engine optimization, such as
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
                      We have included social media share buttons to encourage
                      users to easily share your blog posts on their preferred
                      social platforms.
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
                      experience on the website, such as choosing their
                      preferred font size, color theme, etc.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[331.87px] h-[477.56px] origin-top-left rotate-[-53.85deg] opacity-60 bg-purple-500 rounded-full blur-[145px]"></div>
            <div className="w-[266.57px] h-[383.59px] origin-top-left rotate-[-53.85deg] opacity-60 bg-purple-500 rounded-full blur-[145px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
