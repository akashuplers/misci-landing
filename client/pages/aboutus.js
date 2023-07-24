import {
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import React from 'react';
import MoblieUnAuthFooter from '../components/LandingPage/MoblieUnAuthFooter';
import Layout from "../components/Layout";

const AboutUsFeatures = [
  {
    title: "80%",
    description: `Time reduced on 1st Drafts`,
  },
  {
    title: "40%",
    description: `Increase in social media followers`,
  },
  {
    title: "10X",
    description: `Return on Investment using Lille`,
  },
];

const AboutUS = () => {
  function scrollToUserDemo() {
    const userDemoElement = document.querySelector('.userDemo');
    userDemoElement?.scrollIntoView({ behavior: 'smooth' });
  }
  const welcomeImage = "/welcome.svg";
  const lilleLogo = "/lille_logo_new.png";
  const teamImage = "/team.svg";
  const teamDesktop = "/screenshots/teamworks.png";

  return (
    <Layout>

      <div>
        <div className="relative bg-gradient-to-b from-violet-50 to-violet-50 pt-20 min-h-screen">
          <div className="flex lg:flex-row flex-col mx-auto max-w-5xl items-center justify-center lg:justify-between">
            <div className="lg:w-[40%] flex flex-col lg:gap-16 items-center justify-center lg:justify-between lg:block">
              <div className="w-full flex-col justify-start items-center ">
                <div className="h-14 text-slate-800  text-2xl lg:text-5xl text-center lg:text-start font-bold leading-10">
                  About us
                </div>
              </div>
              <div className="opacity-70  text-center lg:text-start text-slate-600 text-[16px] font-normal leading-7">
                {`Lille is your secret weapon for automating backlinking by leveraging existing URLs on your website. Plus, it can read word documents, text files, and PDFs to generate fresh, engaging content.`}
              </div>
            </div>
            <div className="lg:hidden">
              <SectionSpacer />
            </div>
            <div className="mt-20 lg:mt-0 flex lg:flex-row flex-col justify-center  items-center gap-14 lg:gap-[100px]">
              <div className="flex-col lg:flex-row justify-start items-center inline-flex gap-10 lg:gap-0">
                {AboutUsFeatures.map((feature) => {
                  return (
                    <div
                      className="flex items-center gap-2 justify-center flex-col"
                      key={feature.title}
                    >
                      <div className="text-indigo-600 text-[60px] lg:text-6xl uppercase font-extrabold leading-10">
                        {feature.title}
                      </div>
                      <div className="text-slate-600 text-[18px] lg:text-lg text-slate-600 lg:text-center lg:items-center">
                        {feature.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto lg:hidden w-[352.08px] h-[194.15px]">
            <img src={teamImage} alt="team" className="w-full h-full" />
          </div>
          <div className="max-w-5xl mx-auto w-full h-[465.26px] hidden lg:flex items-center justify-center">
            <img src={teamDesktop} alt="team" className="w-full h-full" />
          </div>
        </div>
        <MoblieUnAuthFooter />
      </div>
    </Layout>
  )
}

export default AboutUS
export const SectionSpacer = () => {
  return <div className="my-8"></div>;
};
