import { TimeSavedIcon } from "@/components/localicons/localicons";
import { useEffect, useState } from "react";
import useSendSavedTimeOfUser from "@/hooks/useSendSavedTimeOfUser";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
import { formatMinutesToTimeString } from "@/helpers/helper";
export function TotalTImeSaved({
  timeSaved,
  blogId,
}) {
 const [modalIsOpen, setIsOpen] = useState(true);
 const [editedHours, setEditedMinutes] = useState({
  minutes: formatMinutesToTimeString(timeSaved).minutes,
  seconds: formatMinutesToTimeString(timeSaved).seconds,
 });
 const {response, error, loading, sendSavedTime} = useSendSavedTimeOfUser();
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <TimeSavedIcon className={"w-20 h-20 mx-auto mb-4"} />
        <h2 className="text-xl font-semibold mb-2 text-center">Great! 👏</h2>
        <p className="text-gray-600 mb-4">
          We have saved your{" "}
          <input
            type="number"
            value={editedHours.minutes}
            onChange={(e) => 
              setEditedMinutes((prev)=>{
                return {
                  ...prev,
                  minutes: e.target.value
                }

              }
              )}
            className="text-2xl font-bold w-14 border-none outline-0"
          />{" "}
          minutes and{" "}
          <input
            type="number"
            value={editedHours.seconds}
            onChange={(e) => setEditedMinutes((prev)=>{
              return {
                ...prev,
                seconds: e.target.value
              }
            })}
            className="text-2xl font-bold w-14 border-none outline-0"
          />{" "}
          seconds.
        </p>
        <div className="flex justify-around">
          <button
          onClick={() => {
            sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'disagree');
          }}
          className="cta-invert hover:cta">
            Disagree 👎
          </button>
          <button 
          onClick={() => {
            sendSavedTime(blogId, `${editedHours.minutes}:${editedHours.seconds}`, 'agree');
          }}
          className="cta  hover:cta-invert">
            Agree 👍
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
