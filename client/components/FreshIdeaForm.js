import ReactLoading from "react-loading";

const FreshIdeaForm = ({
    postFormData,
    newIdeaLoad,
    ideaType,
    formInput,
    handleFormChange,
    hover,
    handleFileUpload,
}) => {
    return (
        <form onSubmit={postFormData} className="mb-4 mt-1">
            {newIdeaLoad ? (
                // Loading indicator
                <ReactLoading
                    type={"spin"}
                    color={"#2563EB"}
                    height={50}
                    width={50}
                    className={"mx-auto"}
                />
            ) : (
                ideaType === "fresh" && (
                    <div className="flex items-center gap-1 relative mb-[10px] mt-8">
                        <label htmlFor="simple-search" className="sr-only">
                            Search
                        </label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            </div>
                            <input
                                type="text"
                                id="simple-search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  py-[0.75em]"
                                placeholder="To get Fresh Ideas upload topic, URL or File."
                                required
                                value={formInput}
                                onChange={handleFormChange}
                                style={{ fontSize: "1em" }}
                                title="Enter keyword, URL or upload document"
                            />
                        </div>
                        {hover ? (
                            <>
                                <div
                                    className="max-w-sm rounded overflow-hidden shadow-lg india r-0 bg-white mt-15"
                                    style={{
                                        zIndex: 1,
                                        position: "absolute",
                                        right: "0",
                                    }}
                                >
                                    upload a file pdf, docx, txt formats allowed.
                                    Max file size &gt; 3MB
                                </div>
                            </>
                        ) : (
                            <></>
                        )}
                        <label
                            className="cta-invert"
                            style={{
                                background: "none",
                                color: "black",
                                border: "1px solid #b3b3b3",
                            }}
                        >
                            <input
                                type="file"
                                accept="application/pdf, .docx, .txt"
                                max-size="500000"
                                onInput={handleFileUpload}
                                style={{ display: "none" }}
                            />

                            <div className="relative flex flex-col items-center group">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
                                        clipRule="evenodd"
                                    />
                                </svg>

                                <div
                                    className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex z-50 h-full min-w-[250px]"
                                    style={{
                                        right: "-50px",
                                        bottom: "15px",
                                        borderRadius: "10px",
                                    }}
                                >
                                    <span
                                        className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg w-full"
                                        style={{
                                            borderRadius: "10px",
                                        }}
                                    >
                                        Upload a file. pdf, docx and txt formats allowed. Max file size {"<"} 3MB
                                    </span>
                                    <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                                </div>
                            </div>
                        </label>

                        <button type="submit" className="cta-invert">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="sr-only">Search</span>
                        </button>
                    </div>
                )
            )}
        </form>
    );
};

export default FreshIdeaForm;
