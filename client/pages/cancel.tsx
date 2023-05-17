import Image from "next/image";

const CancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-indigo-500">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">Cancellation Successful</h1>
            <p className="text-xl md:text-2xl text-white mb-16">{`We're sorry to see you go!`}</p>
            <Image
                src="/cancel-image.jpg"
                alt="Cancellation"
                className="w-64 h-64 md:w-96 md:h-96 rounded-full shadow-lg"
            />
            <p className="text-xl md:text-2xl text-white mt-16">
                Thank you for being with us. If you have any feedback, please let us know.
            </p>
        </div>
    );
};

export default CancelPage;
