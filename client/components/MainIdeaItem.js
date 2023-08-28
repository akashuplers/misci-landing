import Link from 'next/link';
import React from 'react';

const MainIdeaItem = ({ index, idea, ideas, setIdeas, handleUsedIdeas, handleCitationFunction }) => {
    const handleCheckboxClick = (e) => {
        const updatedIdeas = ideas.map((el, elIndex) =>
            elIndex === index ? { ...el, used: el.used === 1 ? 0 : 1 } : el
        );
        setIdeas(updatedIdeas);

        const arr = updatedIdeas
            .filter((element) => element.used)
            .map((element) => ({
                text: element.idea,
                article_id: element.article_id,
            }));

        handleUsedIdeas(arr);
    };

    const handleMouseEnter = () => {
        document.querySelector(`.referenceTooltip${index}`).classList.remove('hidden');
    };

    const handleMouseLeave = () => {
        document.querySelector(`.referenceTooltip${index}`).classList.add('hidden');
    };

    return (
        <div className="flex pb-3 usedIdeas" key={index}>
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
                        className={`hidden referenceTooltip${index}`}
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
                    className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-none focus:ring-blue-500"
                    style={{
                        borderRadius: '2px'
                    }}
                    checked={idea?.used}
                    onClick={handleCheckboxClick}
                />
            </div>
        </div>
    );
};

export default MainIdeaItem;
