import Link from 'next/link';

const IdeaComponent = ({ idea, index, handleCitationFunction, handleInputClick, freshIdeas, setFreshIdeas }) => {
    const handleMouseEnter = () => {
        const refrenceTooltip = document.querySelector(`.refrenceTooltip${index}`);
        refrenceTooltip.classList.remove("hidden");
    };

    const handleMouseLeave = () => {
        const refrenceTooltip = document.querySelector(`.refrenceTooltip${index}`);
        refrenceTooltip.classList.add("hidden");
    };

    const handleCheckboxClick = (e) => {
        console.log(idea);
        const updatedIdeas = freshIdeas.map((el, elIndex) =>
            elIndex === index ? { ...el, used: el.used === 1 ? 0 : 1 } : el
        );
        setFreshIdeas(updatedIdeas);
        handleInputClick(idea?.idea, idea?.article_id, e);
    };

    return (
        <div className="flex pb-3" key={index}>
            <div className="flex justify-between gap-5 w-full">
                <p className="text-[13px]">{idea?.idea}</p>

                <a
                    style={{
                        color: "var(--primary-blue)",
                        alignSelf: "flex-start",
                        position: "relative",
                        marginLeft: "auto",
                        cursor: "pointer",
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {handleCitationFunction(idea?.name)}
                    <div
                        className={`hidden refrenceTooltip${index}`}
                        style={{
                            position: "absolute",
                            top: "100%",
                            right: "0",
                            border: "1px solid",
                            color: "black",
                            backgroundColor: "white",
                            padding: "0.5em",
                            borderRadius: "5px",
                            zIndex: "1",
                        }}
                    >
                        {idea?.name}{" "}
                        {idea?.reference?.type === "article" ? (
                            <a href={idea?.reference?.link} target="_blank" style={{ color: "blue" }}>
                                Link
                            </a>
                        ) : (
                            <Link href={`/dashboard/${idea?.reference?.id}`} target="_blank">
                                Link
                            </Link>
                        )}
                    </div>
                </a>
                <input
                    type="checkbox"
                    className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onClick={handleCheckboxClick}
                    checked={idea?.used}
                />
            </div>
        </div>
    );
};

export default IdeaComponent;
