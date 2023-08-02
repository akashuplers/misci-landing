import { uploadGoogleDriveURL } from "@/helpers/apiMethodsHelpers";
import useStore from "@/store/store";
import { UserDataResponse } from "@/types/type";
import { useEffect, useState } from "react"
import Modal from "react-modal"
import { toast } from "react-toastify";

const SCREENS_FOR_GD = {
    'MAIN': 0,
    'THANK_YOU': 1,
}
interface Props { showModal: boolean, setShowModal: (showModal: boolean) => void, meeData: UserDataResponse }
export default function GoogleDriveModal({ showModal, setShowModal, meeData} : Props) {
    const [screen, setScreen] = useState(SCREENS_FOR_GD.MAIN);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [userGDUrl, setUserGDUrl] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>(isAuthenticated ? meeData.data.me.email : "");

  useEffect(() => { 
        return () => {
            setScreen(SCREENS_FOR_GD.MAIN);
        }
    }, [])
function handleUploadGoogleDrive(){
    const data = uploadGoogleDriveURL({url: userGDUrl, email: userEmail});
    console.log(data);
    data.then((res) => { 
        toast.success(res.message);
        setScreen(SCREENS_FOR_GD.THANK_YOU);
    } ).catch((err) => {
        toast.error(err.message);
        setScreen(SCREENS_FOR_GD.MAIN);
    }
    )
}
    return (
        <Modal
        isOpen={showModal}
        onRequestClose={() =>{
            setShowModal(false);
            setScreen(SCREENS_FOR_GD.MAIN);
        }}
        ariaHideApp={false}
        className="modalModalWidth sm:w-[38%] max-h-[95%]"
        style={{
            overlay: {
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: "9999",
            },
            content: {
                position: "absolute",
                top: "50%",
                left: "50%",
                right: "auto",
                border: "none",
                background: "white",
                // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
                borderRadius: "8px",
                // width: "100%",
                bottom: "",
                zIndex: "999",
                maxWidth: '55%',
                width: '100%',
                marginRight: "-50%",
                height: '55%',
                transform: "translate(-50%, -50%)",
                padding: "30px",
                paddingBottom: "0px",
            },
        }}
    >
        {
            screen == SCREENS_FOR_GD.MAIN ? 
            <div className='flex items-center justify-center h-full py-10'>
                        <img className="w-[232.75px] h-[178.29px] max-w-[50%] max-h-[70%]" src="./gdrive.gif" style={{
                            maxWidth: '50%',
                            maxHeight: '70%'
                        }}  />
                        <div className="w-full h-full p-6 bg-white rounded-lg flex-col justify-center items-start gap-8 inline-flex">
                            <div className="text-center text-black text-[19px] font-bold leading-normal">Paste URL of Google drive link. Lille will notify on your email</div>
                            <div className="w-full h-full flex-col justify-start items-start gap-6 flex">
                                <div className="self-stretch h-full flex-col justify-start items-start gap-1 flex">
                                    <div className="self-stretch opacity-50 text-black text-sm font-normal">Paste URL</div>
                                    <input 
                                    value={userGDUrl}
                                    onChange={(e) => setUserGDUrl(e.target.value)}
                                    className="self-stretch h-11 p-5 bg-white rounded-lg border border-neutral-200 flex-col justify-center items-start gap-[15px] flex" placeholder="e.g. https://drive.google.com/drive/folders/1UJ7T8n2Ql6q6nX7Xzg2F0Z4S7QZl5Yt2" />

                                </div>
                                {
                                    !isAuthenticated &&
                                    <div className="self-stretch h-full flex-col justify-start items-start gap-1 flex">
                                        <div className="self-stretch opacity-50 text-black text-sm font-normal"> Enter Email</div>
                                        <div className="self-stretch h-11 flex-col justify-start items-start gap-1 flex">
                                            <input 
                                            value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                                            className="self-stretch h-11 p-5 bg-white rounded-lg border border-neutral-200 flex-col justify-center items-start gap-[15px] flex" placeholder="e.g. Kiransingl434a@gmail.com" />
                                        </div>
                                    </div>
                                }
                            </div>
                            <button className="self-stretch h-11 p-5 bg-indigo-600 rounded-lg flex-col justify-center items-center gap-2.5 flex"
                            onClick={handleUploadGoogleDrive}
                            >
                                <div className="justify-center items-center inline-flex">
                                    <div className="px-1 justify-start items-center gap-2.5 flex">
                                        <span className="text-center text-white text-sm font-bold leading-normal">Submit</span>
                                    </div>
                                </div>
                            </button>
                        </div>
            </div> : 
            <>
                        <div className="w-full h-full px-6 py-10 bg-white rounded-lg flex-col justify-center items-center gap-10 inline-flex">
                            <img className="w-[232.75px] h-[178.29px]" src="./thanku.gif" />
                            <div className="self-stretch text-center text-black text-[19px] font-medium leading-normal">Thank you! Lille Team will mail back with a creative blog url</div>
                        </div>
            </>
        }
    </Modal>
    )
}