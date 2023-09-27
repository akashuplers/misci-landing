import Link from 'next/link';
const SourceColors = {
    blue: 'bg-blue-800',
    orange: 'bg-red-300',
    yellow: 'bg-yellow-500',
}
function getBgColorForCheckbox(color) {
    //  checked:border-pink-500 checked:bg-pink-500 checked:before:bg-pink-500
    const border = `checked:border-${color}-500`;
    const bg = `checked:bg-${color}-500`;
    const before = `checked:before:bg-${color}-500`;
    return `${border} ${bg} ${before}`;
}
const UsedFilteredIdeaItem = ({
    index,
    idea,
    filteredIdeas,
    setFilteredIdeas,
    ideas,
    idCountMap,
    typeOfIdea,
    setIdeas,
    handleUsedIdeas,
    handleCitationFunction,
}) => {
    let realTypeOfIdea = typeOfIdea;
    if (typeOfIdea == 'web') {
        typeOfIdea = '#EEC800';
    } else if (typeOfIdea == 'url') {
        typeOfIdea = '#F5C6C3';
    } else if (typeOfIdea == 'file') {
        typeOfIdea = '#004AAD';
    }
    getBgColorForCheckbox(typeOfIdea);
    const updatedFilteredIdeas = filteredIdeas.map((el, elIndex) =>
        elIndex === index ? { ...el, used: el.used === 1 ? 0 : 1 } : el
    );
    const handleCheckboxClick = () => {
        setFilteredIdeas(updatedFilteredIdeas);

        const ideasCopy = ideas.map((element) => {
            const found = updatedFilteredIdeas.find((pd) => pd.idea === element.idea);
            return found ? found : element;
        });

        setIdeas(ideasCopy);

        const arr = updatedFilteredIdeas
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
        <div className={`flex pb-3 rounded-none border-none` + " filteredIdeas: " + idea?.idea} key={index}>
            <div className={`mr-1 w-1.5 h-1.5  rounded-full mt-1`}
                  style={{
                    backgroundColor: typeOfIdea,
                    opacity: idea?.used ? 1 : 0.5,
                }}
                  />
            <div className="flex justify-between gap-5 w-full">
                <p className="text-[13px]" style={{
                        textDecoration : !idea?.initailUsed ? "line-through": "none"
                }}>{idea?.idea} </p>
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
                    {idCountMap(idea?.article_id)}
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
                <div class="inline-flex items-start">
                    <label
                        class="relative flex cursor-pointer items-center rounded-full p-3"
                        for="checkbox-1"
                        data-ripple-dark="true"
                    > 
                        <input
                            data-idea-type={realTypeOfIdea}
                            data-idea-color={typeOfIdea}
                            type="checkbox"
                            class={`before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 `} 
                            id="checkbox-1"
                            checked={idea?.used}
                            onClick={handleCheckboxClick}
                            style={{
                                backgroundColor: idea?.used ? typeOfIdea : 'white',
                                opacity: idea?.used ? 1 : 0.5,
                            }}
                        />
                        <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                stroke="currentColor"
                                stroke-width="1"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default UsedFilteredIdeaItem;
