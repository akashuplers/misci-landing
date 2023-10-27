import KeyFeatures from '@/components/KeyFeartures';
import Layout from '@/components/Layout';
import { FloatingBalls } from '@/components/ui/Chip';
import React from 'react';

const AllFeatures = [
  {
      icon:<svg xmlns="http://www.w3.org/2000/svg" width="27" height="32" viewBox="0 0 27 32" fill="none">
      <path d="M24.9106 6.3995L20.4392 1.8899C19.879 1.33179 19.1204 1.01847 18.3296 1.01855H3.42503C3.02626 1.02853 2.64718 1.19398 2.36871 1.47958C2.09025 1.76519 1.93445 2.14834 1.93457 2.54723V29.3755C1.93445 29.7744 2.09025 30.1576 2.36871 30.4432C2.64718 30.7288 3.02626 30.8942 3.42503 30.9042H24.2915C24.6969 30.9042 25.0857 30.7432 25.3724 30.4565C25.6591 30.1698 25.8202 29.781 25.8202 29.3755V8.50908C25.8156 8.11476 25.7329 7.72526 25.5768 7.36315C25.4206 7.00103 25.1942 6.67349 24.9106 6.3995Z" stroke="url(#paint0_linear_5303_17190)" stroke-width="1.96534" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.74121 8.80957H18.2152" stroke="url(#paint1_linear_5303_17190)" stroke-width="0.818891" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.74121 14.1816H21.9758" stroke="url(#paint2_linear_5303_17190)" stroke-width="0.818891" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.74121 19.5518H20.6458" stroke="url(#paint3_linear_5303_17190)" stroke-width="0.818891" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.74121 24.9307H15.433" stroke="url(#paint4_linear_5303_17190)" stroke-width="0.818891" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_5303_17190" x1="13.8774" y1="1.01855" x2="13.8774" y2="30.9042" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint1_linear_5303_17190" x1="11.9782" y1="8.80957" x2="11.9782" y2="9.80957" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint2_linear_5303_17190" x1="13.8585" y1="14.1816" x2="13.8585" y2="15.1816" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint3_linear_5303_17190" x1="13.1935" y1="19.5518" x2="13.1935" y2="20.5518" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint4_linear_5303_17190" x1="10.5871" y1="24.9307" x2="10.5871" y2="25.9307" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
      </defs>
    </svg>,
      heading:"An Exhaustive Article Creation based User's Topic.",
      subHeading:"An exhaustive article creation based user's topic."
  },
  {
      icon:<svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" viewBox="0 0 31 30" fill="none">
      <path d="M23.8727 29.4118H23.8727C23.7798 29.4118 23.7051 29.3361 23.7051 29.2452V19.2459C23.7051 17.3652 23.2223 16.2863 22.5101 15.7025C21.8223 15.1387 21.0332 15.139 20.6762 15.1392C20.6703 15.1392 20.6645 15.1392 20.6589 15.1392C19.5766 15.1392 18.6851 15.482 18.0788 16.2288C17.488 16.9565 17.2319 17.9911 17.2319 19.2459V29.2463C17.2319 29.3381 17.1571 29.4129 17.0653 29.4129H11.4108C11.319 29.4129 11.2443 29.3381 11.2443 29.2463V10.1971C11.2443 10.1053 11.319 10.0305 11.4108 10.0305H17.0663C17.1582 10.0305 17.2329 10.1053 17.2329 10.1971V10.9069V11.9502L18.0372 11.2857L18.3776 11.0044L18.3778 11.0043C19.6243 9.97319 21.1093 9.44837 22.8111 9.44837C24.9433 9.44837 26.692 10.1272 27.9091 11.37L27.9091 11.3701C29.1955 12.6832 29.9095 14.6742 29.9095 17.1829V29.2463C29.9095 29.3371 29.8348 29.4128 29.742 29.4129C29.742 29.4129 29.742 29.4129 29.7419 29.4129L23.8727 29.4118ZM24.0413 28.5873V29.0787H24.5326H29.083H29.5743V28.5873V17.1829C29.5743 14.907 28.9815 13.0474 27.8055 11.7522C26.6233 10.4501 24.9109 9.78358 22.8111 9.78358C18.9717 9.78358 17.3026 12.6841 17.2174 12.8355L17.2173 12.8355L17.2152 12.8394C17.1846 12.8947 17.1286 12.9268 17.0695 12.9268C17.0652 12.9268 17.0511 12.9261 17.0224 12.9193C16.9464 12.8993 16.8987 12.8335 16.8987 12.7633V10.8571V10.3657H16.4074H12.0698H11.5784V10.8571V28.5884V29.0797H12.0698H16.4074H16.8987V28.5884V19.2459C16.8987 17.7805 17.2758 16.6742 17.9073 15.9416C18.5306 15.2185 19.4492 14.804 20.6599 14.804C21.3211 14.804 22.1511 14.9518 22.8131 15.5377C23.4637 16.1135 24.0413 17.1924 24.0413 19.2459V28.5873Z" fill="url(#paint0_linear_5303_17202)" stroke="url(#paint1_linear_5303_17202)" stroke-width="0.98267"/>
      <path d="M1.90956 28.5872V29.0785H2.4009H6.98237H7.47371V28.5872V10.8559V10.3646H6.98237H2.4009H1.90956V10.8559V28.5872ZM1.74195 29.4117C1.64911 29.4117 1.57434 29.336 1.57434 29.2451V10.197C1.57434 10.1061 1.6491 10.0304 1.74195 10.0304H7.64132C7.73316 10.0304 7.80789 10.1051 7.80789 10.197V29.2451C7.80789 29.337 7.73316 29.4117 7.64132 29.4117H1.74195Z" fill="url(#paint2_linear_5303_17202)" stroke="url(#paint3_linear_5303_17202)" stroke-width="0.98267"/>
      <path d="M7.9834 4.19111V4.19079C7.98219 2.34978 6.50065 0.841934 4.66432 0.841934C2.82771 0.841934 1.34316 2.34804 1.34316 4.19111C1.34316 6.03373 2.82829 7.53718 4.66432 7.53718C6.49966 7.53718 7.9834 6.03338 7.9834 4.19111ZM4.66432 7.87032C2.65112 7.87032 1.00794 6.22187 1.00794 4.19111C1.00794 2.15924 2.6512 0.510866 4.66432 0.510866C6.67377 0.510866 8.31655 2.15971 8.31655 4.19215C8.31655 6.22219 6.67409 7.87032 4.66432 7.87032Z" fill="url(#paint4_linear_5303_17202)" stroke="url(#paint5_linear_5303_17202)" stroke-width="0.98267"/>
      <defs>
        <linearGradient id="paint0_linear_5303_17202" x1="20.5769" y1="8.95703" x2="20.5769" y2="29.9042" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint1_linear_5303_17202" x1="20.5769" y1="8.95703" x2="20.5769" y2="29.9042" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint2_linear_5303_17202" x1="4.69112" y1="9.53906" x2="4.69112" y2="29.903" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint3_linear_5303_17202" x1="4.69112" y1="9.53906" x2="4.69112" y2="29.903" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint4_linear_5303_17202" x1="4.66224" y1="0.0195312" x2="4.66224" y2="8.36166" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint5_linear_5303_17202" x1="4.66224" y1="0.0195312" x2="4.66224" y2="8.36166" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
      </defs>
    </svg>,
      heading:"Linkedin Post Creation based on User's Topic.",
      subHeading:"Linkedin post creation based on user's topic."
  },
  {
      icon:<svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none">
      <g clip-path="url(#clip0_5303_17214)">
        <path d="M18.2135 12.9977L29.3316 0.341797H26.6979L17.04 11.3285L9.33196 0.341797H0.439453L12.0981 16.9573L0.439453 30.2274H3.07316L13.2656 18.6225L21.4076 30.2274H30.3001M4.02373 2.28672H8.06985L26.6959 28.378H22.6488" fill="url(#paint0_linear_5303_17214)"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_5303_17214" x1="15.3698" y1="0.341797" x2="15.3698" y2="30.2274" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <clipPath id="clip0_5303_17214">
          <rect width="29.8607" height="29.8857" fill="white" transform="translate(0.438477 0.34082)"/>
        </clipPath>
      </defs>
    </svg>,
      heading:"X Threads Creation based on User's Topic.",
      subHeading:"X threads creation based on user's topic."
  },
  {
      icon:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
      <path d="M15.1905 8.37863L20.7979 2.77107C22.9618 0.607232 26.8873 1.02444 29.051 3.18819C31.2147 5.35195 31.6319 9.27743 29.4681 11.4413L21.1622 19.7472C18.9984 21.911 15.0729 21.4938 12.9092 19.3301" stroke="url(#paint0_linear_5303_17222)" stroke-width="1.96534" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.7137 24.1894L11.1062 29.797C8.94239 31.9608 5.01683 31.5436 2.85316 29.3798C0.689488 27.2161 0.272279 23.2906 2.43611 21.1268L10.7419 12.8209C12.9058 10.657 16.8313 11.0743 18.995 13.2379" stroke="url(#paint1_linear_5303_17222)" stroke-width="1.96534" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_5303_17222" x1="21.9033" y1="1.3418" x2="21.9033" y2="21.1764" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint1_linear_5303_17222" x1="10.0009" y1="11.3916" x2="10.0009" y2="31.2262" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
      </defs>
    </svg>,
      heading:"Upload Documents & URLs for Content Creation.",
      subHeading:"Allow user to upload documents & URLs for content creation."
  },
  {
      icon:<svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32" fill="none">
      <path d="M16.28 8.21559C16.303 8.23863 16.3343 8.25157 16.3669 8.25157C16.3994 8.25157 16.4307 8.23863 16.4537 8.21559L17.3043 7.36501C17.3523 7.31704 17.3523 7.23927 17.3043 7.1913L11.1912 1.07818C11.1432 1.03021 11.0654 1.03021 11.0175 1.07818L4.90435 7.1913C4.85638 7.23927 4.85638 7.31704 4.90435 7.36501L5.75493 8.21559C5.77797 8.23863 5.80921 8.25157 5.84179 8.25157C5.87437 8.25157 5.90561 8.23863 5.92865 8.21559L10.3802 3.76402V22.5062C10.3802 22.5741 10.4352 22.6291 10.5031 22.6291H11.7056C11.7734 22.6291 11.8284 22.5741 11.8284 22.5062V3.76402L16.28 8.21559Z" fill="url(#paint0_linear_5303_17232)" stroke="url(#paint1_linear_5303_17232)" stroke-width="0.245667" stroke-linejoin="round"/>
      <path d="M13.6534 11.9103C13.5856 11.9103 13.5306 11.9653 13.5306 12.0332L13.5306 13.0339C13.5306 13.1017 13.5856 13.1567 13.6534 13.1567H20.1535L20.1535 29.9273L2.06029 29.9273L2.06029 13.1567L8.56036 13.1567C8.6282 13.1567 8.68319 13.1017 8.68319 13.0339V12.0332C8.68319 11.9653 8.6282 11.9103 8.56036 11.9103L0.918844 11.9103C0.851006 11.9103 0.796011 11.9653 0.796011 12.0332L0.796011 31.0518C0.796011 31.1196 0.851006 31.1746 0.918844 31.1746L21.2959 31.1746C21.3637 31.1746 21.4187 31.1196 21.4187 31.0518L21.4187 12.0332C21.4187 11.9653 21.3637 11.9103 21.2959 11.9103H13.6534Z" fill="url(#paint2_linear_5303_17232)" stroke="url(#paint3_linear_5303_17232)" stroke-width="0.245667" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_5303_17232" x1="11.1043" y1="1.16504" x2="11.1043" y2="22.5062" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint1_linear_5303_17232" x1="11.1043" y1="1.16504" x2="11.1043" y2="22.5062" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint2_linear_5303_17232" x1="11.1074" y1="31.0518" x2="11.1074" y2="12.0332" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
        <linearGradient id="paint3_linear_5303_17232" x1="11.1074" y1="31.0518" x2="11.1074" y2="12.0332" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9D9D"/>
          <stop offset="0.046875" stop-color="#F792A3"/>
          <stop offset="0.869792" stop-color="#9200EB"/>
        </linearGradient>
      </defs>
    </svg>,
      heading:"Publish The Content to Popular Platforms.",
      subHeading:"Allow users to publish the content to popular platforms."
  },
]


const Features: React.FC = () => {
  return (
    <Layout blogId={null}>
        <div className="relative overflow-x-hidden flex items-center justify-start flex-col w-full min-h-screen">
          <div className='max-w-6xl mx-auto px-6'>
            <div id='background' className='w-full h-full overflow-hidden pointer-events-none z-[-1]'>
                <FloatingBalls className="hidden absolute top-[4%] rotate-45 md:block" />
                <FloatingBalls className="hidden absolute top-[2%] w-10 right-[2%] md:block" />
                <FloatingBalls className="hidden absolute top-[9%] right-0 md:block" />
                <FloatingBalls className="hidden absolute top-[10%] w-8 rotate-90 left-[3%] md:block" />
              <div
                className="w-full lg:w-[50%] h-full "
                style={{
                  transform: "rotate(0deg)",
                  transformOrigin: "0 0",
                  background:
                    "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
                  top: "-10px",
                  right: "0px",
                  position: "absolute",
                  zIndex: -1,
                }}
              ></div>
              <div
                className="w-full lg:w-[50%] h-full "
                style={{
                  transform: "scaleX(-1)",
                  background:
                    "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
                  top: "-10px",
                  left: "0px",
                  position: "absolute",
                  zIndex: -1,
                }}
              ></div>
              <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <svg
                  className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
                  viewBox="0 0 1155 678"
                >
                  <path
                    fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                    fillOpacity=".3"
                    d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                  />
                  <defs>
                    <linearGradient
                      id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                      x1="1155.49"
                      x2="-78.208"
                      y1=".177"
                      y2="474.645"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#9089FC" />
                      <stop offset={1} stopColor="#FF80B5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center gap-4 mt-[15vh]'>
              <h1 className='text-4xl font-semibold'>Let Your Ideas Take Flight with a <span className='text-primary'>Co-Pilot</span></h1>
              <h4 className='text-black text-2xl font-light'>Navigating Content Creation and Connection!</h4>
              <button className='text-white px-6 py-2.5 rounded-lg shadow-xl mt-6' style={{
                background: `linear-gradient(270deg,#d087e8,#dd70c0,#ffb257)`
              }}>Get Started</button>
              <div className='border-black border-[10px] rounded-lg relative bottom-[-70px] z-[2]'>
                <img src="/featurepage.png"/>
              </div>
            </div>
          </div>
          <div className='w-full' style={{
              background: 'rgba(74, 58, 254, 0.10)',
              backdropFilter: 'blur(8.5px)',
            }}>
            <div className='w-full max-w-[90rem] mx-auto px-6 md:px-20 pb-10 pt-[20vh] relative' id='features' >
              <h1 className='text-black text-2xl font-light mb-4'>AI Powered</h1>
              <p className='text-4xl font-semibold'><span className='bg-[#F9948C] text-white rounded-lg px-4 py-2'>Content</span> Generation</p>
              <div className='w-full lg:w-4/5 max-w-[1000px] flex flex-wrap gap-6 py-10 pb-20'>
                  {AllFeatures.map((feature, key) => (
                      <div key={key} className='w-full sm:max-w-[500px] md:max-w-[330px] flex flex-col justify-start items-start gap-2 bg-transparent rounded-lg'>
                        <div className='bg-white rounded-lg p-4 mb-2'>{feature.icon}</div>
                        <h1 className='text-lg font-bold'>{feature.heading}</h1>
                        <h4 className='text-base font-light'>{feature.subHeading}</h4>
                      </div>
                  ))}
              </div>
              <div className='hidden md:block max-w-full sm:max-w-1/2 absolute right-[-3rem] top-1/2 transform translate-y-[-50%] z-[-1]'>
                <img src='/iPad Mini.png'/>
              </div>
            </div>
          </div>

        </div>
    </Layout>
  );
};

export default Features;