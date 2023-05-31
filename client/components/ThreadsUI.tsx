import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

const Threads = ({ threadDatas }) => {
    const [threadData, setthreadData] = useState(threadDatas);
    console.log("THREADS DATA");
    console.log(threadDatas);
    const addTextArea = () => {
        if (threadData.length < 20) {
            setthreadData([...threadData, ""]);
        }
    };

    const updateTextArea = (index, value) => {
        const updatedThreads = [...threadData];
        updatedThreads[index] = value;
        setthreadData(updatedThreads);
    };

    const deleteThread = (index) => {
        const updatedThreads = [...threadData];
        updatedThreads.splice(index, 1);
        setthreadData(updatedThreads);
    };

    const moveThreadUp = (index) => {
        if (index > 0) {
            const updatedThreads = [...threadData];
            [updatedThreads[index - 1], updatedThreads[index]] = [
                updatedThreads[index],
                updatedThreads[index - 1],
            ];
            setthreadData(updatedThreads);
        }
    };

    const moveThreadDown = (index) => {
        if (index < threadData.length - 1) {
            const updatedThreads = [...threadData];
            [updatedThreads[index], updatedThreads[index + 1]] = [
                updatedThreads[index + 1],
                updatedThreads[index],
            ];
            setthreadData(updatedThreads);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-2">
            <div className="flex flex-col space-y-4 w-full">
                {threadData.map((thread, index) => (
                    <Thread
                        key={index}
                        thread={thread}
                        threadData={threadData}
                        index={index}
                        addTextArea={addTextArea}
                        updateTextArea={updateTextArea}
                        moveThreadUp={moveThreadUp}
                        moveThreadDown={moveThreadDown}
                        deleteThread={deleteThread}
                    />
                ))}
            </div>
        </div>
    );
};

const Thread = ({
    threadData,
    thread,
    index,
    updateTextArea,
    moveThreadUp,
    moveThreadDown,
    deleteThread,
    addTextArea,
}) => {
    const moveUpAnimation = {
        animation: `move-up 0.3s ease-in-out ${index * 0.1}s`,
      };
    
      const moveDownAnimation = {
        animation: `move-down 0.3s ease-in-out ${index * 0.1}s`,
      };
    
      const animationStyle = index < threadData.length - 1 ? moveUpAnimation : moveDownAnimation;
      const [isEditing, setIsEditing] = useState(false);
      const handleEdit = () => {
        setIsEditing(true);
      }
    
    return (
        <div key={index} className="relative w-full min-w-[400px] thread-item"
            style={animationStyle}
        >
            <div className="flex flex-row w-full h-full rounded-md my-3 ">
                <div className={`w-[10%] flex items-start justify-center`}>
                    <span>
                        <p className="text-center">{index + 1} :</p>
                    </span>
                </div>
                <div className={`w-[85%]`}>
                    <TextareaAutosize
                        className="w-full min-h-full p-2 px-3 py-4 text-black overflow-auto border  border-gray-300 focus:border-gray-900 hover:border-gray-900 rounded-md "
                        style={{
                            wordWrap: "break-word",
                            color: "#000000",
                            opacity: "1",
                            fontWeight: "500",

                        }}
                        placeholder="Type your thread here..."
                        value={thread}
                        minLength={1}
                        onChange={(e) =>{ updateTextArea(index, e.target.value); handleEdit();}}
                    />
                </div>
                <div className={`w-[10%] flex flex-col justify-around items-center`}>
                    {index > 0 && (
                        <button
                            className="text-red-700 hover:text-red-900 flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"

                            onClick={() => deleteThread(index)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                        </button>
                    )}
                    {
                        isEditing && (
                            <button
                            className="text-red-700 hover:text-red-900 flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"

                            onClick={() => deleteThread(index)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                        </button>
                        )
                    }
                    {index > 0 && (
                        <button
                        className="text-gray-700 hover:text-gray-900 flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                            onClick={() => moveThreadUp(index)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>

                        </button>
                    )}
                    {index < threadData.length - 1 && (
                        <button
                            className="text-gray-700 hover:text-gray-900 flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                            onClick={() => moveThreadDown(index)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            {index === threadData.length - 1 && (
                <div>
                    <button
                        onClick={addTextArea}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        + Add Thread
                    </button>
                </div>
            )}
        </div>
    );
};

export default Threads;
