import { TimeSavedIcon } from "@/components/localicons/localicons";
import { useEffect, useState } from "react";
import useSendSavedTimeOfUser from "@/hooks/useSendSavedTimeOfUser";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
import { formatMinutesToTimeString } from "@/helpers/helper";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useUserTimeSaveStore } from "@/store/appState";
import { log } from "console";
import { XMarkIcon } from "@heroicons/react/24/outline";
export function TotalTImeSaved({
  timeSaved,
  blogId,
  refreshDataForUserTime,
  modalIsOpen,
  setIsOpen,
}:any)

{
 const [editedHours, setEditedMinutes] :any = useState({
  minutes: 0,
  seconds: 0,
 } as any);
 const [showPannel, setShowPannel] = useState('MAIN');
//  AGREEE, DISAGREE
 const {response, error, loading, sendSavedTime}:any = useSendSavedTimeOfUser();
 const {userTimeSave, refetchData: userTimeSaveUpdateData, loading:  userTimeSaveLoading, }=   useUserTimeSaveStore();

 useEffect(() => {
  console.log(localStorage);
  // "{"64e60126ea418c6e9b91d921":{"time":30,"blogId":"64e60126ea418c6e9b91d921","save":false},"64e60d8d106856835137055a":{"time":30,"blogId":"64e60d8d106856835137055a","save":false}}"
  const userSaveTimeDataWithBlogIdLS = localStorage.getItem('userSaveTimeDataWithBlogId');
  const userSaveTimeDataWithBlogId = JSON.parse(userSaveTimeDataWithBlogIdLS || '{}');
  console.log(userSaveTimeDataWithBlogId);
  const blogIdData = userSaveTimeDataWithBlogId[blogId] 
  if(blogIdData){
    setEditedMinutes({
      minutes: formatMinutesToTimeString(blogIdData.time).minutes,
      seconds: formatMinutesToTimeString(blogIdData.time).seconds,
    })
  }
 },[])
 useEffect(() => {
  if(response!=null){
    if(response?.type === "SUCCESS"){
      toast.success(response?.message);
      // refreshDataForUserTime();
      userTimeSaveUpdateData();
    }
    else{
      toast.error(response?.message);
      // refreshDataForUserTime();
      userTimeSaveUpdateData();
    }

    setIsOpen(false);
  }
  }, [response])
    // Calculate the width for the input box based on the number of characters in the input value
    const getInputWidth = (value:any) => {
      return value.toString().length * 14 + 24; // Adjust the multiplier and constant as per your preference
    };
  
  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={() => setIsOpen(false)}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
      className="fixed inset-0 top-0 flex items-start justify-center w-full h-full p-4 overflow-auto bg-black bg-opacity-50 z-50"
      overlayClassName="fixed inset-0 z-50"
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: "9999",
        },
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[250px] relative">
        <div className="relative flex items-center justify-end">
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className="absolute top-2 left-2"
        >
          <XMarkIcon className="w-5 h-5 text-indigo-600" />
        </button>

        </div>
        <TimeSavedIcon className={"w-20 h-20 mx-auto mb-4"} />
        <h2 className="text-xl font-semibold mb-2 text-center">Great! 👏</h2>
       {
          showPannel === 'MAIN' ? ( <>
            <p className="text-gray-600 mb-4">
              We have saved your{" "}
              <input
                type="number"
                value={editedHours.minutes}
                onChange={(e) => 
                  setEditedMinutes((prev :any)=>{
                    return {
                      ...prev,
                      minutes: e.target.value
                    }
    
                  }
                  )}
                  style={{ width: getInputWidth(editedHours.minutes) }}
                className="text-2xl font-bold w-14  border border-gray-400 outline-0 p-0"
              />{" "}
              minutes and{" "}<input
                type="number"
                value={editedHours.seconds}
                onChange={(e) => setEditedMinutes((prev:any)=>{
                  return {
                    ...prev,
                    seconds: e.target.value
                  }
                })}
                style={{ width: getInputWidth(editedHours.seconds) }}
                className="text-2xl font-bold w-14  border border-gray-400 outline-0 p-0"
              />{" "}
              seconds.
            </p>
            </>
          ) :
  
        <div className="flex flex-col justify-between items-center">
          <p>
            How much time do you believe we have saved for you?
          </p>

          <div className="flex items-center justify-center "
          style={{
            gap: '0.25rem'
          }}
          >
          <input
            type="number" 
            value={editedHours.minutes}
            onChange={(e) => 
              setEditedMinutes((prev :any)=>{
                return {
                  ...prev,
                  minutes: e.target.value
                }
              }
              )}
              style={{ width: getInputWidth(editedHours.minutes), marginRight: '0.5rem' }}
            className="text-2xl font-bold w-14 border border-gray-400 outline-0"
          />{" "}
          minutes and
          <input
            type="number"
            value={editedHours.seconds}
            onChange={(e) => setEditedMinutes((prev:any)=>{
              return {
                ...prev,
                seconds: e.target.value
              }
            })}
            style={{ width: getInputWidth(editedHours.seconds), marginRight: '0.5rem' }}
            className="text-2xl font-bold w-14 border border-gray-400 outline-0 "
          />{" "}
          seconds.
          {/* self end */}
          <button
          onClick={() => {
            setEditedMinutes((prev:any)=>{
              return {
                ...prev,
                minutes: formatMinutesToTimeString(timeSaved).minutes || 0,
                seconds: formatMinutesToTimeString(timeSaved).seconds || 0,
              }
            }
            )
          }}
          className="ml-2 text-blue-500 underline justify-self-end justify-items-end hover:text-blue-700">
          <ArrowPathIcon className="w-5 h-5 " />
          </button>
          </div>
            <button  className="cta-invert  hover:cta max-w-lg mt-2 hover:shadow-lg"
            onClick={() => {
              setIsOpen(false);
              sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'disagree', true);
            }}
            >
              Done 
            </button>
        </div>
       }

        {
          showPannel === 'MAIN' && <div className="flex justify-between">
            <button
              onClick={() => {
                // sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'disagree');
                setShowPannel('DISAGREE');
              }}  
              className="cta hover:cta-invert">
              Disagree 👎
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'agree', true);
              }}
              className="cta-invert  hover:cta">
              Agree 👍
            </button>
          </div>
        }
      </div>
    </ReactModal>
  );
}
