import { TimeSavedIcon } from "@/components/localicons/localicons";
import { useEffect, useState } from "react";
import useSendSavedTimeOfUser from "@/hooks/useSendSavedTimeOfUser";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
import { formatMinutesToTimeString } from "@/helpers/helper";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
export function TotalTImeSaved({
  timeSaved,
  blogId,
}:any) 

{
 const [modalIsOpen, setIsOpen] = useState(true);
 const [editedHours, setEditedMinutes] :any = useState({
  minutes: formatMinutesToTimeString(timeSaved).minutes || 0,
  seconds: formatMinutesToTimeString(timeSaved).seconds || 0,
 } as any);
 const [showPannel, setShowPannel] = useState('MAIN');
//  AGREEE, DISAGREE
 const {response, error, loading, sendSavedTime}:any = useSendSavedTimeOfUser();
 useEffect(() => {
  if(response!=null){
    if(response?.type === "SUCCESS"){
      toast.success(response?.message);
    }
    else{
      toast.error(response?.message);
    }

    setIsOpen(false);
  }
  }, [response])
    // Calculate the width for the input box based on the number of characters in the input value
    const getInputWidth = (value) => {
      return value.toString().length * 14 + 24; // Adjust the multiplier and constant as per your preference
    };
  
  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={() => setIsOpen(false)}
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
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[250px]">
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
                className="text-2xl font-bold w-14 border-none outline-0 p-0"
              />{" "}
              minutes and{" "}
              <input
                type="number"
                value={editedHours.seconds}
                onChange={(e) => setEditedMinutes((prev:any)=>{
                  return {
                    ...prev,
                    seconds: e.target.value
                  }
                })}
                style={{ width: getInputWidth(editedHours.seconds) }}
                className="text-2xl font-bold w-14 border-none outline-0 p-0"
              />{" "}
              seconds.
            </p>
            </>
          ) :
  
        <div className="flex flex-col justify-between items-center">
          <p>
            How much time do you believe we have saved for you?
          </p>

          <div className="flex items-center justify-center ">
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
            className="text-2xl font-bold w-14 border-none outline-0"
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
            style={{ width: getInputWidth(editedHours.seconds) }}
            className="text-2xl font-bold w-14 border-none outline-0"
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
          className="ml-2 text-blue-500 underline justify-self-end justify-items-end">
          <ArrowPathIcon className="w-5 h-5" />
          </button>
          </div>
            <button  className="cta-invert  hover:cta max-w-lg"
            onClick={() => {
              sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'disagree');
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
                sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'agree');
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
