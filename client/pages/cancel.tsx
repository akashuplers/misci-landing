import Image from "next/image";
import lillelogoLight from "../public/lille_logo_light.png";
const CancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-indigo-500 p-5">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">Cancellation Successful</h1>
            {/* home button */}
            <a href="/" className=" bg-indigo-500 text-white py-2 mt-[20px] rounded-md hover:bg-indigo-700 active:border-2 active:border-indigo-700 active:shadow-md
                px-4 font-semibold text-sm md:text-base m-2
            ">
                Go back to home

            </a>
            <p className="text-xl md:text-2xl text-white mb-16">{`We're sorry to see you go!`}</p>
            <Image
                src={lillelogoLight}
                width={200}
                height={200}
                alt="Cancellation"
                className="w-52 h-52 md:w-52 md:h-52 rounded-full shadow-lg"
            />
            <p className="text-xl md:text-2xl text-white mt-16">
                Thank you for being with us. If you have any feedback, please let us know.
            </p>
            <a href="mailto:info@nowigence.com" className=" bg-indigo-500 text-white py-2 mt-[20px] rounded-md hover:bg-indigo-700 active:border-2 active:border-indigo-700 active:shadow-md
                px-4 font-semibold text-sm md:text-base m-2
            ">
                Contact US
            </a>
        </div>
    );
};

export default CancelPage;
