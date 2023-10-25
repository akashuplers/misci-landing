import { features } from 'process';
import React from 'react';

type KeyFeaturesType = {
    icon: React.ReactNode;
    heading: string;
    subHeading: string;
};

const AllFeatures: KeyFeaturesType[] = [
    {
        icon:<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="39.9872" height="39.9872" rx="3.80831" fill="#4A3AFE" fill-opacity="0.4"/>
        <path d="M26.0639 12.949L23.215 10.0757C22.858 9.72009 22.3747 9.52045 21.8709 9.52051H12.3744C12.1204 9.52686 11.8788 9.63228 11.7014 9.81425C11.524 9.99623 11.4247 10.2403 11.4248 10.4945V27.5881C11.4247 27.8422 11.524 28.0863 11.7014 28.2683C11.8788 28.4503 12.1204 28.5557 12.3744 28.562H25.6694C25.9278 28.562 26.1755 28.4594 26.3582 28.2768C26.5408 28.0941 26.6434 27.8464 26.6434 27.5881V14.2931C26.6405 14.0418 26.5878 13.7937 26.4883 13.5629C26.3889 13.3322 26.2446 13.1235 26.0639 12.949Z" stroke="white" stroke-width="1.25221" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.8506 14.4844H21.7984" stroke="white" stroke-width="0.521754" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.8506 17.9072H24.1944" stroke="white" stroke-width="0.521754" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.8506 21.3291H23.347" stroke="white" stroke-width="0.521754" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.8506 24.7559H20.0257" stroke="white" stroke-width="0.521754" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>,
        heading:"An Exhaustive Article Creation based User's Topic.",
        subHeading:"An exhaustive article creation based user's topic."
    },
    {
        icon:<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="39.9872" height="39.9872" rx="3.80831" fill="#4A3AFE" fill-opacity="0.4"/>
        <path d="M24.4012 28.5606C24.1698 28.5606 23.9813 28.3728 23.9813 28.1414V21.7704C23.9813 19.4668 22.7992 19.4668 22.3535 19.4668C21.1119 19.4668 20.4831 20.2417 20.4831 21.7704V28.1421C20.4831 28.3735 20.2953 28.5612 20.0639 28.5612H16.4612C16.2298 28.5612 16.042 28.3735 16.042 28.1421V16.0049C16.042 15.7735 16.2298 15.5858 16.4612 15.5858H20.0646C20.296 15.5858 20.4837 15.7735 20.4837 16.0049V16.4572L20.7006 16.278C21.5535 15.5725 22.5711 15.2148 23.7248 15.2148C25.151 15.2148 26.3516 15.6704 27.1966 16.5332C28.0892 17.4443 28.5606 18.801 28.5606 20.4559V28.1421C28.5606 28.3735 28.3722 28.5612 28.1408 28.5612L24.4012 28.5606ZM22.3542 18.6271C23.2759 18.6271 24.8217 19.0358 24.8217 21.7704V27.7222H27.7209V20.4559C27.7209 17.6585 26.2644 16.0545 23.7248 16.0545C21.457 16.0545 20.4745 17.767 20.4335 17.8397C20.3594 17.9739 20.2193 18.0572 20.0665 18.0572C20.0322 18.0572 19.9971 18.0519 19.9614 18.0433C19.775 17.9964 19.6447 17.8304 19.6447 17.64V16.4254H16.881V27.7229H19.6447V21.7704C19.6447 19.802 20.6576 18.6271 22.3542 18.6271Z" fill="white"/>
        <path d="M10.3007 28.5608C10.0693 28.5608 9.88086 28.373 9.88086 28.1416V16.0051C9.88086 15.7737 10.0693 15.5859 10.3007 15.5859H14.0595C14.2909 15.5859 14.4786 15.7737 14.4786 16.0051V28.1416C14.4786 28.373 14.2909 28.5608 14.0595 28.5608H10.3007ZM10.7205 27.7224H13.6396V16.425H10.7205V27.7224Z" fill="white"/>
        <path d="M12.1632 14.8357C10.706 14.8357 9.52051 13.6436 9.52051 12.1784C9.52051 10.7126 10.706 9.52051 12.1632 9.52051C13.6184 9.52051 14.8033 10.7133 14.8033 12.1791C14.8033 13.6436 13.6184 14.8357 12.1632 14.8357ZM12.1632 10.3576C11.1688 10.3576 10.3602 11.1741 10.3602 12.1784C10.3602 13.1821 11.1688 13.9973 12.1632 13.9973C13.157 13.9973 13.9649 13.1821 13.9649 12.1784C13.9642 11.1748 13.157 10.3576 12.1632 10.3576Z" fill="white"/>
        </svg>,
        heading:"Linkedin Post Creation based on User's Topic.",
        subHeading:"Linkedin post creation based on user's topic."
    },
    {
        icon:<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="39.9872" height="39.9872" rx="3.80831" fill="#4A3AFE" fill-opacity="0.4"/>
        <g clip-path="url(#clip0_5071_30246)">
        <path d="M21.7973 18.5373L28.8812 10.4736H27.2031L21.0496 17.4738L16.1385 10.4736H10.4727L17.9009 21.0601L10.4727 29.5151H12.1507L18.6448 22.1211L23.8324 29.5151H29.4983M12.7564 11.7128H15.3343L27.2019 28.3368H24.6233" fill="white"/>
        </g>
        <defs>
        <clipPath id="clip0_5071_30246">
        <rect width="19.0256" height="19.0415" fill="white" transform="translate(10.4727 10.4727)"/>
        </clipPath>
        </defs>
        </svg>,
        heading:"X Threads Creation based on User's Topic.",
        subHeading:"X threads creation based on user's topic."
    },
    {
        icon:<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="39.9872" height="39.9872" rx="3.80831" fill="#4A3AFE" fill-opacity="0.4"/>
        <path d="M19.5092 14.9561L23.082 11.3833C24.4606 10.0046 26.9618 10.2705 28.3404 11.6491C29.7189 13.0277 29.9848 15.5288 28.6061 16.9075L23.3141 22.1996C21.9354 23.5782 19.4342 23.3124 18.0557 21.9338" stroke="white" stroke-width="1.25221" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.4802 25.03L16.9074 28.6029C15.5288 29.9816 13.0276 29.7157 11.649 28.3371C10.2705 26.9585 10.0046 24.4574 11.3833 23.0787L16.6753 17.7866C18.054 16.408 20.5552 16.6738 21.9337 18.0524" stroke="white" stroke-width="1.25221" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>,
        heading:"Upload Documents & URLs for Content Creation.",
        subHeading:"Allow user to upload documents & URLs for content creation."
    },
    {
        icon:<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="39.9872" height="39.9872" rx="3.80831" fill="#4A3AFE" fill-opacity="0.4"/>
        <path d="M23.1155 14.9649C23.1301 14.9796 23.1501 14.9878 23.1708 14.9878C23.1916 14.9878 23.2115 14.9796 23.2261 14.9649L23.7681 14.4229C23.7987 14.3924 23.7987 14.3428 23.7681 14.3123L19.8731 10.4173C19.8426 10.3868 19.793 10.3868 19.7625 10.4173L15.8675 14.3123C15.8369 14.3428 15.8369 14.3924 15.8675 14.4229L16.4095 14.9649C16.4241 14.9796 16.444 14.9878 16.4648 14.9878C16.4856 14.9878 16.5055 14.9796 16.5201 14.9649L19.3564 12.1286V24.0701C19.3564 24.1133 19.3915 24.1484 19.4347 24.1484H20.2009C20.2441 24.1484 20.2792 24.1133 20.2792 24.0701V12.1286L23.1155 14.9649Z" fill="white" stroke="white" stroke-width="0.156526" stroke-linejoin="round"/>
        <path d="M21.4422 17.3188C21.3989 17.3188 21.3639 17.3538 21.3639 17.397V18.0346C21.3639 18.0779 21.3989 18.1129 21.4422 18.1129H25.5836V28.7982H14.0556L14.0556 18.1129H18.1971C18.2403 18.1129 18.2754 18.0779 18.2754 18.0346V17.397C18.2754 17.3538 18.2403 17.3188 18.1971 17.3188H13.3284C13.2851 17.3188 13.2501 17.3538 13.2501 17.397L13.2501 29.5146C13.2501 29.5579 13.2851 29.5929 13.3284 29.5929H26.3115C26.3547 29.5929 26.3898 29.5579 26.3898 29.5146V17.397C26.3898 17.3538 26.3547 17.3188 26.3115 17.3188H21.4422Z" fill="white" stroke="white" stroke-width="0.156526" stroke-linejoin="round"/>
        </svg>,
        heading:"Publish The Content to Popular Platforms.",
        subHeading:"Allow users to publish the content to popular platforms."
    },
]

