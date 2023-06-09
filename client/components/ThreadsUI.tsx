/* eslint-disable @next/next/no-html-link-for-pages */
import { useTwitterThreadALertModal } from "@/store/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import TextareaAutosize from "react-textarea-autosize";

const Threads = ({
  threadData,
  setthreadData,
  setPauseTwitterPublish,
  isUserPaid,
  remainingTwitterQuota,
  totalTwitterQuota,
}: any) => {
  // const [threadData, setthreadData] = useState(threadData);
  console.log("THREADS DATA");
  const [hideAddThread, setHideAddThread] = useState(false);
  const {
    isOpen: isTwitterThreadAlertOpen,
    initailText,
    isUserpaid,
    showInitailText,
    textComponent, // component
    toggleModal,
  } = useTwitterThreadALertModal();

  console.log(threadData);
  const addTextArea = () => {
    if (threadData.length === 0) {
      setthreadData([""]);
      return;
    }
    const lastIndex = threadData.length - 1;
    const lastThread = threadData[lastIndex];
    const updatedThreads = [...threadData];
    updatedThreads[lastIndex] = "";
    updatedThreads.push(lastThread);
    setthreadData(updatedThreads);
  };

  const updateTextArea = (index: number, value: number) => {
    if (index === threadData.length) {
    } else {
      const updatedThreads = [...threadData];
      updatedThreads[index] = value;
      setthreadData(updatedThreads);
    }
  };

  const deleteThread = (index: number) => {
    const updatedThreads = [...threadData];
    updatedThreads.splice(index, 1);
    setthreadData(updatedThreads);
  };

  const moveThreadUp = (index: number) => {
    if (index > 0) {
      const updatedThreads = [...threadData];
      [updatedThreads[index - 1], updatedThreads[index]] = [
        updatedThreads[index],
        updatedThreads[index - 1],
      ];
      setthreadData(updatedThreads);
    }
  };

  const moveThreadDown = (index: number) => {
    if (index < threadData.length - 1) {
      const updatedThreads = [...threadData];
      [updatedThreads[index], updatedThreads[index + 1]] = [
        updatedThreads[index + 1],
        updatedThreads[index],
      ];
      setthreadData(updatedThreads);
    }
  };
  const handleDragEnd = (result: any) => {
    setHideAddThread(true);
    if (!result.destination) return;
    const updatedThreads = Array.from(threadData);
    const [removed] = updatedThreads.splice(result.source.index, 1);
    updatedThreads.splice(result.destination.index, 0, removed);

    setthreadData(updatedThreads);
  };

  return (
    <>
      {isTwitterThreadAlertOpen && (
        <div className="border-l-4 rounded-md bg-yellow-50 border-yellow-800 pl-4 flex items-center justify-between w-full py-2">
          <div className="w-[10%]">
            <h1 className="text-2xl font-bold">📜</h1>
          </div>
          <div className="w-[90%] text-yellow-500 text-base">
            {isUserPaid ? (
              <>
                <span>
                  Lille allows <strong>{totalTwitterQuota}</strong> tweets per
                  day. Each thread in the followng twitter threads is a tweet.
                  You can edit/delete threads to optimize publishings, e.g. keep
                  two threads per publishing to publish three times a day.
                </span>
              </>
            ) : (
              <>
                <span>
                  Lille allows <strong>{totalTwitterQuota}</strong> tweets per
                  day. Each thread in the followng twitter threads is a tweet.
                  You can edit/delete threads to optimize publishings, e.g. keep
                  one thread per publishing to publish three times a day.
                </span>
              </>
            )}

            {showInitailText ? (
              <>
                <span>{`You can only create ${remainingTwitterQuota} tweets for  today, you can save for now`}</span>
                <br />{" "}
                <span
                  className={`${
                    remainingTwitterQuota < 1 ||
                    remainingTwitterQuota == undefined ||
                    remainingTwitterQuota == null
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  Currenty you are left with
                  <strong>
                    {remainingTwitterQuota == null ||
                    remainingTwitterQuota == undefined
                      ? 0
                      : remainingTwitterQuota}{" "}
                  </strong>{" "}
                  tweets for today.
                </span>
              </>
            ) : (
              <span>
                We offer the capability of {totalTwitterQuota} tweets in a
                thread at once.
                <Link href="/pricing" className="underline">
                  Click here to upgrade
                </Link>
                if you desire more than {totalTwitterQuota} tweets.
              </span>
            )}
          </div>
        </div>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col items-start justify-center max-h-fit py-2 overflow-auto">
          <div className="flex flex-col w-full">
            <Droppable droppableId="threads">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {threadData
                    .slice(0, threadData.length)
                    .map((thread: any, index: number) => (
                      <Draggable
                        key={index}
                        draggableId={`thread-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(index !== threadData.length + 1 &&
                              provided.dragHandleProps)}
                          >
                            <Thread
                              thread={thread}
                              threadData={threadData}
                              index={index}
                              addTextArea={addTextArea}
                              updateTextArea={updateTextArea}
                              moveThreadUp={moveThreadUp}
                              moveThreadDown={moveThreadDown}
                              deleteThread={deleteThread}
                              setPauseTwitterPublish={setPauseTwitterPublish}
                              setthreadData={setthreadData}
                              isUserPaid={isUserPaid}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {threadData.length > 0 &&
              threadData.length < remainingTwitterQuota && (
                <div>
                  <button
                    onClick={addTextArea}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-5"
                  >
                    + Add Thread
                  </button>
                </div>
              )}

            {threadData.length <= 0 && (
              <div>
                <button
                  onClick={addTextArea}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-5"
                >
                  + Add Thread
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
    </>
  );
};

const MAX_THREAD_COUNT = 280;
function getCharCount(text: string) {
  return text.length;
}
const Thread = ({
  threadData,
  thread,
  index,
  updateTextArea,
  isUserPaid,
  moveThreadUp,
  moveThreadDown,
  deleteThread,
  addTextArea,
  setthreadData,
  setPauseTwitterPublish,
}: any) => {
  const [isHovering, setIsHovering] = useState(false);

  const moveUpAnimation = {
    animation: `move-up 0.3s ease-in-out ${index * 0.1}s`,
  };

  const moveDownAnimation = {
    animation: `move-down 0.3s ease-in-out ${index * 0.1}s`,
  };

  const animationStyle =
    index < threadData.length - 1 ? moveUpAnimation : moveDownAnimation;
  useEffect(() => {
    if (getCharCount(thread) > MAX_THREAD_COUNT) {
      setPauseTwitterPublish(true);
    } else {
      setPauseTwitterPublish(false);
    }
  }, [thread]);
  console.log(isUserPaid);
  console.log("IS USER PAID");
  const paid = true;
  return (
    <div
      key={index}
      tabIndex={-1}
      draggable={true}
      className="thread-item relative w-full min-w-[400px] thread-item min-h-[100px] flex flex-col items-start justify-between cursor-move"
      style={animationStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-row w-full h-full rounded-md my-3 ">
        <div className={`w-[10%] flex items-start justify-center`}>
          <span>
            <p className="text-center">{index + 1} :</p>
          </span>
        </div>
        <div
          className={`max-w-[90%] w-[90%] flex  border  rounded-md justify-between ${
            getCharCount(thread) > MAX_THREAD_COUNT
              ? "border-red-500 border-1 shadow-red-200 shadow-md focus:border-red-700 hover:border-red-700 "
              : "border-gray-300 focus:border-gray-900 hover:border-gray-900 "
          }`}
        >
          <div className={`max-w-[95%] w-[95%]`}>
            <TextareaAutosize
              tabIndex={0}
              className="w-full min-h-full p-2  px-3 py-4 text-black overflow-auto  rounded-md"
              style={{
                wordWrap: "break-word",
                color: "#000000",
                opacity: "1",
                fontWeight: "500",
                resize: "none",
                border: "none",
                outline: "none",
                borderColor: "transparent",
                outlineColor: "transparent",
                boxShadow:
                  getCharCount(thread) > MAX_THREAD_COUNT ? "red" : "none",
              }}
              placeholder="Type your thread here..."
              value={thread}
              readOnly={false}
              minLength={1}
              onChange={(e) => {
                updateTextArea(index, e.target.value);
              }}
            />
            {getCharCount(thread) > MAX_THREAD_COUNT && (
              <div className="text-red-500 text-left w-full flex items-center justify-start text-xs">
                <p className="text-center">
                  Character limit {"("}
                  {MAX_THREAD_COUNT}
                  {")"} exceeded by {getCharCount(thread) - MAX_THREAD_COUNT}{" "}
                  characters
                </p>
              </div>
            )}
          </div>
          {/* {index !== threadData.length - 1 ? ( */}
          <>
            <div
              className={`w-[10%] flex flex-col justify-around items-center rounded-md `}
            >
              {
                <button
                  className={`text-red-700 hover:text-red-900 flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 ${
                    isHovering ? "" : "hidden"
                  } transition duration-300 ease-in-out `}
                  onClick={() => deleteThread(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              }
            </div>
          </>
          {/* ) : ( */}
          {/* <>
            {isUserPaid ? (
              <>
                
              </>
            ) : (
              <> </>
            )}
          </> */}
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default Threads;
