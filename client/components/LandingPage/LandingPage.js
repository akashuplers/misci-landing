import { useState } from "react";
import ReactLoading from "react-loading";
import TextareaAutosize from "react-textarea-autosize";
const logos = ["/Logo1", "/Logo2", "/Logo3", "/Logo4", "/Logo5"];

import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination } from "swiper";

import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import Image from "next/image";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { QuoteOpen, StarIcon } from "../localicons/localicons";
const imagesForScreenShots = {
    home: "/screenshots/home.png",
    publish: "/publinkedinblog.png",
    regenerate: "/regenerate.png",
    creditsfilters: "/screenshots/creditsfilters.png",
    filterresults: "/filterresults.png",
    credits: "/screenshots/credits.png",
    filter: "/filter.png",
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
const teamDesktop = "/screenshots/teamworks.png";
const Lillesteps = [
    {
        step: 1,
        description: "Search Anything",
        details: "Simply type in any keyword or topic of interest into the search input field and our website will present you with a comprehensive list of articles, guides, and case studies that match your search query.",
        image: imagesForScreenShots["home"]
    },
    {
        step: 2,
        description: "Get Fresh Ideas",
        details: `Lille offers you a cool feature where you can click on 'Fresh Ideas' to enter your relevant keywords
        and Lille will fetch new ideas that you can select to regenerate and take the content to next level.
        You can also upload a URL of a web page containing relevant content or upload a file to obtain the fresh ideas`,
        image: imagesForScreenShots["home"]
    },
    {
        step: 3,
        description: "Select fresh ideas",
        details: "Once you have some exciting fresh ideas, its time to select some or all of them or make a combination of used ideas and fresh ideas before you regenerate.",
        image: imagesForScreenShots["home"]
    },
    {
        step: 4,
        description: "Click on Regenerate",
        details: "After you've selected the ideas you want to focus on, its time to let Lille do its magic. Just click on the regenerate button, and our powerful algorithm will generate a whole new blog post based on the ideas you've selected. It's that easy!",
        image: imagesForScreenShots["home"]
    },
    {
        step: 5,
        description: "Publish",
        details: "Click on Publish. And last but not least, it's time to share your new post with the world. Simply click on the publish button, and your post will be available to read on your website. And why stop there? You also have the option to share your post on LinkedIn and Twitter to reach an even wider audience.",
        image: imagesForScreenShots["home"]
    }
];


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

const testimonialData = [
    {
        name: 'Lora Smith',
        message: `I been impressed by the quality and relevance of the content
    at Lille. It has provided me with countless ideas, fresh
    perspectives, and of motivation to grow both personally and
    professionally.`,
        image: imagesForScreenShots["customer"]
    },
    {
        name: 'Lora Smith',
        message: `I been impressed by the quality and relevance of the content
    at Lille. It has provided me with countless ideas, fresh
    perspectives, and of motivation to grow both personally and
    professionally.`,
        image: imagesForScreenShots["customer"]
    }, {
        name: 'Lora Smith',
        message: `I been impressed by the quality and relevance of the content
    at Lille. It has provided me with countless ideas, fresh
    perspectives, and of motivation to grow both personally and
    professionally.`,
        image: imagesForScreenShots["customer"]
    },
    {
        name: 'Lora Smith',
        message: `I been impressed by the quality and relevance of the content
    at Lille. It has provided me with countless ideas, fresh
    perspectives, and of motivation to grow both personally and
    professionally.`,
        image: imagesForScreenShots["customer"]
    },
    {
        name: 'Lora Smith',
        message: `I been impressed by the quality and relevance of the content
    at Lille. It has provided me with countless ideas, fresh
    perspectives, and of motivation to grow both personally and
    professionally.`,
        image: imagesForScreenShots["customer"]
    }
]


const welcomeImage = "/welcome.svg";
const lilleLogo = "/lille_logo_new.png";
const teamImage = "/team.svg";
const whyChoseus = [
    {
        title: "Automated Backlinking",
        description: `Lille.ai isn't just a content generation tool, it's a powerful partner in your SEO strategy. By leveraging existing URLs on your website, Lille.ai automates the process of backlinking, saving you time and boosting your SEO performance.`,
        icon: "/featuresIcon/backlinking.svg",
    },
    {
        title: `Content Generation from Various Formats`,
        description: `Lille.ai isn't just a content generation tool, it's a powerful partner in your SEO strategy. By leveraging existing URLs on your website, Lille.ai automates the process of backlinking, saving you time and boosting your SEO performance.`,
        icon: "/featuresIcon/formats.svg",
    },

    {
        title: `Tailored Social Media Posts`,
        description: `With Lille.ai, you can supercharge your social media presence. The tool generates and optimizes post ideas for Blogs, Twitter and LinkedIn, tailored to your brand and audience. This can lead to increased engagement, more followers, and more traffic to your website.`,
        icon: "/featuresIcon/tailored.svg",
    },
    {
        title: "Trending Topic Discovery",
        description: `Stay ahead of the curve with Lille.ai's ability to discover trending topics relevant to your brand and audience. This helps you create content that resonates with your audience and keeps them coming back for more.`,
        icon: "/featuresIcon/discovery.svg",
    },
];
const initalState = {
    name: "",
    email: "",
    interestedTopics: "",
};
const specialCharsRegex = /[^a-zA-Z0-9,.\s]/g;


const numberRegex = /\d/;

function hasSpecialChars(str) {
    return specialCharsRegex.test(str);
}

function hasNumbers(str) {
    return numberRegex.test(str);
}


const LandingPage = () => {
    const [sendLoading, setSendLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(initalState);
    const [inputErrors, setInputErrors] = useState({});
    function handleUserDetailsInputChange(event) {
        const { name, value } = event.target;
        let errors = {};

        if (name === 'interestedTopics') {
            const characterNotAllowed = ['@', '#', '$', '%', '^', '&', '*', '(', ')']
            const hasSpecialCharacter = characterNotAllowed.some((character) => value.includes(character));
            if (hasSpecialCharacter) {
                errors[name] = "Your message should not contain special characters like @, #, $, %, ^, &, *, (, ), etc.";
            }
            // check if the words should not be more than 5
            // split by space,
            // check if the length is more than 5
            const words = value.split(' ');
            if (words.length > 5) {
                errors[name] = "Interested topics should not be more than 5.";
            }
        }

        if (name === 'name') {
            const hasNumber = hasNumbers(value);
            if (hasNumber) {
                errors[name] = "Name should not contain numbers.";
            }
        }

        setUserDetails((prevUserDetails) => ({
            ...prevUserDetails,
            [name]: value,
        }));

        setInputErrors(errors);
    }

    function scrollToUserDemo() {
        const userDemoElement = document.querySelector('.userDemo');
        userDemoElement.scrollIntoView({ behavior: 'smooth' });
    }

    const handleSubmit = (e) => {
        const URL = API_BASE_PATH + API_ROUTES.TEMP_USER;
        e.preventDefault();
        setSendLoading(true);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const body = {
            name: userDetails.name,
            email: userDetails.email,
            topics: userDetails.interestedTopics,
        };
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
        };
        fetch(URL, requestOptions)
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((result) => {
                console.log("RESULTS");
                console.log(result);
                const type = result.type;
                const typeOFTypes = { success: "SUCCESS", error: "ERROR" };
                if (type === typeOFTypes.success) {
                    toast.success(
                        "Thank you for your interest. We will get back to you soon."
                    );
                } else {
                    type === typeOFTypes.error && toast.error(result.message);
                }
                setSendLoading(false);
            });
    };
    const handleDemoClick = () => {
        // check all fields are filled
    };

    return (
        <>
            <div className="hidden xl:block 2xl:mt-[10rem]">
                {/* <SectionSpacer /> */}
            </div>
            {/* <div className="w-full h-[195px]    flex-col justify-start items-center gap-4 inline-flex">
                <div className="h-[81px] flex-col justify-start items-center gap-2 flex">
                    <div className="w-full self-stretch text-center text-slate-800 text-2xl lg:text-[48px] font-bold leading-10">
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
                        <div
                            key={logo}
                            className="w-[150px] h-[98px] flex justify-center items-center"
                        >
                            <img src={logo + ".svg"} alt="logo" />
                        </div>
                    ))}
                </div>
            </div> */}
            {/* ABOUT US */}
            <SectionSpacer />
            {/* <div className="relative bg-gradient-to-b from-violet-50 to-violet-50 pt-20">
                {/*  <div className="flex lg:flex-row flex-col mx-auto max-w-5xl items-center justify-center lg:justify-between">
                    <div className="lg:w-[40%] flex flex-col lg:gap-16 items-center justify-center lg:justify-between lg:block">
                        <div className="w-full flex-col justify-start items-center ">
                            <div className="h-14 text-slate-800  text-2xl lg:text-5xl text-center lg:text-start font-bold leading-10">
                                About us
                            </div>
                        </div>
                        <div className="opacity-70  text-center lg:text-start text-slate-600 text-[16px] font-normal leading-7">
                            {`Lille is your secret weapon for automating backlinking by leveraging existing URLs on your website. Plus, it can read word documents, text files, and PDFs to generate fresh, engaging content.`}
                        </div>
                        <button className="pl-[30px] pr-6 py-[17px] mt-9 lg:w-full  rounded-lg shadow border  border-indigo-600 justify-center items-center gap-2.5 flex"
                            onClick={scrollToUserDemo}
                        >
                            <span className="text-indigo-600 text-[18px] font-semibold">
                                Start for free
                            </span>
                            <ArrowRightIcon className="w-5 h-5 text-indigo-600" />
                        </button>
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
                <div className="lg:hidden w-[352.08px] h-[194.15px]">
                    <img src={teamImage} alt="team" className="w-full h-full" />
                </div>
                <div className="w-full h-[465.26px] hidden lg:flex items-center justify-center">
                    <img src={teamDesktop} alt="team" className="w-full h-full" />
                </div>
            </div> */}

            <div
                className="w-full h-full lg:p-20 relative  rounded-2xl shadow justify-center items-center flex flex-col pt-14 lg:py-14 lg:px-7"
                style={{
                    backgroundImage: "linear-gradient(138deg, #4A3AFE 0%, #6883FF 100%)",
                }}
            >
                <div className="h-[136px] flex-col justify-center items-center gap-6 inline-flex lg:px-0 px-2">
                    <div className="self-stretch h-14 text-center text-white text-[28px] lg:text-[48px] font-bold leading-10 tracking-wide">
                        <span className="hidden lg:block"> Remarkable Features </span>
                        <span className="lg:hidden text-[28px]"> Why Choose Us</span>
                    </div>
                    <div className="lg:w-[803.89px] opacity-80 text-center text-white text-[16px] font-normal leading-7 tracking-wide">
                        Lille is a unique platform dedicated to enriching your online
                        experience by providing an engaging combination of informative
                        content and interactive discussions.
                    </div>
                </div>
                <div
                    className="hidden lg:flex border py-[64.05px] bg-white mt-10 rounded-2xl shadow justify-center items-center lg:py-11 px-7"
                    style={{
                        background: "#fff",
                        boxShadow: "0px 10px 20px 0px rgba(0, 0, 0, 0.20)",
                    }}
                >
                    <div className="self-stretch justify-around  items-center gap-4 lg:gap-[38px] flex lg:flex-row flex-col">
                        {whyChoseus.map((item) => {
                            return (
                                <div
                                    key={item.title}
                                    className="flex-col justify-start items-center gap-5 inline-flex"
                                >
                                    <div className="self-stretch h-full flex-col justify-start items-center gap-3 flex">
                                        <img src={item.icon} className="w-12 h-12" />
                                        <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                                            {item.title}
                                        </div>
                                        <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='lg:hidden block w-full h-full'>
                    <Swiper
                        pagination={true}
                        modules={[Pagination]}
                        className="lg:hidden w-full border py-[64.05px] bg-white mt-10 rounded-2xl shadow justify-center items-center flex p-7 lg:p-0 lg:py-11 "
                        style={{
                            background: "#fff",
                            boxShadow: "0px 10px 20px 0px rgba(0, 0, 0, 0.20)",
                        }}
                    >
                        <div className="max-w-screen justify-around  items-center gap-4 lg:gap-[38px] flex lg:flex-row flex-col">
                            {whyChoseus.map((item) => {
                                return (
                                    <SwiperSlide
                                        key={item.title}
                                        className="flex-col justify-start items-center gap-5 inline-flex px-9 py-10"
                                    >
                                        <div className="self-stretch h-full flex-col justify-start items-center gap-3 flex">
                                            <Image
                                                src={item.icon}
                                                alt={item.title}
                                                width={48}
                                                height={48}
                                            />
                                            <div className="self-stretch text-center text-slate-800 text-[24px] font-medium leading-9">
                                                {item.title}
                                            </div>
                                            <div className="self-stretch opacity-80 text-center text-slate-600 text-[16px] font-normal leading-7">
                                                {item.description}
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </div>
                    </Swiper>
                </div>
            </div>
            <SectionSpacer />
            <div className="hidden w-full h-[2465.15px] text-center lg:px-[130px] flex-col justify-start items-center gap-5 lg:gap-[60px] lg:flex">
                <div className="self-stretch h-[95px] flex-col justify-start items-center gap-6 flex">
                    <div>
                        <span className="text-slate-800 text-2xl md:text-[48px] font-bold leading-10">
                            How{" "}
                        </span>
                        <span className="text-indigo-600 text-2xl md:text-[48px] font-bold leading-10">
                            Lille
                        </span>
                        <span className="text-slate-800 text-2xl md:text-[48px] font-bold leading-10">
                            {" "}
                            works
                        </span>
                    </div>
                    <div className="opacity-70 text-center text-slate-600 text-[16px] font-normal leading-7">
                        Boost your engagement, increase your followers, and drive more
                        traffic to your website with optimized social media posts.
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
                                    <p className="text-center lg:text-left w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                        Simply type in any keyword or topic of interest into the
                                        search input field and our website will present you with a
                                        comprehensive list of articles, guides, and case studies
                                        that match your search query.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-[578px] h-[430px] bg-white justify-center items-center flex">
                            <div className="grow shrink basis-0 self-stretch px-5 py-[1px] bg-white rounded-2xl  border border-gray-200 justify-center items-center inline-flex">
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
                        <div className="w-[578px] h-[430px] px-5 py-[1px] bg-white rounded-2xl  border border-gray-200 justify-center items-center flex">
                            <img src={imagesForScreenShots["filter"]} />
                        </div>
                        <div className="w-[484px] h-[430.03px] relative">
                            <div className="Designcircle" />
                            <div className="w-[424px] h-56 left-[60px] top-[103.01px] absolute flex-col justify-start items-start gap-5 inline-flex">
                                <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                                    <div className="text-white text-[24px] font-bold">2</div>
                                </div>
                                <div className="flex-col justify-start items-start gap-3 flex">
                                    <div className="text-slate-800 text-[32px] font-medium leading-10">
                                        Get Fresh Ideas
                                    </div>
                                    <p className="text-left w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                        {`Lille offers you a cool feature in which you can enter some
                    keywords relevant to your niche in the new input field and
                    we'll suggest some new ideas that you can use to take your
                    content to the next level.`}
                                    </p>
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
                                    <p className="text-left w-[424px]  opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                        {`Once you have some exciting fresh ideas, its time to select some or all of them or make a combination of used ideas and fresh ideas before you regenerate`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-[578px] h-[430px] px-5 py-[1px] bg-white rounded-2xl border   border-gray-200 justify-center items-center flex">
                            <img
                                className="w-[578px] h-[430px] rounded-2xl"
                                src={imagesForScreenShots["filterresults"]}
                            />
                        </div>
                    </div>
                    <div className="justify-start items-center gap-[117px] inline-flex">
                        <div className="w-[578px] h-[430px] px-[21px] py-[1px] bg-white rounded-2xl border border border border border-gray-200 justify-center items-center flex">
                            <img
                                className="w-[578px] h-[430px] rounded-2xl"
                                src={imagesForScreenShots["regenerate"]}
                            />
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
                                    <p className="text-left w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                        {`After you've selected the ideas you want to focus on, its time to let Lille do its magic. Just click on the
                    regenerate button, and our powerful algorithm will generate
                    a whole new blog post based on the ideas you've selected.
                    It's that easy!`}
                                    </p>
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
                                    <p className="text-left w-[424px] opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                        {`Click on Publish And last but not least, it's time to new
                    post with the world. Simply click on the publish button, and
                    your post will be available to read on your website. And why
                    stop there? You also have the option to share your post on
                    LinkedIn and Twitter to reach an even wider audience.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-[578px] h-[430px] relative bg-white rounded-2xl border border border border border-gray-200">
                            <img
                                className="w-full h-full rounded-2xl"
                                src={imagesForScreenShots["publish"]}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className=" lg:hidden h-full flex-col justify-start items-start gap-10 inline-flex">
                <div className="h-[147px] flex-col justify-start items-center gap-6 flex">
                    <div>
                        <span className="text-slate-800 text-[28px] font-bold leading-10">
                            How{" "}
                        </span>
                        <span className="text-indigo-600 text-[28px] font-bold leading-10">
                            Lille
                        </span>
                        <span className="text-slate-800 text-[28px] font-bold leading-10">
                            {" "}
                            works
                        </span>
                    </div>
                    <div className="self-stretch opacity-70 text-center text-slate-600 text-[16px] font-normal leading-7">
                        One-stop destination for empowering ideas, inspiring stories, and
                        thought-provoking perspectives!
                    </div>
                </div>

                <Swiper
                    pagination={true}
                    modules={[Pagination]} className="lg:hidden w-full border py-[64.05px] bg-white mt-10 rounded-2xl shadow justify-center items-center inline-flex p-7 lg:p-0 lg:py-11 ">

                    <div className="max-w-screen justify-around items-center gap-4 lg:gap-[38px] flex lg:flex-row flex-col">
                        {Lillesteps.map(({ image, description, details, step }) => (
                            <SwiperSlide className="flex-col justify-center items-start gap-5 inline-flex" key={step}>
                                <div className="relative">
                                    <div className="Designcircle" />
                                    <div className="  left-[32px] top-[65px] absolute flex-col justify-start items-start gap-4 inline-flex">
                                        <div className="w-10 px-[13px] py-[2.50px] bg-indigo-600 rounded-[200px] justify-center items-center inline-flex">
                                            <div className="text-white text-[24px] font-bold">{step}</div>
                                        </div>
                                        <div className="self-stretch h-[164px] flex-col justify-start items-start gap-3 flex">
                                            <div className="text-slate-800 text-[24px] font-medium leading-10">
                                                {description}
                                            </div>
                                            <div className="text-center self-stretch opacity-70 text-slate-600 text-[16px] font-normal leading-7">
                                                {details}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className=" bg-white justify-center items-center inline-flex">
                                    <div className="grow shrink basis-0 self-stretch pl-[12.12px] pr-[12.13px] py-[0.61px] bg-white rounded-xl border border-gray-200 justify-center items-center inline-flex">
                                        <div className="grow shrink basis-0 self-stretch px-[1.31px] py-[37.62px] bg-white rounded justify-center items-center inline-flex">
                                            <img className="w-full h-full rounded shadow" src={image} />
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </div>
                </Swiper>
            </div>
            {/* testimonials */}
            <SectionSpacer />
            <div id='testimonial' className=" px-2 w-full  relative bg-blue-50 mobileTestimonial">
                {/* <div className="w-[142.93px] h-[142.93px] left-[-71.48px] top-[495.74px] absolute bg-pink-200 rounded-full blur-[145px]" /> */}
                {/* <div className="w-[110.74px] h-[159.36px] left-[241.31px] top-[60.74px] absolute origin-top-left rotate-[-53.85deg] bg-fuchsia-200 rounded-full blur-[145px]" /> */}
                <div className="mt-20 w-full flex-col justify-start items-center gap-3 inline-flex">
                    <div className="text-center text-slate-800 text-[28px] font-medium leading-10">
                        See what our customers say
                    </div>
                    <div className="flex item-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((item, index) => (
                            <StarIcon key={index} />
                        ))}
                    </div>
                </div>
                <>
                    <Swiper
                        spaceBetween={30}
                        pagination={{
                            clickable: true,
                        }}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 2
                            },
                            1024: {
                                slidesPerView: 3
                            }

                        }}
                        modules={[Pagination]}
                        className="mySwiper bg-white mt-10 rounded-2xl shadow justify-center items-center inline-flex" style={{ paddingBottom: '2rem' }}
                    >
                        {testimonialData.map((user) => (
                            <SwiperSlide
                                key={user.name} // Add a unique key for each slide
                                className="flex-col relative justify-center items-center flex h-full "
                            >
                                <div className=" h-full py-10 px-8 bg-indigo-600 rounded-lg flex-col justify-start items-center gap-6 flex">
                                    <div className="flex flex-col justify-center items-center gap-6">
                                        <span className="text-white">
                                            <QuoteOpen />
                                        </span>
                                        <p className="text-center text-white text-[16px] font-normal leading-snug">
                                            {user.message}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-col h-full justify-start items-center gap-2 flex" style={{
                                    marginTop: '2rem'
                                }}>
                                    <div className="w-[90px] h-[90px] justify-center items-center inline-flex">
                                        <img
                                            className="w-[90px] h-[90px] rounded-full border border-white"
                                            src={user.image}
                                            alt={user.name} // Add alt text for accessibility
                                        />
                                    </div>
                                    <h3 className="text-zinc-800 text-[16px] font-semibold">
                                        {user.name}
                                    </h3>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </>
            </div>
            {/* demo */}
            <SectionSpacer />
            <div className="userDemo hidden lg:flex items-center justify-center w-full h-full ">
                <div className="border w-full p-10 bg-white rounded-2xl shadow justify-between items-center gap-16 flex">
                    <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex-col justify-start items-start flex w-full">
                        <div className="justify-center w-full items-center gap-1 inline-flex">
                            <div className="text-white text-[32px] font-bold leading-10">
                                Welcome to{" "}
                            </div>
                            <img className="w-[89.43px] h-[44.81px]" src={lilleLogo} />
                        </div>
                        <div className="w-[497.21px] relative">
                            <img className="w-full h-full" src={welcomeImage} />
                        </div>
                    </div>
                    <div className="self-stretch flex-col justify-start items-center gap-6 inline-flex w-full">
                        <div className="justify-start items-center gap-3 inline-flex">
                            <div className="text-slate-800 text-[32px] font-bold leading-10">
                                Request a free demo
                            </div>
                        </div>
                        <div className="relative w-full">
                            <div className="flex-col justify-start items-start gap-14 inline-flex w-full">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex-col justify-start items-start gap-6 inline-flex w-full"
                                >
                                    <label htmlFor="name" className="w-full">
                                        <p className="font-medium text-slate-700 pb-2 p-2">Name</p>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={userDetails.name}
                                            onChange={handleUserDetailsInputChange}
                                            className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                            placeholder="e.g John Doe"
                                            required
                                        />


                                        {
                                            inputErrors.name && inputErrors.name != "" ? <span className='text-red-500'>  {
                                                inputErrors.name
                                            } </span> :
                                                <span className='text-red-500'>  {" "}
                                                </span>
                                        }

                                    </label>

                                    <label htmlFor="email" className="w-full">
                                        <p className="font-medium text-slate-700 pb-2 p-2">
                                            Email address
                                        </p>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={userDetails.email}
                                            onChange={handleUserDetailsInputChange}
                                            className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                            placeholder="e.g john@adesign.guy"
                                            required
                                        />
                                        {
                                            inputErrors.email && inputErrors.email != "" && <span className='text-red-500'>  {
                                                inputErrors.email
                                            } </span>
                                        }
                                    </label>

                                    <label className="w-full " htmlFor="interestedTopics">
                                        <p className="font-medium text-slate-700 pb-2 p-2">
                                            How are you planning to use Lille?
                                        </p>
                                        {/* <input
                                            id="interestedTopics"
                                            name="interestedTopics"
                                            type="text"
                                            value={userDetails.interestedTopics}
                                            onChange={handleUserDetailsInputChange}
                                            className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                            placeholder="Write here."
                                            required
                                        /> */}
                                        <TextareaAutosize
                                            id="interestedTopics"
                                            name="interestedTopics"
                                            value={userDetails.interestedTopics}
                                            onChange={handleUserDetailsInputChange}
                                            className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                            placeholder="Write here."
                                            required
                                        />

                                        {
                                            inputErrors.interestedTopics && inputErrors.interestedTopics != "" && <span className='text-red-500'>  {
                                                inputErrors.interestedTopics
                                            } </span>
                                        }
                                    </label>

                                    <button
                                        type="submit"
                                        className="w-full px-5 py-[15px] bg-indigo-600 rounded-lg justify-center items-center gap-2.5 inline-flex disabled:opacity-50"

                                    >
                                        {sendLoading ? <ReactLoading
                                            width={25}
                                            height={25}
                                            round={true}
                                            color={"#2563EB"}
                                        /> :
                                            <span className="text-white text-[18px] font-medium">
                                                Send
                                            </span>
                                        }
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="userDemo lg:hidden flex-col justify-center items-start inline-flex">
                <div className="w-full  relative bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-md">
                    <div className="flex w-full flex-row items-center justify-center">
                        <div className="text-white text-2xl font-bold leading-9">
                            Welcome to{" "}
                        </div>
                        <img className=" h-[36.21px]" src={lilleLogo} />
                    </div>
                    <div className="w-full ">
                        <img className="w-full h-full" src={welcomeImage} />
                    </div>
                </div>
                <div className="h-full w-full flex-col justify-start items-center gap-[24.04px] flex">
                    <div className="justify-start items-center gap-[12.02px] inline-flex">
                        <div className="text-slate-800 text-xl font-bold leading-10">
                            Request a free demo
                        </div>
                    </div>
                    <div className="relative w-full">
                        <form className="flex-col w-full justify-start items-start gap-8 inline-flex"
                            onSubmit={handleSubmit}
                        >
                            <label for="name" className="w-full">
                                <p className="font-medium text-slate-700 pb-2 p-2">Name</p>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={userDetails.name}
                                    onChange={handleUserDetailsInputChange}
                                    className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                    placeholder="e.g sahil"
                                    required
                                />
                                {
                                    inputErrors.name && inputErrors.name != "" ? <span className='text-red-500'>  {
                                        inputErrors.name
                                    } </span> :
                                        <span className='text-red-500'>  {" "}
                                        </span>
                                }
                            </label>
                            <label for="email" className="w-full">
                                <p className="font-medium text-slate-700 pb-2 p-2">
                                    Email address
                                </p>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={userDetails.email}
                                    onChange={handleUserDetailsInputChange}
                                    className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                    placeholder="Enter email address"
                                    required
                                />

                                {
                                    inputErrors.email && inputErrors.email != "" && <span className='text-red-500'>  {
                                        inputErrors.email
                                    } </span>
                                }

                            </label>

                            <label htmlFor="interestedTopics" className="w-full">
                                <p className="font-medium text-slate-700 pb-2 p-2">
                                    How are you planning to use Lille?
                                </p>

                                <TextareaAutosize
                                    id="interestedTopics"
                                    name="interestedTopics"
                                    value={userDetails.interestedTopics}
                                    onChange={handleUserDetailsInputChange}
                                    className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                                    placeholder="Write here."
                                    required
                                />

                                {
                                    inputErrors.interestedTopics && inputErrors.interestedTopics != "" && <span className='text-red-500'>  {
                                        inputErrors.interestedTopics
                                    } </span>
                                }
                                {
                                    inputErrors.interestedTopics && inputErrors.interestedTopics != "" && <span className='text-red-500'>  {
                                        inputErrors.interestedTopics
                                    } </span>
                                }
                            </label>
                            <button
                                className="self-stretch px-[20.03px] disabled:opacity-50 py-[15.03px] bg-indigo-600 rounded-xl justify-center items-center gap-[10.02px] inline-flex"
                            >
                                {
                                    sendLoading ?
                                        <ReactLoading
                                            width={25}
                                            height={25}
                                            round={true}
                                            color={"#2563EB"}
                                        /> :

                                        <span className="text-white text-[18] font-medium">
                                            Send
                                        </span>}
                            </button>
                        </form>
                    </div>
                </div>
            </div >
            {/* footer */}
        </>
    );
};

export default LandingPage;
const SectionSpacer = () => {
    return <div className="my-8"></div>;
};