const KeyFeatures: React.FC = () => {
  return (
    <div className='w-full max-w-[90rem] mx-auto px-6 relative' id='features'>
        <h1 className='text-primary text-4xl font-bold'>Key Features</h1>
        <p className='text-xl font-light'>Navigating Crafting Content with Your Co-Pilot</p>
        <div className='w-full lg:w-4/5 max-w-[1000px] flex flex-wrap gap-6 py-10 pb-20'>
            {AllFeatures.map((feature, key) => (
                <div key={key} className='w-full sm:max-w-[500px] md:max-w-[330px] flex flex-col justify-start items-start gap-4 p-6 pr-14 bg-white rounded-lg shadow-lg'>
                  <div>{feature.icon}</div>
                  <h1 className='text-lg font-bold'>{feature.heading}</h1>
                  <h4 className='text-base font-light'>{feature.subHeading}</h4>
                </div>
            ))}
        </div>
        <svg className='hidden md:block max-w-full sm:max-w-1/2 absolute right-[-3rem] top-1/2 transform translate-y-[-50%] z-[-1]' xmlns="http://www.w3.org/2000/svg" width="622" height="390" viewBox="0 0 622 390" fill="none">
            <g clip-path="url(#clip0_5079_30288)">
            <path d="M185.562 388.129C185.929 357.224 198.463 327.709 220.447 305.984C242.431 284.259 272.092 272.076 302.999 272.076C333.906 272.076 363.568 284.259 385.552 305.984C407.536 327.709 420.07 357.224 420.436 388.129H185.562Z" fill="#4A3AFE" fill-opacity="0.1"/>
            <path d="M211.637 182.458L210.811 189.691C210.794 189.859 210.732 190.019 210.629 190.154C210.524 190.287 210.388 190.392 210.233 190.459C210.08 190.525 209.912 190.551 209.746 190.533C209.578 190.515 209.418 190.453 209.283 190.352L208.846 190.013L209.052 187.256C209.23 184.912 208.768 182.564 207.715 180.462C206.662 178.361 205.058 176.585 203.074 175.324L186.883 165.036C186.296 164.676 185.662 164.398 185 164.211L188.658 160.157C188.93 159.863 189.262 159.632 189.632 159.479C190 159.324 190.397 159.248 190.796 159.256C191.197 159.273 191.591 159.372 191.952 159.546C192.309 159.726 192.624 159.979 192.877 160.289L211.637 182.458Z" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M185.026 164.121C185.689 164.309 186.322 164.587 186.909 164.947L203.1 175.235C205.084 176.495 206.689 178.271 207.742 180.373C208.794 182.474 209.256 184.822 209.078 187.166L208.872 189.924" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M202.637 244.493L198.765 268.438" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M208.856 189.973L204.298 225.072" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M272.961 312.966L245.301 383.19H229.473L245.301 302.092C241.585 304.494 235.607 306.848 228.275 308.747C210.886 313.247 185.918 315.179 165.722 309.085C149.01 304.032 135.634 293.488 132.537 274.407C132.136 271.902 131.83 269.425 131.621 266.976C143.362 275.142 228.829 263.02 257.125 272.458C263.062 274.382 283.844 284.282 272.961 312.966Z" fill="#282828"/>
            <path d="M131.587 266.942C131.463 266.835 131.331 266.76 131.216 266.661" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M131.588 266.943C127.261 216.469 163.113 179.272 178.388 165.648C179.272 164.859 180.34 164.306 181.495 164.039C182.649 163.772 183.852 163.8 184.993 164.121" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M704.199 389.128H201.227" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M117.204 389.128H43.4873" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M228.259 308.788C210.854 313.288 185.836 315.212 165.697 309.11" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M224.518 314.709C208.291 318.348 193.957 320.167 181.516 320.167C161.105 320.167 145.616 315.296 134.601 305.536C107.486 281.509 112.374 232.876 117.542 181.386L118.013 176.548C118.194 175.283 118.856 174.137 119.861 173.349C120.867 172.561 122.138 172.192 123.409 172.318C124.68 172.445 125.853 173.058 126.683 174.029C127.513 175.001 127.936 176.255 127.863 177.53L127.36 182.427C122.447 231.282 117.823 277.562 141.141 298.212C147.383 303.736 155.516 307.377 165.672 309.152C185.868 315.246 210.836 313.281 228.234 308.814C228.515 310.088 228.283 311.421 227.587 312.525C226.892 313.629 225.789 314.414 224.518 314.709Z" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M201.218 389.12H117.205C124.058 384.48 140.324 381.21 159.216 381.21C178.107 381.21 194.365 384.48 201.218 389.12Z" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M166.135 318.912L159.207 381.21" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M228.788 134.422C228.978 127.222 221.291 115.431 205.405 119.774C189.519 124.117 183.161 137.65 186.117 144.792C189.073 151.934 195.695 155.592 202.341 151.736C202.341 151.736 198.626 144.603 203.902 141.069C209.178 137.535 209.905 145.04 209.038 147.864C208.171 150.688 213.711 146.213 216.139 141.812C217.466 141.826 218.783 141.573 220.011 141.069C221.246 140.565 222.369 139.822 223.314 138.88C224.917 137.131 226.77 135.628 228.813 134.422H228.788Z" fill="#282828"/>
            <path d="M203.836 119.212C204.55 118.768 205.114 118.12 205.455 117.351C205.797 116.583 205.9 115.73 205.752 114.902C204.464 108.189 197.123 98.3058 185.407 102.831C171.7 108.115 178.157 120.517 184.416 120.418C188.328 120.474 192.069 122.029 194.869 124.761L203.836 119.212Z" fill="#282828"/>
            <path d="M205.362 159.193C205.362 159.193 217.434 170.265 219.969 168.795C222.504 167.326 225.864 156.897 225.864 156.897C227.259 157.095 228.68 156.997 230.034 156.608C231.322 155.956 227.755 150.696 228.003 146.634C228.25 142.572 229.414 137.221 228.126 134.744" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M191.847 159.654C194.507 157.181 196.901 154.436 198.989 151.463" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M212.522 165.161C212.522 165.161 205.594 173.261 205.644 176.39" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M228.127 134.744C227.45 137.84 222.025 144.215 217.005 143.678" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M196.082 126.173C194.481 124.637 189.783 121.037 185.704 121.871C181.625 122.705 180.667 120.789 180.667 120.789" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M292.745 227.41C292.745 227.41 311.447 236.567 310.216 236.939C308.458 237.574 302.092 234.924 302.092 234.924C302.092 234.924 299.292 237.599 297.856 237.252C296.038 236.832 294.28 236.189 292.621 235.337" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M228.259 389.119L229.439 383.19H243.278C249.883 383.19 256.34 385.874 262.087 389.119H228.259Z" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M194.654 156.863L205.627 174.797L192.045 159.456L194.654 156.863Z" fill="#282828"/>
            <path d="M245.301 383.191H229.473L245.301 302.093C241.585 304.496 235.607 306.849 228.283 308.756C210.886 313.256 185.918 315.18 165.722 309.086" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M131.588 266.942C138.614 271.83 172.046 269.419 203.835 268.767" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M228.242 308.789C210.853 313.289 185.885 315.221 165.689 309.127C148.977 304.074 135.601 293.53 132.504 274.449C132.102 271.944 131.797 269.467 131.588 267.018" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M245.253 383.208H229.433L245.253 302.093" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M424.474 240.257H279.071V249.818H424.474" stroke="#282828" stroke-width="0.957792" stroke-miterlimit="10"/>
            <path d="M293.108 249.818V389.516" stroke="#282828" stroke-width="0.957792" stroke-miterlimit="10"/>
            <path d="M194.05 184.491L204.297 225.074L287.625 226.651L288.897 237.624L197.172 244.708C195.132 244.87 193.093 244.396 191.334 243.352C189.575 242.309 188.182 240.746 187.346 238.879L172.971 201.575" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M342.699 237.516H292.093V240.414H342.699V237.516Z" fill="#282828"/>
            <path d="M339.503 237.598L356.545 199.08L358.543 199.749L342.319 237.516L339.503 237.598Z" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M289.053 236.756L292.158 236.624L292.678 226.773L287.625 226.649" stroke="#282828" stroke-width="1.28806" stroke-miterlimit="10"/>
            <path d="M201.324 251.255C201.324 251.255 186.66 252.006 184.48 246.912C178.304 232.487 172.475 201.986 172.475 201.986C172.475 201.986 184.53 234.072 187.337 238.878C190.144 243.683 194.413 244.856 198.525 244.658L202.653 244.476L201.324 251.255Z" fill="#282828"/>
            <path d="M535.603 334.319H591.204L585.672 389.128H539.863L535.603 334.319Z" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M506.563 388.243C507.695 388.243 539.698 377.245 539.698 377.245L540.524 388.805L506.563 388.243Z" fill="#282828"/>
            <path d="M531.143 327.35H595.505C595.727 327.35 595.946 327.399 596.147 327.495C596.347 327.59 596.523 327.73 596.662 327.902C596.802 328.075 596.901 328.277 596.952 328.492C597.003 328.708 597.005 328.933 596.959 329.15L596.092 333.154C596.021 333.487 595.838 333.785 595.574 333.999C595.309 334.213 594.979 334.328 594.639 334.327H532.638C532.335 334.325 532.04 334.232 531.791 334.06C531.542 333.887 531.351 333.644 531.243 333.361L529.74 329.364C529.654 329.138 529.624 328.894 529.654 328.654C529.683 328.414 529.771 328.185 529.91 327.986C530.048 327.788 530.232 327.626 530.448 327.515C530.663 327.404 530.901 327.347 531.143 327.35V327.35Z" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M536.255 340.618C536.965 340.618 591.204 334.326 591.204 334.326H535.603L536.255 340.618Z" fill="#282828"/>
            <path d="M517.899 269.502C517.585 269.659 517.304 269.877 517.074 270.142C516.844 270.408 516.668 270.717 516.558 271.051C516.447 271.384 516.404 271.737 516.43 272.088C516.456 272.438 516.552 272.78 516.71 273.094C516.903 273.489 517.173 273.842 517.505 274.132C517.836 274.421 518.222 274.642 518.639 274.78C519.057 274.919 519.498 274.973 519.937 274.938C520.376 274.904 520.803 274.782 521.194 274.58C522.185 274.083 522.939 273.212 523.289 272.159C523.639 271.106 523.556 269.958 523.06 268.965C522.751 268.352 522.325 267.806 521.806 267.357C521.286 266.909 520.683 266.567 520.031 266.352C519.38 266.136 518.692 266.051 518.007 266.102C517.323 266.152 516.655 266.337 516.042 266.645C515.275 267.03 514.592 267.562 514.031 268.211C513.47 268.86 513.042 269.613 512.772 270.428C512.502 271.242 512.395 272.101 512.458 272.957C512.52 273.813 512.75 274.647 513.135 275.414C513.616 276.372 514.28 277.227 515.091 277.928C515.902 278.63 516.843 279.164 517.861 279.502C518.878 279.839 519.952 279.972 521.022 279.894C522.091 279.816 523.134 279.528 524.092 279.047C526.512 277.832 528.352 275.706 529.205 273.136C530.058 270.565 529.855 267.762 528.641 265.341C527.121 262.317 524.462 260.021 521.249 258.957C518.037 257.894 514.533 258.149 511.509 259.668C509.632 260.601 507.958 261.897 506.584 263.48C505.211 265.063 504.164 266.902 503.504 268.892C502.845 270.881 502.586 272.982 502.743 275.072C502.899 277.162 503.468 279.201 504.416 281.07C517.132 305.634 563.931 287.097 564.518 312.016" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M529.277 210.665C529.018 210.795 528.786 210.976 528.596 211.196C528.406 211.416 528.262 211.671 528.17 211.947C528.079 212.223 528.043 212.515 528.065 212.805C528.086 213.095 528.164 213.378 528.295 213.637C528.457 213.963 528.682 214.253 528.957 214.492C529.232 214.73 529.551 214.912 529.896 215.027C530.241 215.142 530.605 215.188 530.968 215.162C531.331 215.136 531.685 215.039 532.011 214.876C532.418 214.671 532.781 214.389 533.079 214.044C533.377 213.7 533.604 213.3 533.748 212.867C533.891 212.435 533.948 211.978 533.914 211.524C533.881 211.069 533.759 210.626 533.555 210.219C533.038 209.203 532.141 208.431 531.059 208.07C529.978 207.71 528.798 207.791 527.775 208.295C526.492 208.939 525.518 210.067 525.066 211.429C524.614 212.791 524.721 214.278 525.364 215.561C525.762 216.356 526.313 217.064 526.985 217.646C527.657 218.227 528.437 218.671 529.28 218.951C530.124 219.231 531.014 219.341 531.901 219.277C532.787 219.212 533.652 218.974 534.446 218.575C535.439 218.077 536.324 217.388 537.051 216.548C537.778 215.708 538.332 214.733 538.681 213.678C539.031 212.624 539.169 211.511 539.089 210.403C539.008 209.295 538.71 208.214 538.211 207.222C536.953 204.716 534.75 202.813 532.089 201.93C529.427 201.048 526.524 201.258 524.018 202.515C522.462 203.288 521.074 204.361 519.935 205.673C518.796 206.984 517.929 208.509 517.382 210.158C516.835 211.807 516.621 213.548 516.751 215.28C516.881 217.012 517.353 218.702 518.139 220.251C528.675 240.612 567.465 225.246 567.952 245.897" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M594.334 248.291C594.737 248.497 595.044 248.853 595.186 249.283C595.328 249.713 595.295 250.181 595.093 250.587C594.838 251.094 594.393 251.479 593.854 251.659C593.316 251.838 592.728 251.797 592.22 251.545C591.906 251.387 591.626 251.169 591.397 250.903C591.167 250.637 590.992 250.329 590.882 249.995C590.771 249.662 590.728 249.31 590.753 248.959C590.779 248.609 590.873 248.267 591.031 247.953C591.224 247.558 591.494 247.205 591.825 246.915C592.157 246.625 592.542 246.405 592.96 246.266C593.378 246.128 593.819 246.074 594.258 246.109C594.696 246.143 595.124 246.265 595.515 246.467C596.009 246.708 596.45 247.046 596.813 247.46C597.175 247.874 597.451 248.357 597.624 248.879C597.797 249.401 597.864 249.953 597.821 250.501C597.777 251.05 597.625 251.584 597.372 252.073C597.065 252.686 596.641 253.232 596.123 253.68C595.605 254.128 595.003 254.47 594.353 254.685C593.702 254.901 593.016 254.986 592.333 254.936C591.649 254.886 590.982 254.702 590.371 254.393C589.603 254.01 588.919 253.479 588.358 252.831C587.796 252.183 587.368 251.43 587.098 250.617C586.828 249.803 586.722 248.944 586.784 248.088C586.847 247.233 587.078 246.399 587.464 245.633C588.436 243.701 590.135 242.234 592.188 241.554C594.241 240.874 596.48 241.038 598.413 242.008C599.613 242.604 600.684 243.431 601.564 244.443C602.443 245.454 603.113 246.63 603.535 247.902C603.957 249.174 604.123 250.517 604.024 251.854C603.924 253.191 603.56 254.494 602.954 255.69C594.821 271.378 564.89 259.546 564.519 275.506" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M595.935 216.073C596.086 215.929 596.177 215.733 596.189 215.525C596.202 215.316 596.134 215.111 596.001 214.95C595.916 214.852 595.812 214.772 595.696 214.714C595.579 214.656 595.453 214.622 595.323 214.613C595.193 214.605 595.063 214.622 594.94 214.665C594.817 214.707 594.703 214.773 594.606 214.859C594.359 215.079 594.209 215.387 594.188 215.717C594.168 216.046 594.28 216.371 594.499 216.618C594.77 216.927 595.154 217.114 595.564 217.141C595.974 217.167 596.378 217.03 596.687 216.759C597.071 216.415 597.304 215.933 597.335 215.418C597.366 214.903 597.192 214.397 596.852 214.009C596.642 213.77 596.388 213.574 596.102 213.433C595.817 213.292 595.507 213.209 595.189 213.188C594.872 213.168 594.553 213.21 594.252 213.312C593.951 213.415 593.672 213.576 593.434 213.786C592.83 214.321 592.464 215.074 592.414 215.878C592.365 216.683 592.636 217.475 593.169 218.08C593.497 218.455 593.896 218.762 594.343 218.982C594.789 219.203 595.275 219.333 595.772 219.365C596.27 219.397 596.768 219.331 597.24 219.17C597.711 219.009 598.146 218.756 598.52 218.426C598.988 218.013 599.37 217.511 599.644 216.949C599.918 216.388 600.078 215.778 600.116 215.154C600.153 214.53 600.067 213.906 599.863 213.315C599.658 212.725 599.34 212.18 598.924 211.714C593.409 205.595 581.379 214.48 579.314 207.346" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M558.887 220.607C558.677 220.606 558.475 220.685 558.322 220.828C558.169 220.97 558.076 221.166 558.061 221.375C558.052 221.638 558.148 221.895 558.327 222.088C558.506 222.281 558.755 222.396 559.019 222.407C559.182 222.412 559.346 222.385 559.499 222.328C559.652 222.27 559.793 222.183 559.913 222.071C560.032 221.959 560.129 221.825 560.196 221.675C560.264 221.526 560.301 221.365 560.307 221.201C560.32 220.995 560.292 220.788 560.224 220.592C560.156 220.396 560.05 220.216 559.911 220.062C559.773 219.909 559.605 219.784 559.418 219.696C559.23 219.608 559.027 219.558 558.82 219.55C558.304 219.534 557.803 219.723 557.425 220.076C557.048 220.429 556.825 220.916 556.806 221.432C556.788 222.069 557.023 222.687 557.459 223.151C557.895 223.615 558.498 223.888 559.134 223.909C559.94 223.936 560.723 223.643 561.312 223.093C561.902 222.544 562.25 221.783 562.28 220.978C562.3 220.481 562.222 219.984 562.049 219.518C561.877 219.051 561.614 218.622 561.276 218.257C560.937 217.892 560.53 217.597 560.078 217.39C559.625 217.182 559.136 217.066 558.639 217.048C558.012 217.019 557.385 217.115 556.795 217.331C556.205 217.546 555.664 217.877 555.203 218.303C554.743 218.73 554.371 219.243 554.11 219.814C553.85 220.386 553.705 221.003 553.685 221.631C553.478 229.887 568.316 231.704 564.898 238.301" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M557.986 290.235C557.767 290.235 557.557 290.322 557.402 290.477C557.248 290.632 557.161 290.842 557.161 291.061C557.161 291.324 557.265 291.577 557.45 291.764C557.636 291.951 557.888 292.057 558.151 292.06C558.481 292.057 558.797 291.926 559.031 291.692C559.264 291.459 559.396 291.143 559.398 290.813C559.399 290.609 559.36 290.407 559.283 290.218C559.206 290.029 559.093 289.858 558.949 289.713C558.806 289.568 558.636 289.453 558.448 289.374C558.26 289.295 558.058 289.253 557.854 289.252C557.337 289.252 556.842 289.458 556.476 289.823C556.111 290.189 555.906 290.684 555.906 291.201C555.898 291.523 555.955 291.844 556.073 292.145C556.191 292.445 556.368 292.718 556.593 292.949C556.819 293.18 557.088 293.363 557.386 293.488C557.683 293.614 558.002 293.678 558.325 293.678C559.132 293.676 559.904 293.354 560.474 292.783C561.043 292.212 561.363 291.438 561.363 290.631C561.366 290.133 561.269 289.64 561.08 289.179C560.891 288.718 560.613 288.299 560.262 287.947C559.91 287.594 559.493 287.314 559.033 287.122C558.573 286.931 558.08 286.833 557.582 286.833C556.957 286.832 556.339 286.954 555.762 287.193C555.185 287.432 554.66 287.782 554.219 288.224C553.778 288.666 553.429 289.191 553.191 289.768C552.953 290.346 552.832 290.964 552.834 291.589C552.908 299.846 567.812 301.142 564.625 307.855" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M582.386 281.633C582.506 281.461 582.557 281.251 582.527 281.044C582.498 280.838 582.392 280.649 582.23 280.518C582.019 280.359 581.754 280.29 581.493 280.325C581.231 280.361 580.995 280.498 580.834 280.708C580.636 280.973 580.551 281.306 580.598 281.634C580.644 281.962 580.818 282.258 581.082 282.458C581.412 282.706 581.826 282.812 582.235 282.755C582.643 282.698 583.013 282.481 583.262 282.153C583.569 281.739 583.7 281.221 583.628 280.711C583.555 280.2 583.284 279.739 582.874 279.428C582.619 279.235 582.33 279.095 582.021 279.014C581.713 278.934 581.391 278.915 581.075 278.958C580.759 279.002 580.455 279.108 580.18 279.269C579.905 279.43 579.664 279.644 579.472 279.899C578.99 280.545 578.783 281.355 578.896 282.153C579.009 282.951 579.432 283.672 580.075 284.159C580.471 284.46 580.924 284.68 581.406 284.805C581.888 284.931 582.39 284.96 582.884 284.891C583.377 284.822 583.852 284.656 584.281 284.403C584.71 284.15 585.085 283.814 585.384 283.416C585.76 282.918 586.035 282.35 586.192 281.745C586.349 281.141 586.384 280.511 586.297 279.893C586.209 279.274 586 278.679 585.682 278.142C585.364 277.604 584.943 277.135 584.442 276.761C577.837 271.881 567.805 282.995 564.354 276.414" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M601.352 189.643C601.706 189.822 601.974 190.134 602.098 190.51C602.221 190.886 602.191 191.296 602.013 191.65C601.79 192.084 601.406 192.414 600.943 192.568C600.48 192.722 599.974 192.689 599.536 192.475C599.261 192.338 599.017 192.149 598.816 191.918C598.616 191.686 598.463 191.417 598.366 191.127C598.269 190.836 598.231 190.529 598.253 190.223C598.275 189.918 598.358 189.62 598.495 189.346C598.844 188.657 599.451 188.133 600.185 187.89C600.918 187.647 601.718 187.705 602.409 188.05C602.84 188.262 603.225 188.557 603.542 188.918C603.858 189.279 604.1 189.699 604.254 190.154C604.407 190.609 604.469 191.09 604.436 191.569C604.403 192.049 604.275 192.516 604.06 192.946C603.792 193.48 603.421 193.956 602.969 194.347C602.517 194.738 601.992 195.036 601.424 195.223C600.857 195.411 600.258 195.486 599.662 195.442C599.066 195.398 598.484 195.237 597.95 194.969C597.282 194.634 596.687 194.171 596.198 193.606C595.709 193.04 595.336 192.385 595.101 191.675C594.865 190.966 594.772 190.217 594.826 189.472C594.88 188.727 595.08 187.999 595.415 187.331C595.835 186.496 596.414 185.751 597.121 185.14C597.828 184.528 598.648 184.062 599.535 183.768C600.422 183.473 601.359 183.356 602.291 183.424C603.223 183.491 604.133 183.742 604.969 184.161C606.016 184.681 606.95 185.403 607.717 186.286C608.484 187.169 609.068 188.196 609.436 189.306C609.803 190.416 609.947 191.588 609.859 192.754C609.772 193.92 609.453 195.058 608.924 196.1C601.831 209.798 575.731 199.461 575.409 213.357" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M583.427 148.433C584.583 147.995 585.904 149.085 585.284 150.695C585.194 150.921 585.059 151.125 584.887 151.297C584.715 151.469 584.511 151.604 584.285 151.694C583.871 151.85 583.421 151.886 582.987 151.8C582.553 151.713 582.152 151.507 581.829 151.205C581.505 150.903 581.272 150.517 581.156 150.09C581.041 149.663 581.046 149.212 581.173 148.788C581.286 148.219 581.561 147.695 581.965 147.278C582.37 146.862 582.886 146.572 583.451 146.443C586.16 145.832 589.025 148.433 587.464 152.173C587.239 152.723 586.902 153.219 586.476 153.633C586.05 154.046 585.543 154.367 584.987 154.576C583.576 155.11 582.01 155.062 580.634 154.443C579.258 153.823 578.184 152.684 577.647 151.273C576.981 149.509 577.042 147.553 577.816 145.834C578.59 144.114 580.014 142.772 581.775 142.1C583.984 141.303 586.416 141.397 588.556 142.364C590.696 143.33 592.374 145.093 593.236 147.277C594.813 158.597 587.365 164.947 582.13 182.03L569.266 239.002C565.353 256.332 563.655 274.088 564.213 291.846L565.336 327.35" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            <path d="M38.1791 237.49C-42.6469 176.101 10.4033 -12.7824 157.631 10.1221C304.858 33.0265 482.892 363.811 678.57 0.213867" stroke="#282828" stroke-width="0.825683" stroke-miterlimit="10"/>
            </g>
            <defs>
            <clipPath id="clip0_5079_30288">
            <rect width="704.2" height="389.772" fill="white"/>
            </clipPath>
            </defs>
        </svg>
    </div>
  );
};

export default KeyFeatures;